import type { Timestamp } from 'firebase/firestore';

// Resumo de cada participante salvo na conversa para exibição rápida
export type ConversationParticipantInfo = {
  uid: string;
  name: string;
  jobTitle: string;
  sector: string;
  initials: string;
};

// Estrutura da coleção "conversations" no Firestore
export type Conversation = {
  id: string;
  companyId: string;
  participants: string[];
  participantDetails: Record<string, ConversationParticipantInfo>;
  lastMessage: string;
  lastMessageSenderId: string;
  lastMessageAt: Timestamp;
  unreadCounts: Record<string, number>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// Estrutura da subcoleção "conversations/{id}/messages" no Firestore
export type ChatMessage = {
  id: string;
  conversationId: string;
  companyId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Timestamp;
  readBy: string[];
};

// Formata um Timestamp do Firestore para horário legível (ex: "14:30" ou "18/11")
export function formatChatTimestamp(timestamp?: Timestamp | null): string {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '';
  const date = timestamp.toDate();
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}
