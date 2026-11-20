import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';

type Props = { done: number; total: number };

export function WeeklyGoalCard({ done, total }: Props) {
    const progress = total > 0 ? Math.min(done / total, 1) : 0;

    return (
        <View className="flex-row items-center gap-4 rounded-2xl border border-slate-100 bg-surface-lowest p-4">
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
        <MaterialCommunityIcons name="trophy-outline" size={26} color="#0F2042" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold text-on-surface">Meta de Conclusão Semanal</Text>
        <ProgressBar progress={progress} color="#0F2042" style={{ height: 8, borderRadius: 999, marginTop: 6 }} />
        <Text className="mt-1 text-[11px] text-on-surface-variant">
          {total === 0
            ? 'Nenhuma tarefa atribuída no momento'
            : `${done} de ${total} ${total === 1 ? 'tarefa concluída' : 'tarefas concluídas'} nesta semana`}
        </Text>
      </View>
    </View>
    );
}