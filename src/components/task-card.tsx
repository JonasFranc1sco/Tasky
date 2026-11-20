import { formatTaskDate, type Task } from '@/types/task';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

type Props = {
  task: Task;
  onPress: () => void;
  onComplete: (id: string) => void;
  completing: boolean;
  disabled: boolean;
};

export function TaskCard({ task, onPress, onComplete, completing, disabled }: Props) {
  if (task.status !== 'pending') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        className="flex-row items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-surface-lowest p-4 opacity-90"
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-high">
          <MaterialCommunityIcons name="check" size={20} color="#0F2042" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-semibold text-on-surface line-through" numberOfLines={1}>{task.title}</Text>
          <Text className="text-xs text-on-surface-variant">{formatTaskDate(task.completedAt)}</Text>
        </View>
        <View className="rounded-full bg-surface-container px-2 py-0.5">
          <Text className="text-[11px] font-semibold text-on-surface-variant">
            {task.status === 'archived' ? 'Validada' : 'Aguardando validação'}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View className="rounded-2xl border border-slate-100 bg-surface-lowest p-4">
      {task.reopenedAt ? (
        <View className="mb-2 flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-1">
            <MaterialCommunityIcons name="restart" size={14} color="#BA1A1A" />
            <Text className="text-[11px] font-medium text-error">Reaberta pelo gestor</Text>
          </View>
          <Text className="text-[11px] text-on-surface-variant">{formatTaskDate(task.reopenedAt)}</Text>
        </View>
      ) : null}
      <View className="flex-row items-center gap-1.5">
        {task.sector ? <Text className="text-[11px] text-on-surface-variant">{task.sector}</Text> : null}
        {task.sector && task.dueDate ? <Text className="text-[11px] text-slate-300">•</Text> : null}
        {task.dueDate ? <Text className="text-[11px] text-on-surface-variant">{task.dueDate}</Text> : null}
      </View>
      {task.priority === 'Alta Prioridade' ? <Text className="text-[11px] font-semibold text-error">Alta prioridade</Text> : null}
      <Text className="mt-1 text-base font-semibold text-on-surface">{task.title}</Text>
      <Text className="text-sm text-on-surface-variant" numberOfLines={2}>{task.description}</Text>
      <View className="mt-3 flex-row gap-2">
        <Button mode="contained-tonal" onPress={onPress} style={{ flex: 1 }}>Detalhes</Button>
        <Button mode="contained" icon="check" onPress={() => onComplete(task.id)}
          loading={completing} disabled={disabled} style={{ flex: 1 }}>
          {task.reopenedAt ? 'Reenviar' : 'Concluir'}
        </Button>
      </View>
    </View>
  );
}
