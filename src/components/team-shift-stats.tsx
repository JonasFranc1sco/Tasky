import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

type Props = {
    shift: string;
    shiftStatus: string;
    present: number;
    total: number;
};

export function TeamShiftStats({ shift, shiftStatus, present, total }: Props) {
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <View className="flex-row gap-2.5">
      <View className="flex-1 rounded-xl border border-slate-100 bg-surface-lowest p-3 shadow-sm">
        <View className="flex-row items-center gap-1">
          <MaterialCommunityIcons name="clock-outline" size={15} color="#45464E" />
          <Text className="text-xs font-medium text-on-surface-variant">Turno Atual</Text>
        </View>
        <Text className="mt-1.5 text-sm font-bold text-on-surface">{shift}</Text>
        <Text className="mt-0.5 text-[11px]" style={{ color: '#006A61' }}>
          {shiftStatus}
        </Text>
      </View>

      <View className="flex-1 rounded-xl border border-slate-100 bg-surface-lowest p-3 shadow-sm">
        <View className="flex-row items-center gap-1">
          <MaterialCommunityIcons name="account-group" size={15} color="#45464E" />
          <Text className="text-xs font-medium text-on-surface-variant">Presença</Text>
        </View>
        <Text className="mt-1.5 text-sm font-bold text-on-surface">
          {present} de {total} colegas
        </Text>
        <Text className="mt-0.5 text-[11px] font-medium text-on-surface-variant">
          {percentage}% da equipe ativa
        </Text>
      </View>
    </View>
  );
}