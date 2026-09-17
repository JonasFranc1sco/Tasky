import { ScreenHeader } from '@/components/screen-header';
import { TaskCard } from '@/components/task-card';
import { WeeklyGoalCard } from '@/components/weekly-goal-card';
import { CURRENT_EMPLOYEE } from '@/constants/tasks';
import { useTasks } from '@/hooks/tasks-context';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

export default function TaskQueueScreen() {
    const router = useRouter();
    const { tasks, completeTask } = useTasks();
    const [tab, setTab] = useState<'pending' | 'completed'>('pending');

    const pending = tasks.filter((t) => !t.completedAt);
    const completed = tasks.filter((t) => t.completedAt);
    const list = tab === 'pending' ? pending : completed;
    const highPriorities = pending.filter((t) => t.priority === 'alta').length;

    return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Inicio Tarefas" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={list}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
        ListHeaderComponent={
          <>
            <Text className="text-xl font-bold text-on-surface">Olá, {CURRENT_EMPLOYEE}</Text>

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
          <TaskCard task={item} onPress={() => router.push(`/task/${item.id}`)} onComplete={completeTask} />
        )}
      />
    </View>
    );
}

