import { supabase } from './supabase';
import { Review } from '../types';

export const reviewService = {
  // Récupérer les avis d'un utilisateur (reçus)
  async getUserReviews(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewed_id', userId)
      .eq('status', 'published')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Récupérer un avis par ID de commande
  async getReviewByOrderId(orderId: string): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('order_id', orderId)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération de l\'avis:', error);
      return null;
    }
    
    return data;
  },
  
  // Créer un nouvel avis
  async createReview(review: Partial<Review>): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création de l\'avis:', error);
      return null;
    }
    
    return data;
  },
  
  // Mettre à jour un avis
  async updateReview(reviewId: string, updates: Partial<Review>): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la mise à jour de l\'avis:', error);
      return null;
    }
    
    return data;
  },
  
  // Répondre à un avis
  async replyToReview(reviewId: string, reply: string): Promise<Review | null> {
    return this.updateReview(reviewId, {
      reply,
      replied_at: new Date().toISOString(),
    });
  },
  
  // Marquer un avis comme utile
  async markReviewHelpful(reviewId: string): Promise<boolean> {
    const { error } = await supabase.rpc('increment_review_helpful', { review_id: reviewId });
    
    if (error) {
      console.error('Erreur lors du marquage de l\'avis comme utile:', error);
      return false;
    }
    
    return true;
  },
  
  // Signaler un avis
  async reportReview(reviewId: string): Promise<boolean> {
    const { error } = await supabase.rpc('increment_review_report', { review_id: reviewId });
    
    if (error) {
      console.error('Erreur lors du signalement de l\'avis:', error);
      return false;
    }
    
    return true;
  },
  
  // Récupérer les statistiques des avis d'un utilisateur
  async getReviewStats(userId: string): Promise<{
    total: number;
    average_rating: number;
    rating_5: number;
    rating_4: number;
    rating_3: number;
    rating_2: number;
    rating_1: number;
  }> {
    const reviews = await this.getUserReviews(userId);
    
    if (reviews.length === 0) {
      return {
        total: 0,
        average_rating: 0,
        rating_5: 0,
        rating_4: 0,
        rating_3: 0,
        rating_2: 0,
        rating_1: 0,
      };
    }
    
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating_overall, 0);
    const average = sum / total;
    
    return {
      total,
      average_rating: Math.round(average * 10) / 10,
      rating_5: reviews.filter(r => r.rating_overall === 5).length,
      rating_4: reviews.filter(r => r.rating_overall === 4).length,
      rating_3: reviews.filter(r => r.rating_overall === 3).length,
      rating_2: reviews.filter(r => r.rating_overall === 2).length,
      rating_1: reviews.filter(r => r.rating_overall === 1).length,
    };
  },
};
