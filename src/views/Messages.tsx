import React, { useEffect, useState } from 'react';
import { messageService } from '../services/messageService';
import { ConversationInfo, Message } from '../types';
import { formatRelativeDate, getInitials } from '../utils/format';
import { Search, Send, Paperclip, MoreVertical } from 'lucide-react';

interface MessagesProps {
  userId: string;
}

const Messages: React.FC<MessagesProps> = ({ userId }) => {
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [userId]);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id);
    }
  }, [selectedConv]);

  const loadConversations = async () => {
    try {
      const data = await messageService.getUserConversations(userId);
      setConversations(data);
      if (data.length > 0 && !selectedConv) {
        setSelectedConv(data[0]);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const data = await messageService.getConversationMessages(convId);
      setMessages(data);
      await messageService.markConversationAsRead(convId, userId);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !newMessage.trim()) return;

    try {
      const otherUserId = selectedConv.participant.id;
      await messageService.sendMessage(selectedConv.id, userId, otherUserId, newMessage);
      setNewMessage('');
      loadMessages(selectedConv.id);
      loadConversations();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="spinner w-12 h-12"></div></div>;
  }

  return (
    <div className="h-[calc(100vh-8rem)] animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Liste des conversations */}
        <div className="lg:col-span-1 card overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input type="text" className="input pl-10" placeholder="Rechercher..." />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                <p>Aucune conversation</p>
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-neutral-50 transition-colors border-b ${
                    selectedConv?.id === conv.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="avatar avatar-md relative">
                    {getInitials(conv.participant.first_name, conv.participant.last_name)}
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{conv.participant.first_name}</span>
                      <span className="text-xs text-neutral-500">
                        {formatRelativeDate(conv.last_message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 line-clamp-1">
                      {conv.last_message.message}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="lg:col-span-2 card overflow-hidden flex flex-col">
          {selectedConv ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="avatar avatar-md">
                    {getInitials(selectedConv.participant.first_name, selectedConv.participant.last_name)}
                  </div>
                  <div>
                    <div className="font-semibold">{selectedConv.participant.first_name} {selectedConv.participant.last_name}</div>
                    <div className="text-sm text-neutral-600">{selectedConv.participant.headline}</div>
                  </div>
                </div>
                <button className="p-2 hover:bg-neutral-100 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map(msg => {
                  const isMine = msg.sender_id === userId;
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMine ? 'justify-end' : ''}`}>
                      {!isMine && (
                        <div className="avatar avatar-sm">
                          {getInitials(selectedConv.participant.first_name, selectedConv.participant.last_name)}
                        </div>
                      )}
                      <div className={`max-w-[70%] ${isMine ? 'order-2' : ''}`}>
                        <div className={`p-4 rounded-2xl ${
                          isMine ? 'bg-primary-600 text-white' : 'bg-neutral-100'
                        }`}>
                          <p>{msg.message}</p>
                        </div>
                        <span className="text-xs text-neutral-500 mt-1 block">
                          {formatRelativeDate(msg.created_at)}
                        </span>
                      </div>
                      {isMine && (
                        <div className="avatar avatar-sm">
                          {getInitials('M', 'oi')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <button type="button" className="btn btn-secondary">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Écrire un message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500">
              <p>Sélectionnez une conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
