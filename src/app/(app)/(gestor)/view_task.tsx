import { TaskControlActionsCard } from '@/components/task-control-actions-card';
import { TaskDetailHeader } from '@/components/task-detail-header';
import { TaskInfoCard } from '@/components/task-info-card';
import { TaskNotesCard } from '@/components/task-notes-card';
import { useTaskNotes, useTasks } from '@/hooks/tasks-context';
import { taskErrorMessage } from '@/services/task-service';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';

export default function GestorViewTaskScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { tasks, loading, error, archiveTask, reopenTask, saveTaskNote } = useTasks();
  const task = tasks.find((item) => item.id === id);
  const noteState = useTaskNotes(task);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const changeStatus = async (action: 'archive' | 'reopen') => {
    if (!task || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      if (action === 'archive') {
        await archiveTask(task.id);
        setMessage('Tarefa validada e arquivada.');
      } else {
        await reopenTask(task.id);
        setMessage('Tarefa reaberta.');
      }
    } catch (cause) {
      setMessage(taskErrorMessage(cause, 'Não foi possível atualizar a tarefa.'));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <Stack.Screen options={{ headerShown: false }} />
      <TaskDetailHeader taskId={task?.id.slice(0, 8)} />
      {loading ? <ActivityIndicator className="m-4" /> : task ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 14 }}
          keyboardShouldPersistTaps="handled"
        >
          <TaskInfoCard task={task} />
          <TaskNotesCard
            key={task.id}
            {...noteState}
            onSaveNote={(content) => saveTaskNote(task.id, content)}
          />
          <TaskControlActionsCard
            canArchive={task.status === 'completed'}
            canReopen={task.status !== 'pending'}
            busy={busy}
            onValidateAndArchive={() => changeStatus('archive')}
            onReopenTask={() => changeStatus('reopen')}
          />
        </ScrollView>
      ) : (
        <Text className="p-4 text-on-surface-variant">{error ?? 'Tarefa não encontrada.'}</Text>
      )}
      <Snackbar visible={Boolean(message)} onDismiss={() => setMessage(null)} duration={3500}>
        {message}
      </Snackbar>
    </View>
  );
}
