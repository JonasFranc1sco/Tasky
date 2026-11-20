import {
  formatChatTimestamp,
  type Conversation,
  type ConversationParticipantInfo,
} from '@/types/chat';
import { getInitials } from '@/types/company';
import { Pressable, Text, View } from 'react-native';

type Props = {
  conversation: Conversation;
  currentUid: string;
  fallbackParticipant?: ConversationParticipantInfo;
  onPress: () => void;
};

export function ChatConversationItem({
  conversation,
  currentUid,
  fallbackParticipant,
  onPress,
}: Props) {
  const otherUid =
    conversation.participants.find((uid) => uid !== currentUid) ?? currentUid;

  const participant = fallbackParticipant ??
    conversation.participantDetails?.[otherUid] ?? {
      uid: otherUid,
      name: 'Colaborador',
      jobTitle: 'Equipe',
      sector: '',
      initials: 'CL',
    };

  const unreadCount = Number(conversation.unreadCounts?.[currentUid] ?? 0);
  const hasUnread = unreadCount > 0;
  const timeLabel = formatChatTimestamp(conversation.lastMessageAt);
  const isLastFromMe = conversation.lastMessageSenderId === currentUid;

  return (
    <Pressable
      className="flex-row items-center justify-between rounded-2xl border border-slate-100 bg-surface-lowest p-3.5 shadow-sm active:bg-slate-50"
      onPress={onPress}
    >
      {/* Avatar com iniciais do participante */}
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <View className="relative h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container">
          <Text className="text-sm font-bold text-primary">
            {participant.initials || getInitials(participant.name)}
          </Text>
          {hasUnread && (
            <View className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#006A61]" />
          )}
        </View>

        {/* Nome, cargo e prévia da última mensagem */}
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <Text
              className="flex-1 text-sm font-bold text-on-surface"
              numberOfLines={1}
            >
              {participant.name}
            </Text>
            {timeLabel ? (
              <Text
                className={`text-[11px] ${hasUnread ? 'font-bold text-primary' : 'text-on-surface-variant'}`}
              >
                {timeLabel}
              </Text>
            ) : null}
          </View>

          <Text
            className="mt-0.5 text-[11px] text-on-surface-variant"
            numberOfLines={1}
          >
            {participant.sector
              ? `${participant.jobTitle} • ${participant.sector}`
              : participant.jobTitle}
          </Text>

          <View className="mt-1 flex-row items-center justify-between gap-2">
            <Text
              className={`flex-1 text-xs ${hasUnread ? 'font-semibold text-on-surface' : 'text-slate-500'}`}
              numberOfLines={1}
            >
              {conversation.lastMessage
                ? `${isLastFromMe ? 'Você: ' : ''}${conversation.lastMessage}`
                : 'Toque para enviar a primeira mensagem'}
            </Text>

            {/* Indicador numérico de mensagens não lidas */}
            {hasUnread && (
              <View className="min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 py-0.5">
                <Text className="text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
