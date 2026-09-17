import { Task } from '@/constants/tasks';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';

type Props = { task: Task; onPress: () => void; onComplete: (id: string) => void};


function completedLabel(iso: string) {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `Concluída hoje às ${hh}:${mm}`;
}

export function TaskCard({ task, onPress, onComplete }: Props) {
    
    // Variação Task concluída
    if (task.completedAt) {
        return (
            <View className="flex-row items-center justify-between rounded-2xl border border-slate-100 bg-surface-lowest p-4 opacity-90">
        <View className="min-w-0 flex-row items-center gap-3">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-high">
            <MaterialCommunityIcons name="check" size={20} color="#0F2042" />
          </View>
          <View className="min-w-0">
            <Text className="text-sm font-semibold text-on-surface line-through" numberOfLines={1}>{task.name}</Text>
            <Text className="text-xs text-on-surface-variant">{completedLabel(task.completedAt)}</Text>
          </View>
        </View>
        <View className="rounded-full bg-surface-container px-2 py-0.5">
          <Text className="text-[11px] font-semibold text-on-surface-variant">Validada</Text>
        </View>
      </View>
        );
    }

    const hasDetails = task.priority === 'alta';
    const completeLabel = task.reopened ? 'Reenviar como Concluída' : 'Marcar como Concluída';

    // Variação Task pendente
    return (
        <View className="rounded-2xl border border-slate-100 bg-surface-lowest p-4">
      {task.reopened && (
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <MaterialCommunityIcons name="restart" size={14} color="#BA1A1A" />
            <Text className="text-[11px] font-medium text-error">Reaberta pelo Administrador</Text>
          </View>
          <Text className="text-[11px] text-on-surface-variant">Ontem</Text>
        </View>
      )}

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          {task.sector && (
            <>
              <MaterialCommunityIcons name="package-variant-closed" size={15} color="#45464E" />
              <Text className="text-[11px] text-on-surface-variant">{task.sector}</Text>
            </>
          )}
          {task.sector && task.dueDate && <Text className="text-[11px] text-slate-300">•</Text>}
          {task.dueDate && <Text className="text-[11px] text-on-surface-variant">{task.dueDate}</Text>}
        </View>
        <IconButton icon="dots-vertical" size={18} onPress={() => {}} />
      </View>
      {task.priority === 'alta' && (
        <Text className="text-[11px] font-semibold text-error">Alta prioridade</Text>
      )}

      <Text className="mt-1 text-base font-semibold text-on-surface">{task.name}</Text>
      <Text className="text-sm text-on-surface-variant" numberOfLines={2}>{task.description}</Text>
      {task.checklist && (
        <Text className="mt-1 text-[11px] text-on-surface-variant">
          Checklist {task.checklist.done}/{task.checklist.total} • {task.checklist.location}
        </Text>
      )}

      <View className="mt-3 flex-row gap-2">
        {hasDetails ? (
          <>
            <Button mode="contained-tonal" onPress={onPress} style={{ flex: 1 }}>Detalhes</Button>
            <Button mode="contained" icon="check" onPress={() => onComplete(task.id)} style={{ flex: 1 }}>Concluir</Button>
          </>
        ) : (
          <Button mode="contained" icon="arrow-right-bottom" onPress={() => onComplete(task.id)} style={{ flex: 1 }}>
            {completeLabel}
          </Button>
        )}
      </View>
    </View>
    );
}