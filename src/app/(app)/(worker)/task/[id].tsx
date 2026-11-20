import { TaskDetailHeader } from '@/components/task-detail-header';
import { TaskInfoCard } from '@/components/task-info-card';
import { TaskNotesCard } from '@/components/task-notes-card';
import { useAuth } from '@/hooks/auth-context';
import { useTaskNotes, useTasks } from '@/hooks/tasks-context';
import { useTaskCompletion } from '@/hooks/use-task-completion';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ActivityIndicator, Button, Snackbar } from 'react-native-paper';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuth();
  const { tasks, loading, error } = useTasks();
  const { complete, completingId, completionError } = useTaskCompletion();
  const [completedMessage, setCompletedMessage] = useState(false);
  const task = tasks.find((item) => item.id === taskId && item.assigneeUid === user?.uid);
  const noteState = useTaskNotes(task);

  return (
    <View className="flex-1 bg-surface">
      <Stack.Screen options={{ headerShown: false }} />
      <TaskDetailHeader taskId={taskId?.slice(0, 8)} onBackPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/(app)/(worker)/task');
      }} />
      {loading ? <ActivityIndicator className="m-4" /> : task ? (
        <ScrollView style={{ width: '100%', maxWidth: 960, alignSelf: 'center' }}
          contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 14 }}>
          <TaskInfoCard task={task} />
          {task.deleting ? <Text className="text-on-surface-variant">Tarefa em exclusão.</Text> : (
            <>
              <TaskNotesCard {...noteState} title="Mensagens do gestor"
                emptyMessage="O gestor ainda não registrou mensagens para esta tarefa." />
              {task.status === 'pending' && (
                <Button mode="contained" icon="check" loading={Boolean(completingId)}
                  disabled={Boolean(completingId)} onPress={async () => {
                    if (await complete(task.id)) setCompletedMessage(true);
                  }}>
                  {task.reopened ? 'Reenviar como Concluída' : 'Marcar como Concluída'}
                </Button>
              )}
            </>
          )}
          {completionError && <Text className="text-error">{completionError}</Text>}
        </ScrollView>
      ) : <Text className="p-4 text-on-surface-variant">{error ?? 'Tarefa não encontrada.'}</Text>}
      <Snackbar visible={completedMessage} onDismiss={() => setCompletedMessage(false)}>
        Tarefa marcada como concluída.
      </Snackbar>
    </View>
  );
}
