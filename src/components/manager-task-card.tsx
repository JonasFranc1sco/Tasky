import type { Task } from '@/types/task';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { IconButton, Menu } from 'react-native-paper';

type Props = {
  task: Task;
  onPress: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
};

export function ManagerTaskCard({ task, onPress, onToggleStatus, onDelete }: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const isCompleted = task.status !== 'pending';
  function selectAction(action: () => void) {
    setMenuVisible(false);
    action();
  }

  return (
    <View className="rounded-2xl border border-slate-100 bg-surface-lowest p-4 shadow-sm">
      {/* Linha superior: Status Badge + Categoria + Menu IconButton do Paper */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          {task.deleting ? (
            <Text className="text-[11px] font-medium text-error">Exclusão pendente</Text>
          ) : isCompleted ? (
            <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
              <MaterialCommunityIcons name="check" size={13} color="#45464E" />
              <Text className="text-[11px] font-medium text-on-surface-variant">
                {task.status === 'archived' ? 'Arquivada' : 'Concluída'}
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
              <View className="h-1.5 w-1.5 rounded-full bg-on-surface-variant" />
              <Text className="text-[11px] font-medium text-on-surface-variant">Pendente</Text>
            </View>
          )}

          {task.priority && (
            <Text className="text-xs font-medium text-on-surface-variant">
              {task.priority}
            </Text>
          )}
        </View>

        <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)} anchor={
          <IconButton icon="dots-vertical" size={18} iconColor="#75777F"
            accessibilityLabel="Ações da tarefa" onPress={() => setMenuVisible(true)} style={{ margin: 0 }} />
        }>
          <Menu.Item leadingIcon="text-box-outline" title="Ver detalhes" onPress={() => selectAction(onPress)} />
          {!task.deleting && (
            <Menu.Item leadingIcon={isCompleted ? 'restart' : 'check'}
              title={isCompleted ? 'Reabrir tarefa' : 'Concluir tarefa'} onPress={() => selectAction(onToggleStatus)} />
          )}
          <Menu.Item leadingIcon="delete-outline" title={task.deleting ? 'Retomar exclusão' : 'Excluir tarefa'}
            onPress={() => selectAction(onDelete)} />
        </Menu>
      </View>

      <Pressable onPress={onPress} accessibilityRole="button" className="active:opacity-80">
        <Text className="mt-1 text-base font-bold text-on-surface">{task.title}</Text>
        <Text className="mt-1 text-xs text-on-surface-variant" numberOfLines={1}>
          {task.description}
        </Text>

        <View className="mt-3.5 flex-row items-center justify-between border-t border-slate-100 pt-2.5">
          <Text className="text-xs font-semibold text-on-surface">{task.assigneeName}</Text>
          <View className="flex-row items-center gap-1">
            <MaterialCommunityIcons name={isCompleted ? 'check-all' : 'clock-outline'} size={16} color="#45464E" />
            <Text className="text-xs text-on-surface-variant">{task.dueDate || 'Sem prazo'}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
