import { supabase } from './supabase';
import { Message, ConversationInfo } from '../types';
import { profileService } from './profileService';

export const messageService = {
  // Récupérer les messages d'une conversation
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_deleted_by_sender', false)
      .eq('is_deleted_by_receiver', false)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Récupérer toutes les conversations d'un utilisateur
  async getUserConversations(userId: string): Promise<ConversationInfo[]> {
    // Récupérer tous les messages où l'utilisateur est sender ou receiver
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error || !messages) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return [];
    }
    
    // Grouper par conversation_id
    const conversationsMap = new Map<string, Message[]>();
    messages.forEach(msg => {
      const existing = conversationsMap.get(msg.conversation_id) || [];
      conversationsMap.set(msg.conversation_id, [...existing, msg]);
    });
    
    // Construire les infos de conversation
    const conversations: ConversationInfo[] = [];
    
    for (const [conversationId, msgs] of conversationsMap) {
      const lastMessage = msgs[0]; // Le plus récent
      const otherUserId = lastMessage.sender_id === userId 
        ? lastMessage.receiver_id 
        : lastMessage.sender_id;
      
      const participant = await profileService.getProfile(otherUserId);
      if (!participant) continue;
      
      const unreadCount = msgs.filter(
        m => !m.is_read && m.receiver_id === userId
      ).length;
      
      conversations.push({
        id: conversationId,
        participant,
        last_message: lastMessage,
        unread_count: unreadCount,
      });
    }
    
    return conversations;
  },
  
  // Envoyer un message
  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    message: string,
    attachments: any[] = [],
    orderId?: string
  ): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        message,
        attachments,
        order_id: orderId,
        is_read: false,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return null;
    }
    
    return data;
  },
  
  // Marquer un message comme lu
  async markMessageAsRead(messageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', messageId);
    
    if (error) {
      console.error('Erreur lors du marquage du message comme lu:', error);
      return false;
    }
    
    return true;
  },
  
  // Marquer tous les messages d'une conversation comme lus
  async markConversationAsRead(conversationId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('is_read', false);
    
    if (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
      return false;
    }
    
    return true;
  },
  
  // Supprimer un message (pour un utilisateur)
  async deleteMessage(messageId: string, userId: string, role: 'sender' | 'receiver'): Promise<boolean> {
    const column = role === 'sender' ? 'is_deleted_by_sender' : 'is_deleted_by_receiver';
    
    const { error } = await supabase
      .from('messages')
      .update({ [column]: true })
      .eq('id', messageId);
    
    if (error) {
      console.error('Erreur lors de la suppression du message:', error);
      return false;
    }
    
    return true;
  },
  
  // Récupérer le nombre de messages non lus
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false)
      .eq('is_deleted_by_receiver', false);
    
    if (error) {
      console.error('Erreur lors du comptage des messages non lus:', error);
      return 0;
    }
    
    return count || 0;
  },
  
  // Créer un ID de conversation unique entre deux utilisateurs
  createConversationId(userId1: string, userId2: string): string {
    const sorted = [userId1, userId2].sort();
    return `${sorted[0]}_${sorted[1]}`;
  },
  
  // S'abonner aux nouveaux messages en temps réel
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  },
};
