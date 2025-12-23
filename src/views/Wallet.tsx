import React, { useState, useEffect } from 'react';
import { Wallet as WalletType, Transaction, TransactionType, PaymentMethod } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { MOBILE_MONEY_PROVIDERS } from '../utils/constants';
import { Wallet as WalletIcon, TrendingUp, Download, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { walletService } from '../services/walletService';

interface WalletProps {
  userId: string;
}

// Valeur par défaut complète pour le wallet
const defaultWallet: WalletType = {
  id: '',
  user_id: '',
  available_balance: 0,
  pending_balance: 0,
  total_earnings: 0,
  total_withdrawn: 0,
  withdrawal_method: null,
  withdrawal_details: null,
  min_withdrawal_amount: 5000,
  successful_withdrawals: 0,
  failed_withdrawals: 0,
  last_withdrawal_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const Wallet: React.FC<WalletProps> = ({ userId }) => {
  const [wallet, setWallet] = useState<WalletType>({
    ...defaultWallet,
    user_id: userId,
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger les données du wallet
  useEffect(() => {
    const loadWalletData = async () => {
      setLoading(true);
      try {
        const walletData = await walletService.getWallet(userId);
        if (walletData) {
          setWallet(walletData);
        }
        
        const transactionsData = await walletService.getTransactions(userId);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Erreur lors du chargement du wallet:', error);
        toast.error('Erreur lors du chargement du portefeuille');
      } finally {
        setLoading(false);
      }
    };
    
    loadWalletData();
  }, [userId]);

  // Données pour le graphique
  const chartData = [
    { name: 'Lun', montant: 15000 },
    { name: 'Mar', montant: 22000 },
    { name: 'Mer', montant: 18000 },
    { name: 'Jeu', montant: 28000 },
    { name: 'Ven', montant: 32000 },
    { name: 'Sam', montant: 25000 },
    { name: 'Dim', montant: 30000 },
  ];

  // ✅ CORRIGÉ - Labels pour TOUS les types de transaction (incluant earning et transfer)
  const transactionTypeLabels: Record<TransactionType, string> = {
    [TransactionType.Deposit]: 'Dépôt',
    [TransactionType.EscrowHold]: 'Blocage Escrow',
    [TransactionType.EscrowRelease]: 'Libération Escrow',
    [TransactionType.Withdrawal]: 'Retrait',
    [TransactionType.Refund]: 'Remboursement',
    [TransactionType.Commission]: 'Commission',
    [TransactionType.Bonus]: 'Bonus',
    [TransactionType.Penalty]: 'Pénalité',
    [TransactionType.Earning]: 'Gain',      // ✅ AJOUTÉ
    [TransactionType.Transfer]: 'Transfert', // ✅ AJOUTÉ
  };

  // Fonction pour obtenir le label du type de transaction
  const getTransactionTypeLabel = (type: TransactionType): string => {
    return transactionTypeLabels[type] || type;
  };

  // Fonction pour obtenir la couleur selon le type
  const getTransactionColor = (type: TransactionType): string => {
    const positiveTypes = [
      TransactionType.Deposit,
      TransactionType.EscrowRelease,
      TransactionType.Refund,
      TransactionType.Bonus,
      TransactionType.Earning,
    ];
    return positiveTypes.includes(type) ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
          Mon Portefeuille
        </h1>
        <p className="text-gray-600">Gérez vos finances avec Mobile Money</p>
      </motion.div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <WalletIcon className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Disponible</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(wallet.available_balance)}</p>
          <p className="text-sm opacity-80 mt-2">Solde disponible</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-500">En attente</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{formatCurrency(wallet.pending_balance)}</p>
          <p className="text-sm text-gray-500 mt-2">Fonds en escrow</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <Download className="w-8 h-8 text-blue-500" />
            <span className="text-sm text-gray-500">Total gagné</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{formatCurrency(wallet.total_earnings)}</p>
          <p className="text-sm text-gray-500 mt-2">Depuis le début</p>
        </motion.div>
      </div>

      {/* Graphique */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <h2 className="text-xl font-semibold mb-4">Évolution des gains</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="montant"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ fill: '#6366f1', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Transactions récentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Transactions récentes</h2>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retirer des fonds
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Aucune transaction pour le moment</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {transaction.amount > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <Download className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {getTransactionTypeLabel(transaction.type)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                  {transaction.amount > 0 ? '+' : ''}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Wallet;
