import { ChatMessageBubble } from '@/components/chat-message-bubble';
import { useAuth } from '@/hooks/auth-context';
import { ChatService, MESSAGES_PAGE_SIZE } from '@/services/chat-service';
import type { ChatMessage, Conversation } from '@/types/chat';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function ChatRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();

  const conversationId = String(id ?? '');
  const currentUid = profile?.uid || profile?.id || '';

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [latestMessages, setLatestMessages] = useState<ChatMessage[]>([]);
  const [olderMessages, setOlderMessages] = useState<ChatMessage[]>([]);
  const [cursorDoc, setCursorDoc] = useState<QueryDocumentSnapshot | null>(
    null
  );
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Carrega os metadados da conversa e valida se o usuário pertence a ela
  useEffect(() => {
    if (!conversationId) return;

    ChatService.getConversationById(conversationId)
      .then((conv) => {
        if (!conv) {
          setError('Conversa não encontrada.');
          return;
        }
        setConversation(conv);
      })
      .catch(() => {
        setError('Sem permissão para acessar esta conversa.');
      });
  }, [conversationId]);

  // Escuta em tempo real as mensagens mais recentes da conversa
  useEffect(() => {
    if (!conversationId || !currentUid) return;

    const unsubscribe = ChatService.subscribeToLatestMessages(
      conversationId,
      MESSAGES_PAGE_SIZE,
      (msgs, oldestDoc) => {
        setLatestMessages(msgs);
        setCursorDoc((prev) => prev ?? oldestDoc);
        if (msgs.length < MESSAGES_PAGE_SIZE) {
          setHasMore(false);
        }
        setLoadingInitial(false);

        // Marca automaticamente as mensagens recebidas como lidas ao visualizar
        ChatService.markConversationAsRead(conversationId, currentUid, msgs);
      },
      () => {
        setError('Não foi possível carregar as mensagens.');
        setLoadingInitial(false);
      }
    );

    return unsubscribe;
  }, [conversationId, currentUid]);

  // Combina o lote em tempo real com as páginas antigas carregadas sob demanda
  const allMessages = useMemo(() => {
    const seen = new Set<string>();
    const combined: ChatMessage[] = [];

    [...latestMessages, ...olderMessages].forEach((msg) => {
      if (!seen.has(msg.id)) {
        seen.add(msg.id);
        combined.push(msg);
      }
    });

    return combined;
  }, [latestMessages, olderMessages]);

  const recipientUid = useMemo(
    () =>
      conversation?.participants.find((uid) => uid !== currentUid) ??
      currentUid,
    [conversation?.participants, currentUid]
  );

  const recipientInfo = conversation?.participantDetails?.[recipientUid];

  // Carrega o histórico anterior ao rolar até o topo da conversa
  const handleLoadOlder = useCallback(async () => {
    if (!conversationId || !cursorDoc || !hasMore || loadingOlder) return;

    try {
      setLoadingOlder(true);
      const { messages: olderBatch, lastDoc } =
        await ChatService.loadOlderMessages(
          conversationId,
          cursorDoc,
          MESSAGES_PAGE_SIZE
        );

      if (olderBatch.length < MESSAGES_PAGE_SIZE || !lastDoc) {
        setHasMore(false);
      }

      setCursorDoc(lastDoc);
      setOlderMessages((prev) => [...prev, ...olderBatch]);
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, cursorDoc, hasMore, loadingOlder]);

  // Envia a mensagem digitada para o Firestore
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !profile || !conversation || sending) return;

    setText('');
    try {
      setSending(true);
      await ChatService.sendMessage({
        conversationId: conversation.id,
        companyId: conversation.companyId,
        senderUid: currentUid,
        senderName: profile.name,
        recipientUid,
        content: trimmed,
      });
    } catch {
      setError('Falha ao enviar mensagem. Tente novamente.');
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View className="mx-auto w-full max-w-[760px] flex-1">
        {/* Cabeçalho da conversa individual com dados do destinatário */}
        <View className="flex-row items-center gap-3 border-b border-slate-200 bg-surface-lowest px-4 py-3">
          <Pressable
            className="h-9 w-9 items-center justify-center rounded-xl bg-surface-container"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/chat');
              }
            }}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={20}
              color="#0F2042"
            />
          </Pressable>

          <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container">
            <Text className="text-xs font-bold text-primary">
              {recipientInfo?.initials ?? 'CL'}
            </Text>
          </View>

          <View className="min-w-0 flex-1">
            <Text
              className="text-sm font-bold text-on-surface"
              numberOfLines={1}
            >
              {recipientInfo?.name ?? 'Conversa'}
            </Text>
            <Text
              className="text-xs text-on-surface-variant"
              numberOfLines={1}
            >
              {recipientInfo?.sector
                ? `${recipientInfo.jobTitle} • ${recipientInfo.sector}`
                : (recipientInfo?.jobTitle ?? 'Colaborador')}
            </Text>
          </View>
        </View>

        {error ? (
          <View className="m-4 rounded-xl bg-error/10 p-3">
            <Text className="text-xs text-error">{error}</Text>
          </View>
        ) : null}

        {/* Lista de mensagens invertida (mensagens mais novas na base) */}
        {loadingInitial ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0F2042" />
          </View>
        ) : (
          <FlatList
            data={allMessages}
            inverted
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
            onEndReached={handleLoadOlder}
            onEndReachedThreshold={0.3}
            renderItem={({ item }) => (
              <ChatMessageBubble
                message={item}
                isOwnMessage={item.senderId === currentUid}
                recipientUid={recipientUid}
              />
            )}
            ListFooterComponent={
              loadingOlder ? (
                <View className="py-3 items-center">
                  <ActivityIndicator size="small" color="#0F2042" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-12">
                <Text className="text-xs text-on-surface-variant">
                  Envie uma mensagem para iniciar a conversa.
                </Text>
              </View>
            }
          />
        )}

        {/* Barra inferior de digitação e botão de envio */}
        <View className="flex-row items-center gap-2 border-t border-slate-200 bg-surface-lowest px-3 py-2.5">
          <TextInput
            className="max-h-24 min-h-11 flex-1 rounded-2xl border border-slate-200 bg-surface-container px-4 py-2 text-sm text-on-surface"
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#75777F"
            value={text}
            onChangeText={setText}
            multiline
            onSubmitEditing={handleSend}
          />
          <Pressable
            className={`h-11 w-11 items-center justify-center rounded-2xl ${
              text.trim() ? 'bg-primary' : 'bg-slate-300'
            }`}
            disabled={!text.trim() || sending}
            onPress={handleSend}
          >
            <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
