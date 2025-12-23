import { supabase } from './supabase';
import { Order, OrderWithDetails } from '../types';

export const orderService = {
  // Récupérer toutes les commandes d'un utilisateur
  async getUserOrders(userId: string, role: 'buyer' | 'seller' | 'both' = 'both'): Promise<OrderWithDetails[]> {
    let query = supabase
      .from('orders')
      .select(`
        *,
        buyer:profiles!buyer_id(*),
        seller:profiles!seller_id(*),
        service:services(*),
        project:projects(*)
      `);
    
    if (role === 'buyer') {
      query = query.eq('buyer_id', userId);
    } else if (role === 'seller') {
      query = query.eq('seller_id', userId);
    } else {
      query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Récupérer une commande par ID
  async getOrderById(orderId: string): Promise<OrderWithDetails | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:profiles!buyer_id(*),
        seller:profiles!seller_id(*),
        service:services(*),
        project:projects(*)
      `)
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      return null;
    }
    
    return data;
  },
  
  // Créer une nouvelle commande
  async createOrder(order: Partial<Order>): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création de la commande:', error);
      return null;
    }
    
    return data;
  },
  
  // Mettre à jour une commande
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      return null;
    }
    
    return data;
  },
  
  // Accepter une commande
  async acceptOrder(orderId: string): Promise<Order | null> {
    return this.updateOrder(orderId, {
      status: 'confirmed',
      accepted_at: new Date().toISOString(),
    });
  },
  
  // Démarrer une commande
  async startOrder(orderId: string): Promise<Order | null> {
    return this.updateOrder(orderId, {
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });
  },
  
  // Livrer une commande
  async deliverOrder(orderId: string, deliverables: any[]): Promise<Order | null> {
    return this.updateOrder(orderId, {
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      deliverables,
    });
  },
  
  // Demander une révision
  async requestRevision(orderId: string): Promise<Order | null> {
    const order = await this.getOrderById(orderId);
    if (!order || order.revisions_used >= order.revisions_limit) {
      return null;
    }
    
    return this.updateOrder(orderId, {
      status: 'revision_requested',
      revisions_used: order.revisions_used + 1,
    });
  },
  
  // Compléter une commande
  async completeOrder(orderId: string): Promise<Order | null> {
    return this.updateOrder(orderId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  },
  
  // Annuler une commande
  async cancelOrder(orderId: string, cancelledBy: string, reason: string): Promise<Order | null> {
    return this.updateOrder(orderId, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: cancelledBy,
      cancellation_reason: reason,
    });
  },
  
  // Récupérer les statistiques des commandes
  async getOrderStats(userId: string, role: 'buyer' | 'seller'): Promise<{
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    total_amount: number;
  }> {
    const column = role === 'buyer' ? 'buyer_id' : 'seller_id';
    
    const { data, error } = await supabase
      .from('orders')
      .select('status, price')
      .eq(column, userId);
    
    if (error || !data) {
      return {
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        total_amount: 0,
      };
    }
    
    return {
      total: data.length,
      pending: data.filter(o => o.status === 'pending').length,
      in_progress: data.filter(o => o.status === 'in_progress').length,
      completed: data.filter(o => o.status === 'completed').length,
      cancelled: data.filter(o => o.status === 'cancelled').length,
      total_amount: data.reduce((sum, o) => sum + Number(o.price), 0),
    };
  },
};
