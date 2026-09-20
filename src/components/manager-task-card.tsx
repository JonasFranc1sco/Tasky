import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';

export type ManagerTask = {
  id: string;
  title: string;
  description: string;
  assignee: string;
  time: string;
  status: 'pending' | 'completed';
  category?: string;
};

type Props = {
  task: ManagerTask;
  onPress?: () => void;
  onMenuPress?: () => void;
};

export function ManagerTaskCard({ task, onPress, onMenuPress }: Props) {
  const isCompleted = task.status === 'completed';

  return (
    <View className="rounded-2xl border border-slate-100 bg-surface-lowest p-4 shadow-sm">
      {/* Linha superior: Status Badge + Categoria + Menu IconButton do Paper */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          {isCompleted ? (
            <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
              <MaterialCommunityIcons name="check" size={13} color="#45464E" />
              <Text className="text-[11px] font-medium text-on-surface-variant">Concluída</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
              <View className="h-1.5 w-1.5 rounded-full bg-on-surface-variant" />
              <Text className="text-[11px] font-medium text-on-surface-variant">Pendente</Text>
            </View>
          )}

          {task.category && (
            <Text className="text-xs font-medium text-on-surface-variant">
              {task.category}
            </Text>
          )}
        </View>

        <IconButton
          icon="dots-vertical"
          size={18}
          iconColor="#75777F"
          onPress={onMenuPress ?? (() => {})}
          style={{ margin: 0, padding: 0 }}
        />
      </View>

      {/* Título da Tarefa */}
      <Text className="mt-1 text-base font-bold text-on-surface">
        {task.title}
      </Text>

      {/* Descrição da Tarefa */}
      <Text className="mt-1 text-xs text-on-surface-variant" numberOfLines={1}>
        {task.description}
      </Text>

      {/* Linha inferior: Responsável (Apenas nome, sem foto) e Prazo */}
      <View className="mt-3.5 flex-row items-center justify-between border-t border-slate-100 pt-2.5">
        <Text className="text-xs font-semibold text-on-surface">
          {task.assignee}
        </Text>

        <View className="flex-row items-center gap-1">
          {isCompleted ? (
            <MaterialCommunityIcons name="check-all" size={16} color="#45464E" />
          ) : (
            <MaterialCommunityIcons name="clock-outline" size={14} color="#75777F" />
          )}
          <Text className="text-xs text-on-surface-variant">{task.time}</Text>
        </View>
      </View>
    </View>
  );
}
