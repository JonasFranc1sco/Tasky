import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';

type Props = { done: number; total: number };

export function WeeklyGoalCard({ done, total }: Props) {
    return (
        <View className="flex-row items-center gap-4 rounded-2xl border border-slate-100 bg-surface-lowest p-4">
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
        <MaterialCommunityIcons name="trophy-outline" size={26} color="#0F2042" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold text-on-surface">Meta de Conclusão Semanal</Text>
        <ProgressBar progress={done / total} color="#0F2042" style={{ height: 8, borderRadius: 999, marginTop: 6 }} />
        <Text className="mt-1 text-[11px] text-on-surface-variant">{done} de {total} tarefas entregues no prazo</Text>
      </View>
    </View>
    );
}