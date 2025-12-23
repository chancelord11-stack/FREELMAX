import React, { useEffect, useState } from 'react';
import { Wallet as WalletType, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { MOBILE_MONEY_PROVIDERS } from '../utils/constants';
import { Wallet as WalletIcon, TrendingUp, Download, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

interface WalletProps {
  userId: string;
}

const Wallet: React.FC<WalletProps> = ({ userId }) => {
  const [wallet, setWallet] = useState<WalletType>({
    id: '1',
    user_id: userId,
    available_balance: 150000,
    pending_balance: 50000,
    total_earnings: 500000,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'earning', amount: 25000, status: 'completed', created_at: new Date().toISOString() },
    { id: '2', type: 'withdrawal', amount: -15000, status: 'completed', created_at: new Date().toISOString() },
  ]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const chartData = [
    { name: 'Lun', montant: 15000 },
    { name: 'Mar', montant: 22000 },
    { name: 'Mer', montant: 18000 },
    { name: 'Jeu', montant: 28000 },
    { name: 'Ven', montant: 32000 },
    { name: 'Sam', montant: 25000 },
    { name: 'Dim', montant: 30000 },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
          Mon Portefeuille
        </h1>
        <p className="text-gray-600">Gérez vos finances avec Mobile Money</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card p-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white relative overflow-hidden"
        >
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <WalletIcon className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <WalletIcon className="w-8 h-8" />
              <TrendingUp className="w-6 h-6 opacity-50" />
            </div>
            <div className="text-sm opacity-90 mb-2">Solde disponible</div>
            <div className="text-5xl font-bold mb-4">{formatCurrency(wallet.available_balance)}</div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Retirer
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center mb-4">
            <WalletIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-sm text-gray-600 mb-2">En attente</div>
          <div className="text-3xl font-bold">{formatCurrency(wallet.pending_balance)}</div>
          <div className="text-xs text-gray-500 mt-2">Libération sous 14 jours</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-sm text-gray-600 mb-2">Revenus totaux</div>
          <div className="text-3xl font-bold">{formatCurrency(wallet.total_earnings)}</div>
          <div className="text-xs text-green-600 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" />
            +12% ce mois
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h2 className="text-2xl font-bold mb-6">Évolution des revenus</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Line type="monotone" dataKey="montant" stroke="#16a34a" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Phone className="w-6 h-6" />
          Mobile Money
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MOBILE_MONEY_PROVIDERS.map(provider => (
            <div key={provider.id} className="p-4 border-2 border-gray-100 rounded-xl hover:border-primary-300 transition-colors cursor-pointer">
              <Phone className="w-8 h-8 mb-3" style={{ color: provider.color }} />
              <div className="font-semibold text-sm">{provider.name}</div>
              <div className="text-xs text-gray-600">{provider.code}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {showWithdrawModal && (
        <WithdrawModal
          wallet={wallet}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={() => {
            toast.success('Retrait demandé ! Traitement sous 24h');
            setShowWithdrawModal(false);
          }}
        />
      )}
    </div>
  );
};

const WithdrawModal: React.FC<any> = ({ wallet, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState(MOBILE_MONEY_PROVIDERS[0].id);
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) > wallet.available_balance) {
      toast.error('Solde insuffisant');
      return;
    }
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl max-w-md w-full p-8"
      >
        <h3 className="text-3xl font-bold mb-6">Retirer des fonds</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Opérateur</label>
            <div className="grid grid-cols-2 gap-3">
              {MOBILE_MONEY_PROVIDERS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    provider === p.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <Phone className="w-6 h-6 mx-auto mb-2" style={{ color: p.color }} />
                  <div className="text-xs font-medium">{p.name.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Numéro</label>
            <input
              type="tel"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 61234567"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Montant</label>
            <input
              type="number"
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Montant en FCFA"
              min={5000}
              max={wallet.available_balance}
              required
            />
            <p className="text-sm text-gray-600 mt-2">
              Max: {formatCurrency(wallet.available_balance)}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn btn-primary flex-1">Confirmer</button>
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Annuler</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Wallet;
