import { supabase } from './supabase';
import { Wallet, Transaction, Withdrawal } from '../types';

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
  
  // Créer un portefeuille pour un nouvel utilisateur
  async createWallet(userId: string): Promise<Wallet | null> {
    const { data, error } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        available_balance: 0,
        pending_balance: 0,
        total_earnings: 0,
        total_withdrawn: 0,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création du portefeuille:', error);
      return null;
    }
    
    return data;
  },
  
  // Mettre à jour les paramètres de retrait
  async updateWithdrawalSettings(userId: string, method: string, details: any): Promise<Wallet | null> {
    const { data, error } = await supabase
      .from('wallets')
      .update({
        withdrawal_method: method,
        withdrawal_details: details,
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la mise à jour des paramètres de retrait:', error);
      return null;
    }
    
    return data;
  },
  
  // Récupérer les transactions d'un utilisateur
  async getTransactions(userId: string, limit?: number): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Récupérer les transactions par type
  async getTransactionsByType(userId: string, type: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });
    
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
  
  // Créer un retrait
  async createWithdrawal(userId: string, amount: number, method: string, details: any): Promise<Withdrawal | null> {
    // Vérifier le solde disponible
    const wallet = await this.getWallet(userId);
    if (!wallet || wallet.available_balance < amount) {
      console.error('Solde insuffisant pour le retrait');
      return null;
    }
    
    // Créer le retrait
    const { data, error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: userId,
        amount,
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
      type: 'withdrawal',
      amount: -amount,
      status: 'pending',
      description: 'Demande de retrait',
      currency: wallet.currency || 'XOF',
    });
    
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
  
  // Récupérer les statistiques du portefeuille
  async getWalletStats(userId: string): Promise<{
    total_earned: number;
    total_withdrawn: number;
    total_pending: number;
    total_completed_transactions: number;
  }> {
    const wallet = await this.getWallet(userId);
    const transactions = await this.getTransactions(userId);
    
    if (!wallet) {
      return {
        total_earned: 0,
        total_withdrawn: 0,
        total_pending: 0,
        total_completed_transactions: 0,
      };
    }
    
    return {
      total_earned: wallet.total_earnings,
      total_withdrawn: wallet.total_withdrawn,
      total_pending: wallet.pending_balance,
      total_completed_transactions: transactions.filter(t => t.status === 'completed').length,
    };
  },
};
