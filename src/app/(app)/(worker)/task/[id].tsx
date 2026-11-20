import { TaskInfoCard } from '@/components/task-info-card';
import { TaskNotesCard } from '@/components/task-notes-card';
import { useAuth } from '@/hooks/auth-context';
import { useTaskNotes, useTasks } from '@/hooks/tasks-context';
import { useTaskCompletion } from '@/hooks/use-task-completion';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { tasks, loading, error } = useTasks();
  const { complete, completingId, completionError } = useTaskCompletion();
  const task = tasks.find((item) => item.id === id && item.assigneeUid === user?.uid);
  const noteState = useTaskNotes(task);

  if (loading) return <ActivityIndicator className="m-4" />;
  if (!task) return <Text className="p-4 text-on-surface-variant">{error ?? 'Tarefa não encontrada.'}</Text>;

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <TaskInfoCard task={task} />
        <TaskNotesCard {...noteState} />
        {task.status === 'pending' && (
          <Button mode="contained" icon="check" loading={Boolean(completingId)}
            disabled={Boolean(completingId)} onPress={() => complete(task.id)}>
            {task.reopenedAt ? 'Reenviar como Concluída' : 'Marcar como Concluída'}
          </Button>
        )}
        {completionError ? <Text className="text-error">{completionError}</Text> : null}
      </ScrollView>
    </View>
  );
}
