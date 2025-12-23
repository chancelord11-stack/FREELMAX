import React, { useEffect, useState } from 'react';
import { orderService } from '../services/orderService';
import { messageService } from '../services/messageService';
import { OrderWithDetails, Message } from '../types';
import { formatCurrency, formatRelativeDate, getStatusColor, getStatusLabel, getInitials } from '../utils/format';
import { ArrowLeft, Clock, Package, MessageSquare, CheckCircle, XCircle, Send, FileText, Download } from 'lucide-react';

interface OrderDetailProps {
  orderId: string;
  onBack: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ orderId, onBack }) => {
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderData();
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
      if (data) {
        const convId = messageService.createConversationId(data.buyer_id, data.seller_id);
        const msgs = await messageService.getConversationMessages(convId);
        setMessages(msgs.filter(m => m.order_id === orderId));
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !newMessage.trim()) return;
    
    try {
      const convId = messageService.createConversationId(order.buyer_id, order.seller_id);
      await messageService.sendMessage(convId, order.buyer_id, order.seller_id, newMessage, [], orderId);
      setNewMessage('');
      loadOrderData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading || !order) {
    return <div className="flex justify-center py-20"><div className="spinner w-12 h-12"></div></div>;
  }

  const statusSteps = [
    { key: 'pending', label: 'En attente', icon: Clock },
    { key: 'confirmed', label: 'Confirmée', icon: CheckCircle },
    { key: 'in_progress', label: 'En cours', icon: Package },
    { key: 'delivered', label: 'Livrée', icon: FileText },
    { key: 'completed', label: 'Terminée', icon: CheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="btn btn-secondary">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{order.title}</h1>
                <span className={`badge ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">{formatCurrency(order.price)}</div>
                <div className="text-sm text-neutral-500">Prix total</div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pt-4">
              <div className="flex justify-between">
                {statusSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = i <= currentStepIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        isActive ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-center">{step.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-9 left-0 right-0 h-1 bg-neutral-200 -z-0">
                <div 
                  className="h-full bg-primary-600 transition-all"
                  style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Détails */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Détails de la commande</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-neutral-600 mb-1">Date de création</div>
                <div className="font-medium">{formatRelativeDate(order.created_at)}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">Délai de livraison</div>
                <div className="font-medium">{order.delivery_days} jours</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">Révisions</div>
                <div className="font-medium">{order.revisions_used} / {order.revisions_limit}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">Package</div>
                <div className="font-medium capitalize">{order.package_type || 'Custom'}</div>
              </div>
            </div>
            {order.description && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-neutral-600 mb-2">Description</div>
                <p className="text-neutral-700">{order.description}</p>
              </div>
            )}
          </div>

          {/* Livrables */}
          {order.deliverables && order.deliverables.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Livrables
              </h2>
              <div className="space-y-3">
                {order.deliverables.map((file: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary-600" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                    <button className="btn btn-secondary btn-sm">
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messagerie */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages ({messages.length})
            </h2>
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender_id === order.buyer_id ? 'justify-end' : ''}`}>
                  <div className={`max-w-[70%] ${msg.sender_id === order.buyer_id ? 'order-2' : ''}`}>
                    <div className={`p-4 rounded-2xl ${
                      msg.sender_id === order.buyer_id 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-neutral-100'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    <span className="text-xs text-neutral-500 mt-1 block">
                      {formatRelativeDate(msg.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="Écrire un message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Vendeur</h3>
              <div className="flex items-center gap-3">
                <div className="avatar avatar-lg">
                  {/* ✅ CORRECTION: Ajout de ?. pour éviter l'erreur si seller est undefined */}
                  {getInitials(order.seller?.first_name || '', order.seller?.last_name || '')}
                </div>
                <div>
                  {/* ✅ CORRECTION: Ajout de ?. */}
                  <div className="font-semibold">{order.seller?.first_name}</div>
                  <div className="text-sm text-neutral-600">{order.seller?.headline}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="space-y-2">
                {order.status === 'pending' && (
                  <button className="btn btn-primary w-full">Accepter la commande</button>
                )}
                {order.status === 'in_progress' && (
                  <button className="btn btn-primary w-full">Livrer le travail</button>
                )}
                {order.status === 'delivered' && (
                  <>
                    <button className="btn btn-primary w-full">Accepter</button>
                    <button className="btn btn-secondary w-full">Demander révision</button>
                  </>
                )}
                <button className="btn btn-secondary w-full">Contacter le support</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;