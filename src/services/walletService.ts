import { supabase } from './supabase';
import { Wallet, Transaction, Withdrawal, TransactionType, PaymentMethod } from '../types';

export const walletService = {
  // Récupérer le portefeuille d'un utilisateur
  async getWallet(userId: string): Promise<Wallet | null> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération du portefeuille:', error);
      return null;
    }
    
    return data;
  },
  
  // Créer un portefeuille pour un utilisateur
  async createWallet(userId: string): Promise<Wallet | null> {
    const { data, error } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        available_balance: 0,
        pending_balance: 0,
        total_earnings: 0,
        total_withdrawn: 0,
        min_withdrawal_amount: 5000,
        successful_withdrawals: 0,
        failed_withdrawals: 0,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création du portefeuille:', error);
      return null;
    }
    
    return data;
  },
  
  // Récupérer les transactions d'un utilisateur
  async getTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Créer une transaction
  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      return null;
    }
    
    return data;
  },
  
  // Déposer des fonds
  async deposit(
    userId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    paymentReference: string
  ): Promise<Transaction | null> {
    const wallet = await this.getWallet(userId);
    if (!wallet) return null;
    
    // Créer la transaction
    const transaction = await this.createTransaction({
      user_id: userId,
      wallet_id: wallet.id,
      type: TransactionType.Deposit,  // ✅ Utilise l'enum
      amount,
      currency: 'XOF',
      status: 'pending',
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      description: 'Dépôt de fonds',
      balance_before: wallet.available_balance,
      balance_after: wallet.available_balance + amount,
    });
    
    if (!transaction) return null;
    
    // Mettre à jour le solde (normalement fait par un webhook de paiement)
    await supabase
      .from('wallets')
      .update({
        available_balance: wallet.available_balance + amount,
      })
      .eq('id', wallet.id);
    
    return transaction;
  },
  
  // Demander un retrait
  async requestWithdrawal(
    userId: string,
    amount: number,
    method: PaymentMethod,
    details: any
  ): Promise<Withdrawal | null> {
    const wallet = await this.getWallet(userId);
    if (!wallet) return null;
    
    // Vérifier le solde disponible
    if (wallet.available_balance < amount) {
      console.error('Solde insuffisant');
      return null;
    }
    
    // Vérifier le montant minimum
    if (amount < wallet.min_withdrawal_amount) {
      console.error('Montant inférieur au minimum');
      return null;
    }
    
    // Créer la demande de retrait
    const { data, error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: userId,
        wallet_id: wallet.id,
        amount,
        currency: 'XOF',
        method,
        details,
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création du retrait:', error);
      return null;
    }
    
    // Créer la transaction correspondante
    await this.createTransaction({
      user_id: userId,
      wallet_id: wallet.id,
      type: TransactionType.Withdrawal,  // ✅ Utilise l'enum au lieu de la string
      amount: -amount,
      currency: 'XOF',  // ✅ Utilise une valeur par défaut au lieu de wallet.currency
      status: 'pending',
      description: 'Demande de retrait',
      balance_before: wallet.available_balance,
      balance_after: wallet.available_balance - amount,
    });
    
    // Mettre à jour le solde (bloquer les fonds)
    await supabase
      .from('wallets')
      .update({
        available_balance: wallet.available_balance - amount,
        pending_balance: wallet.pending_balance + amount,
      })
      .eq('id', wallet.id);
    
    return data;
  },
  
  // Récupérer les retraits d'un utilisateur
  async getWithdrawals(userId: string): Promise<Withdrawal[]> {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des retraits:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Récupérer les statistiques financières
  async getFinancialStats(userId: string): Promise<{
    total_earnings: number;
    available_balance: number;
    pending_balance: number;
    total_withdrawn: number;
    this_month_earnings: number;
  }> {
    const wallet = await this.getWallet(userId);
    if (!wallet) {
      return {
        total_earnings: 0,
        available_balance: 0,
        pending_balance: 0,
        total_withdrawn: 0,
        this_month_earnings: 0,
      };
    }
    
    // Calculer les gains du mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data: monthTransactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', TransactionType.EscrowRelease)  // ✅ Utilise l'enum
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString());
    
    const thisMonthEarnings = monthTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    
    return {
      total_earnings: wallet.total_earnings,
      available_balance: wallet.available_balance,
      pending_balance: wallet.pending_balance,
      total_withdrawn: wallet.total_withdrawn,
      this_month_earnings: thisMonthEarnings,
    };
  },
};
