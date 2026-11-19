import { useAuth } from '@/hooks/auth-context';
import { ChatService } from '@/services/chat-service';
import type { Conversation } from '@/types/chat';
import type { EmployeeMember } from '@/types/company';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ChatContextValue = {
  conversations: Conversation[];
  totalUnreadCount: number;
  loading: boolean;
  error: string | null;
  startChatWithMember: (targetMember: EmployeeMember) => Promise<Conversation>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [rawConversations, setRawConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyId = profile?.companyId ?? null;
  const currentUid = profile?.uid || profile?.id || null;

  // Escuta as conversas do usuário autenticado em tempo real
  useEffect(() => {
    if (!companyId || !currentUid) {
      return;
    }

    const unsubscribe = ChatService.subscribeToUserConversations(
      companyId,
      currentUid,
      (nextList) => {
        setRawConversations(nextList);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Erro ao carregar conversas.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [companyId, currentUid]);

  const conversations = useMemo(
    () => (companyId && currentUid ? rawConversations : []),
    [companyId, currentUid, rawConversations]
  );

  // Soma o total de mensagens não lidas do usuário em todas as conversas
  const totalUnreadCount = useMemo(() => {
    if (!currentUid) return 0;
    return conversations.reduce(
      (sum, conv) => sum + Number(conv.unreadCounts?.[currentUid] ?? 0),
      0
    );
  }, [conversations, currentUid]);

  // Inicia ou abre uma conversa com outro funcionário da mesma empresa
  const startChatWithMember = useCallback(
    async (targetMember: EmployeeMember): Promise<Conversation> => {
      if (!profile) {
        throw new Error('Usuário não autenticado.');
      }
      return ChatService.getOrCreateConversation(profile, targetMember);
    },
    [profile]
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      conversations,
      totalUnreadCount,
      loading,
      error,
      startChatWithMember,
    }),
    [conversations, totalUnreadCount, loading, error, startChatWithMember]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChat deve ser usado dentro de <ChatProvider>');
  }
  return ctx;
}
