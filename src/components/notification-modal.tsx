import { getResponsiveModalContentStyle } from '@/components/responsive-modal-style';
import { useAuth } from '@/hooks/auth-context';
import { useChat } from '@/hooks/chat-context';
import { formatChatTimestamp, type Conversation } from '@/types/chat';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Badge, Modal, Portal } from 'react-native-paper';

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

type ChatNotification = {
  conversation: Conversation;
  senderName: string;
  initials: string;
  unreadCount: number;
  preview: string;
};

export function NotificationBell() {
  const { totalUnreadCount } = useChat();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <View className="relative">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            totalUnreadCount > 0
              ? `Notificações, ${totalUnreadCount} mensagens não lidas`
              : 'Notificações'
          }
          className="h-10 w-10 items-center justify-center rounded-xl active:bg-surface-container"
          onPress={() => setVisible(true)}
        >
          <MaterialCommunityIcons
            name={totalUnreadCount > 0 ? 'bell-badge-outline' : 'bell-outline'}
            size={22}
            color="#0F2042"
          />
        </Pressable>
        {totalUnreadCount > 0 ? (
          <Badge style={{ position: 'absolute', top: -3, right: -4 }}>
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </Badge>
        ) : null}
      </View>

      <NotificationModal
        visible={visible}
        onDismiss={() => setVisible(false)}
      />
    </>
  );
}

export function NotificationModal({ visible, onDismiss }: Props) {
  const router = useRouter();
  const { profile } = useAuth();
  const { conversations } = useChat();
  const { width, height } = useWindowDimensions();
  const currentUid = profile?.uid || profile?.id || '';

  const notifications = useMemo<ChatNotification[]>(() => {
    if (!currentUid) return [];

    return conversations
      .filter((conversation) => Number(conversation.unreadCounts?.[currentUid] ?? 0) > 0)
      .map((conversation) => {
        const otherUid =
          conversation.participants.find((uid) => uid !== currentUid) ?? '';
        const sender = conversation.participantDetails?.[otherUid];
        const unreadCount = Number(
          conversation.unreadCounts?.[currentUid] ?? 0
        );
        const preview =
          conversation.lastMessageSenderId === currentUid
            ? 'Há mensagens não lidas nesta conversa.'
            : conversation.lastMessage || 'Nova mensagem';

        return {
          conversation,
          senderName: sender?.name ?? 'Nova mensagem',
          initials: sender?.initials ?? 'CL',
          unreadCount,
          preview,
        };
      })
      .sort(
        (a, b) =>
          (b.conversation.lastMessageAt?.toMillis?.() ?? 0) -
          (a.conversation.lastMessageAt?.toMillis?.() ?? 0)
      );
  }, [conversations, currentUid]);

  const handleOpenConversation = (conversationId: string) => {
    onDismiss();
    router.push(`/chat/${conversationId}`);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={getResponsiveModalContentStyle(width, height, 600)}
      >
        <View
          className="rounded-3xl bg-surface-lowest p-5 shadow-sm"
          style={{ width: '100%', maxHeight: Math.min(height - 64, 720) }}
        >
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text className="text-lg font-bold text-on-surface">
                Notificações
              </Text>
              <Text className="mt-0.5 text-xs text-on-surface-variant">
                Mensagens novas e conversas não lidas
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar notificações"
              className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container"
              onPress={onDismiss}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="close" size={18} color="#45464E" />
            </Pressable>
          </View>

          <FlatList
            className="mt-4"
            style={{ maxHeight: Math.min(height * 0.58, 480) }}
            data={notifications}
            keyExtractor={(item) => item.conversation.id}
            contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${item.senderName}, ${item.unreadCount} mensagens não lidas`}
                accessibilityHint="Abre a conversa e marca as mensagens como lidas"
                className="flex-row items-center gap-3 rounded-2xl border border-slate-100 bg-surface p-3 active:bg-primary-soft"
                onPress={() =>
                  handleOpenConversation(item.conversation.id)
                }
              >
                <View className="h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Text className="text-xs font-bold text-primary">
                    {item.initials}
                  </Text>
                </View>
                <View className="min-w-0 flex-1">
                  <View className="flex-row items-center justify-between gap-2">
                    <Text
                      className="min-w-0 flex-1 text-sm font-semibold text-on-surface"
                      numberOfLines={1}
                    >
                      {item.senderName}
                    </Text>
                    <Text className="shrink-0 text-[11px] text-on-surface-variant">
                      {formatChatTimestamp(item.conversation.lastMessageAt)}
                    </Text>
                  </View>
                  <Text
                    className="mt-0.5 text-xs text-on-surface-variant"
                    numberOfLines={2}
                  >
                    {item.preview}
                  </Text>
                </View>
                <View className="min-w-6 items-center rounded-full bg-primary px-2 py-1">
                  <Text className="text-[10px] font-bold text-white">
                    {item.unreadCount > 99 ? '99+' : item.unreadCount}
                  </Text>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-12">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-container">
                  <MaterialCommunityIcons
                    name="bell-check-outline"
                    size={26}
                    color="#0F2042"
                  />
                </View>
                <Text className="mt-3 text-sm font-semibold text-on-surface">
                  Você está em dia
                </Text>
                <Text className="mt-1 text-center text-xs text-on-surface-variant">
                  Suas mensagens novas aparecerão aqui.
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
    </Portal>
  );
}
