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
  const { id, taskId } = useLocalSearchParams<{ id?: string; taskId?: string }>();
  const routeId = id ?? taskId;
  const requestedId = Array.isArray(routeId) ? routeId[0] : routeId;
  const { tasks, loading, error, archiveTask, reopenTask, saveTaskNote } = useTasks();
  const task = tasks.find((item) => item.id === requestedId);
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
      <TaskDetailHeader taskId={requestedId?.slice(0, 8)} />
      {loading ? <ActivityIndicator className="m-4" /> : task ? (
        <ScrollView
          style={{ width: '100%', maxWidth: 960, alignSelf: 'center' }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 14 }}
          keyboardShouldPersistTaps="handled"
        >
          <TaskInfoCard task={task} />
          {task.deleting ? (
            <Text className="text-on-surface-variant">Retome a exclusão no menu da tarefa na lista.</Text>
          ) : (
            <>
              <TaskNotesCard key={task.id} {...noteState} onSaveNote={async (content) => {
                await saveTaskNote(task.id, content);
                setMessage('Observação adicionada.');
              }} />
              <TaskControlActionsCard
                status={task.status}
                busy={busy}
                onValidateAndArchive={() => changeStatus('archive')}
                onReopenTask={() => changeStatus('reopen')}
              />
            </>
          )}
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
