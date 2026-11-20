import { ScreenHeader } from '@/components/screen-header';
import { TaskCard } from '@/components/task-card';
import { WeeklyGoalCard } from '@/components/weekly-goal-card';
import { useAuth } from '@/hooks/auth-context';
import { useTasks } from '@/hooks/tasks-context';
import { useTaskCompletion } from '@/hooks/use-task-completion';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Text, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, SegmentedButtons, Snackbar } from 'react-native-paper';

export default function TaskQueueScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const columns = width >= 1080 ? 2 : 1;
    const { user, profile } = useAuth();
    const { tasks, loading, error } = useTasks();
    const { complete, completingId, completionError, clearCompletionError } = useTaskCompletion();
    const [tab, setTab] = useState<'pending' | 'completed'>('pending');

    const assigned = tasks.filter((t) => t.assigneeUid === user?.uid);
    const pending = assigned.filter((t) => t.status === 'pending');
    const completed = assigned.filter((t) => t.status !== 'pending');
    const list = tab === 'pending' ? pending : completed;
    const highPriorities = pending.filter((t) => t.priority === 'Alta Prioridade').length;
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const completedThisWeek = completed.filter((task) => {
      const time = task.completedAt?.toMillis();
      return time !== undefined && time >= startOfWeek.getTime() && time <= now.getTime();
    }).length;

    return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Inicio Tarefas" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        key={columns}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? { gap: 12 } : undefined}
        style={{ width: '100%', maxWidth: 1120, alignSelf: 'center' }}
        data={list}
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
                <Text className="text-base font-semibold text-on-surface">Minhas tarefas</Text>
                <View className="h-1.5 w-1.5 rounded-full bg-primary" />
              </View>
              <Text className="text-[11px] text-on-surface-variant">{highPriorities} tarefas prioritárias</Text>
            </View>
          </>
        }
        ListEmptyComponent={loading ? <ActivityIndicator /> : (
          <Text className={error ? 'text-error' : 'text-on-surface-variant'}>
            {error ?? (tab === 'pending' ? 'Nenhuma tarefa pendente.' : 'Nenhuma tarefa concluída.')}
          </Text>
        )}
        ListFooterComponent={tab === 'completed' && !loading && !error ? (
          <WeeklyGoalCard done={completedThisWeek} total={assigned.length} />
        ) : null}
        renderItem={({ item }) => (
          <View style={{ flex: 1, maxWidth: columns > 1 ? '50%' : '100%' }}>
            <TaskCard
              task={item}
              onPress={() => router.push({ pathname: '/task/[id]', params: { id: item.id } })}
              onComplete={complete}
              completing={completingId === item.id}
              disabled={completingId !== null}
            />
          </View>
        )}
      />
      <Snackbar visible={Boolean(completionError)} onDismiss={clearCompletionError}>
        {completionError}
      </Snackbar>
    </View>
    );
}

