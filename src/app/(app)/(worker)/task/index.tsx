import { ScreenHeader } from '@/components/screen-header';
import { TaskCard } from '@/components/task-card';
import { WeeklyGoalCard } from '@/components/weekly-goal-card';
import { useAuth } from '@/hooks/auth-context';
import { useTasks } from '@/hooks/tasks-context';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Text, View, useWindowDimensions } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

export default function TaskQueueScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const numColumns = width >= 1080 ? 2 : 1;
    const { profile } = useAuth();
    const { tasks, completeTask } = useTasks();
    const [tab, setTab] = useState<'pending' | 'completed'>('pending');

    const assignedTasks = tasks.filter((task) =>
      task.assignee.uid
        ? task.assignee.uid === profile?.uid
        : task.assignee.name === 'Colaborador' || task.assignee.name === profile?.name
    );
    const pending = assignedTasks.filter((t) => !t.completedAt);
    const completed = assignedTasks.filter((t) => t.completedAt);
    const list = tab === 'pending' ? pending : completed;
    const highPriorities = pending.filter((t) => t.priority === 'alta').length;

    return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Inicio Tarefas" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        key={numColumns}
        style={{ width: '100%', maxWidth: 1120, alignSelf: 'center' }}
        data={list}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? { gap: 12 } : undefined}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
        ListHeaderComponent={
          <>
            <Text className="text-xl font-bold text-on-surface">
              Olá, {profile?.name ?? 'Colaborador'}
            </Text>

            <SegmentedButtons
              value={tab}
              onValueChange={(v) => setTab(v as 'pending' | 'completed')}
              buttons={[
                { value: 'pending', label: `Pendentes (${pending.length})`, icon: 'clipboard-clock-outline' },
                { value: 'completed', label: `Concluídas (${completed.length})`, icon: 'checkbox-marked-circle-outline' },
              ]}
            />

            <View className="flex-row items-center justify-between px-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-semibold text-on-surface">Minha Fila de Hoje</Text>
                <View className="h-1.5 w-1.5 rounded-full bg-primary" />
              </View>
              <Text className="text-[11px] text-on-surface-variant">{highPriorities} tarefas prioritárias</Text>
            </View>
          </>
        }
        ListFooterComponent={tab === 'completed' ? <WeeklyGoalCard done={7} total={9} /> : null}
        renderItem={({ item }) => (
          <View style={{ flex: 1, maxWidth: numColumns > 1 ? '49%' : '100%' }}>
            <TaskCard task={item} onPress={() => router.push(`/task/${item.id}`)} onComplete={completeTask} />
          </View>
        )}
      />
    </View>
    );
}

