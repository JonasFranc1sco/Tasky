import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View, useWindowDimensions } from 'react-native';

type Props = {
    shift: string;
    shiftStatus: string;
    present: number;
    total: number;
};

export function TeamShiftStats({ shift, shiftStatus, present, total }: Props) {
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  const { width } = useWindowDimensions();
  const isNarrow = width < 440;

  return (
    <View className="gap-2.5" style={{ flexDirection: width < 380 ? 'column' : 'row' }}>
      <View
        className="rounded-xl border border-slate-100 bg-surface-lowest p-3 shadow-sm"
        style={{ width: isNarrow ? '100%' : undefined, flex: isNarrow ? undefined : 1 }}
      >
        <View className="flex-row items-center gap-1">
          <MaterialCommunityIcons name="clock-outline" size={15} color="#45464E" />
          <Text className="text-xs font-medium text-on-surface-variant">Turno Atual</Text>
        </View>
        <Text className="mt-1.5 text-sm font-bold text-on-surface">{shift}</Text>
        <Text className="mt-0.5 text-[11px]" style={{ color: '#006A61' }}>
          {shiftStatus}
        </Text>
      </View>

      <View
        className="rounded-xl border border-slate-100 bg-surface-lowest p-3 shadow-sm"
        style={{ width: isNarrow ? '100%' : undefined, flex: isNarrow ? undefined : 1 }}
      >
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
