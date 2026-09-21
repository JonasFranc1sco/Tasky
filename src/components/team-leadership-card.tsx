import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, Text, View } from 'react-native';

export type TeamLead = {
    name: string;
    role: string;
    initials: string;
};

type Props = {
    manager: TeamLead;
    onTalkPress?: () => void;
};

export function TeamLeadershipCard({ manager, onTalkPress }: Props) {
  return (
    <View className="rounded-xl bg-[#0F2042] p-3.5 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <MaterialCommunityIcons name="shield-check-outline" size={16} color="#94A3B8" />
          <Text className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Liderança de Turno
          </Text>
        </View>
        <View className="rounded bg-white/10 px-2 py-0.5">
          <Text className="text-[10px] font-semibold text-[#94A3B8]">Plantão</Text>
        </View>
      </View>

      <View className="mt-2.5 flex-row items-center gap-3">
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-400/30 bg-white/10">
          <Text className="text-xs font-semibold text-white">{manager.initials}</Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-bold text-white" numberOfLines={1}>
            {manager.name}
          </Text>
          <Text className="text-xs text-slate-300" numberOfLines={1}>
            {manager.role}
          </Text>
        </View>
      </View>

      <Pressable
        className="mt-2.5 h-9 flex-row items-center justify-center gap-2 rounded-lg bg-surface-lowest active:opacity-80"
        onPress={onTalkPress}
      >
        <MaterialCommunityIcons name="lifebuoy" size={17} color="#0F2042" />
        <Text className="text-xs font-semibold text-primary">Falar com gestor</Text>
      </Pressable>
    </View>
  );
}