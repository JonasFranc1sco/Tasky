import { TaskControlActionsCard } from '@/components/task-control-actions-card';
import { TaskDetailHeader } from '@/components/task-detail-header';
import { TaskInfoCard, type TaskDetailInfo } from '@/components/task-info-card';
import { TaskNotesCard } from '@/components/task-notes-card';
import { useTaskNotes } from '@/hooks/task-notes';
import { useTasks } from '@/hooks/tasks-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Snackbar } from 'react-native-paper';

export default function GestorViewTaskScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const requestedTaskId = Array.isArray(taskId) ? taskId[0] : taskId;
  const { tasks, loading: tasksLoading, error: tasksError, updateTaskStatus } = useTasks();
  const selectedTask = tasks.find((item) => item.id === requestedTaskId);
  const { notes, loading: notesLoading, error: notesError, addNote } =
    useTaskNotes(selectedTask?.id ?? null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const handleSaveNote = async (content: string) => {
    await addNote(content);
    setSnackbarMessage('Nota adicionada com sucesso!');
  };

  const handleValidateAndArchive = async () => {
    if (!selectedTask) return;
    try {
      await updateTaskStatus(selectedTask.id, 'completed');
      setSnackbarMessage('Tarefa validada e arquivada.');
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : 'Não foi possível atualizar a tarefa.'
      );
    }
  };

  const handleReopenTask = async () => {
    if (!selectedTask) return;
    try {
      await updateTaskStatus(selectedTask.id, 'pending');
      setSnackbarMessage('Tarefa reaberta como pendente.');
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : 'Não foi possível atualizar a tarefa.'
      );
    }
  };

  if (!selectedTask) {
    return (
      <View className="flex-1 bg-surface">
        <TaskDetailHeader
          title="Detalhes da Tarefa"
          taskId={requestedTaskId ?? '—'}
          onBackPress={() => router.back()}
        />
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="p-4 text-on-surface-variant">
          {tasksLoading
            ? 'Carregando tarefa...'
            : tasksError ?? 'Tarefa não encontrada.'}
        </Text>
      </View>
    );
  }

  const task: TaskDetailInfo = {
    id: selectedTask.id,
    code: `TSK-${selectedTask.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`,
    title: selectedTask.name,
    description: selectedTask.description,
    status: selectedTask.completedAt ? 'completed' : 'pending',
    assignee: selectedTask.assignee.name,
    dueDate: selectedTask.dueDate || 'Sem prazo definido',
    createdAt: formatTaskDate(selectedTask.createdAt) ?? '—',
    completedAt: formatTaskDate(selectedTask.completedAt ?? undefined),
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header específico com botão de voltar e badge do ID da tarefa */}
      <TaskDetailHeader
        title="Detalhes da Tarefa"
        taskId={task.code}
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(app)/(gestor)/home');
          }
        }}
      />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={{ width: '100%', maxWidth: 960, alignSelf: 'center' }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 14, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card de Informações Principais e Metadados da Tarefa */}
        <TaskInfoCard task={task} />

        {/* Card de Observações da Chefia e Inclusão de Apontamentos */}
        <TaskNotesCard
          notes={notes}
          onSaveNote={handleSaveNote}
          loading={notesLoading}
          error={notesError}
        />

        {/* Card de Ações de Controle (Validação e Reabertura) */}
        <TaskControlActionsCard
          isCompleted={task.status === 'completed'}
          onValidateAndArchive={handleValidateAndArchive}
          onReopenTask={handleReopenTask}
        />
      </ScrollView>

      {/* Feedback visual através de Snackbar */}
      <Snackbar
        visible={!!snackbarMessage}
        onDismiss={() => setSnackbarMessage(null)}
        duration={2500}
        style={{ backgroundColor: '#0F2042' }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

function formatTaskDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
