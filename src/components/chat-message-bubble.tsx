import { formatChatTimestamp, type ChatMessage } from '@/types/chat';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

type Props = {
  message: ChatMessage;
  isOwnMessage: boolean;
  recipientUid?: string;
};

export function ChatMessageBubble({
  message,
  isOwnMessage,
  recipientUid,
}: Props) {
  const timeLabel = formatChatTimestamp(message.createdAt);
  const isReadByRecipient = recipientUid
    ? message.readBy?.includes(recipientUid)
    : (message.readBy?.length ?? 0) > 1;

  return (
    <View
      className={`my-1 flex-row ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <View
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
          isOwnMessage
            ? 'rounded-br-xs bg-primary'
            : 'rounded-bl-xs border border-slate-200 bg-surface-lowest'
        }`}
      >
        {/* Identificação do remetente em mensagens recebidas */}
        {!isOwnMessage && (
          <Text className="mb-0.5 text-[11px] font-bold text-primary">
            {message.senderName}
          </Text>
        )}

        {/* Conteúdo textual da mensagem */}
        <Text
          className={`text-sm leading-5 ${
            isOwnMessage ? 'text-white' : 'text-on-surface'
          }`}
        >
          {message.content}
        </Text>

        {/* Horário de envio e confirmação de leitura */}
        <View className="mt-1 flex-row items-center justify-end gap-1">
          <Text
            className={`text-[10px] ${
              isOwnMessage ? 'text-slate-300' : 'text-on-surface-variant'
            }`}
          >
            {timeLabel}
          </Text>
          {isOwnMessage && (
            <MaterialCommunityIcons
              name={isReadByRecipient ? 'check-all' : 'check'}
              size={13}
              color={isReadByRecipient ? '#5EEAD4' : '#CBD5E1'}
            />
          )}
        </View>
      </View>
    </View>
  );
}
