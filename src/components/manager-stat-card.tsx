import { Text, View } from 'react-native';

type Props = {
  title: string;
  value: number | string;
  subtitle: string;
};

export function ManagerStatCard({ title, value, subtitle }: Props) {
  return (
    <View className="flex-1 rounded-2xl border border-slate-100 bg-surface-lowest p-3.5 shadow-sm">
      <Text className="text-xs font-medium text-on-surface-variant">{title}</Text>
      <Text className="mt-1 text-2xl font-bold text-on-surface">{value}</Text>
      <Text className="mt-1 text-[11px] text-on-surface-variant">{subtitle}</Text>
    </View>
  );
}
