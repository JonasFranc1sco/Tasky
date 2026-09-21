import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, Text, View } from 'react-native';

export type Colleague = {
    id: string;
    name: string;
    role: string;
    sector: string;
    status: 'turno' | 'intervalo';
    initials: string;
    isSelf?: boolean;
    shift?: 'A' | 'B';
    statusDetail: string;
};

type Props = {
    colleague: Colleague;
    onChatPress?: () => void;
};

const STATUS_COLOR = {
    turno: '#006A61',
    intervalo: '#FFB95F',
} as const;

export function ColleagueCard({ colleague, onChatPress }: Props) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-slate-100 bg-surface-lowest p-3 shadow-sm">
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <View className="relative h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container">
          <Text className="text-sm font-bold text-on-surface">{colleague.initials}</Text>
          <View
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white"
            style={{ backgroundColor: STATUS_COLOR[colleague.status] }}
          />
        </View>

        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-sm font-semibold text-on-surface" numberOfLines={1}>
              {colleague.name}
            </Text>
            {colleague.isSelf && (
              <View className="rounded bg-surface-container px-1.5 py-0.5">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Você
                </Text>
              </View>
            )}
          </View>

          <Text className="mt-0.5 text-xs text-on-surface-variant" numberOfLines={1}>
            {colleague.role}
          </Text>

          <View className="mt-1 flex-row items-center gap-1.5">
            <View
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: STATUS_COLOR[colleague.status] }}
            />
            <Text
              className="text-[11px] font-medium"
              style={{ color: colleague.status === 'turno' ? '#006A61' : '#45464E' }}
              numberOfLines={1}
            >
              {colleague.statusDetail}
            </Text>
          </View>
        </View>
      </View>

      {colleague.isSelf && colleague.shift ? (
        <View className="shrink-0 rounded-lg bg-surface-container px-2 py-0.5">
          <Text className="text-xs font-medium text-on-surface-variant">
            Turno {colleague.shift}
          </Text>
        </View>
      ) : (
        <Pressable
          className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container active:opacity-80"
          onPress={onChatPress}
          hitSlop={8}
        >
          <MaterialCommunityIcons name="chat" size={18} color="#0F2042" />
        </Pressable>
      )}
    </View>
  );
}