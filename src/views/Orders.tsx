import React, { useEffect, useState } from 'react';
import { orderService } from '../services/orderService';
import { OrderWithDetails } from '../types';
import { formatCurrency, formatRelativeDate, getStatusColor, getStatusLabel } from '../utils/format';
import { ShoppingBag, Clock, DollarSign, Package, CheckCircle, XCircle, Filter } from 'lucide-react';

interface OrdersProps {
  userId: string;
  onViewOrder: (orderId: string) => void;
}

const Orders: React.FC<OrdersProps> = ({ userId, onViewOrder }) => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active');
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, revenue: 0 });

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getUserOrders(userId);
      setOrders(data);
      
      setStats({
        total: data.length,
        active: data.filter(o => ['in_progress', 'delivered', 'revision_requested'].includes(o.status)).length,
        completed: data.filter(o => o.status === 'completed').length,
        revenue: data.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.price), 0),
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return ['pending', 'confirmed', 'in_progress', 'delivered', 'revision_requested'].includes(order.status);
    }
    if (activeTab === 'completed') {
      return order.status === 'completed';
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">Mes Commandes</h1>
        <p className="text-neutral-600">Gérez toutes vos commandes en un seul endroit</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="Total" value={stats.total} gradient="from-blue-500 to-blue-600" />
        <StatCard icon={Clock} label="En cours" value={stats.active} gradient="from-purple-500 to-purple-600" />
        <StatCard icon={CheckCircle} label="Terminées" value={stats.completed} gradient="from-green-500 to-green-600" />
        <StatCard icon={DollarSign} label="Revenus" value={formatCurrency(stats.revenue)} gradient="from-orange-500 to-orange-600" />
      </div>

      {/* Tabs */}
      <div className="card p-2">
        <div className="flex gap-2">
          {[
            { key: 'active', label: 'Actives', count: stats.active },
            { key: 'completed', label: 'Terminées', count: stats.completed },
            { key: 'all', label: 'Toutes', count: stats.total },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Liste des commandes */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="bg-neutral-200 h-6 rounded mb-3 w-3/4"></div>
              <div className="bg-neutral-200 h-4 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
          <h3 className="text-xl font-semibold mb-2">Aucune commande</h3>
          <p className="text-neutral-600">Vous n'avez pas encore de commandes dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} onClick={() => onViewOrder(order.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: any; label: string; value: string | number; gradient: string }> = ({
  icon: Icon,
  label,
  value,
  gradient,
}) => (
  <div className="card p-6">
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-sm text-neutral-600">{label}</div>
  </div>
);

const OrderCard: React.FC<{ order: OrderWithDetails; onClick: () => void }> = ({ order, onClick }) => (
  <div onClick={onClick} className="card p-6 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-semibold">{order.title}</h3>
          <span className={`badge ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
        </div>
        <p className="text-neutral-600 text-sm line-clamp-1">{order.description}</p>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-primary-600">{formatCurrency(order.price)}</div>
        <div className="text-xs text-neutral-500">Prix total</div>
      </div>
    </div>

    <div className="flex items-center justify-between pt-4 border-t">
      <div className="flex items-center gap-6 text-sm text-neutral-600">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Délai: {order.delivery_days}j</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          <span>Révisions: {order.revisions_used}/{order.revisions_limit}</span>
        </div>
      </div>
      <div className="text-sm text-neutral-500">
        {formatRelativeDate(order.created_at)}
      </div>
    </div>
  </div>
);

export default Orders;
