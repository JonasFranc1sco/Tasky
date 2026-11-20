import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { IconButton, Menu } from 'react-native-paper';

export type ManagerTask = {
  id: string;
  title: string;
  description: string;
  assignee: string;
  time: string;
  status: 'pending' | 'completed';
  category?: string;
  sector?: string;
  createdAt?: string;
  completedAt?: string;
  archivedAt?: string;
};

type Props = {
  task: ManagerTask;
  onPress?: () => void;
  onToggleStatus?: () => void;
};

export function ManagerTaskCard({ task, onPress, onToggleStatus }: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const isCompleted = task.status === 'completed';

  const openDetails = () => {
    setMenuVisible(false);
    onPress?.();
  };

  const toggleStatus = () => {
    setMenuVisible(false);
    onToggleStatus?.();
  };

  return (
    <View className="rounded-2xl border border-slate-100 bg-surface-lowest p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={onPress}
          className="min-h-10 flex-1 flex-row items-center gap-2 active:opacity-80"
        >
          <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
            {isCompleted ? (
              <MaterialCommunityIcons name="check" size={13} color="#45464E" />
            ) : (
              <View className="h-1.5 w-1.5 rounded-full bg-on-surface-variant" />
            )}
            <Text className="text-[11px] font-medium text-on-surface-variant">
              {isCompleted ? 'Concluída' : 'Pendente'}
            </Text>
          </View>

          {task.category && (
            <Text className="text-xs font-medium text-on-surface-variant">
              {task.category}
            </Text>
          )}
          {task.archivedAt ? (
            <Text className="rounded-full bg-surface-high px-2 py-1 text-[10px] font-semibold text-on-surface-variant">
              Arquivada
            </Text>
          ) : null}
        </Pressable>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={18}
              iconColor="#75777F"
              accessibilityLabel="Ações rápidas da tarefa"
              onPress={() => setMenuVisible(true)}
              style={{ margin: 0, padding: 0 }}
            />
          }
        >
          <Menu.Item
            leadingIcon="text-box-outline"
            title="Ver detalhes"
            onPress={openDetails}
          />
          {onToggleStatus && (
            <Menu.Item
              leadingIcon={isCompleted ? 'restart' : 'check'}
              title={isCompleted ? 'Reabrir tarefa' : 'Concluir tarefa'}
              onPress={toggleStatus}
            />
          )}
        </Menu>
      </View>

      <Pressable onPress={onPress} className="active:opacity-80">
        <Text className="mt-1 text-base font-bold text-on-surface">
          {task.title}
        </Text>
        <Text className="mt-1 text-xs text-on-surface-variant" numberOfLines={1}>
          {task.description}
        </Text>

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
      </Pressable>
    </View>
  );
}
