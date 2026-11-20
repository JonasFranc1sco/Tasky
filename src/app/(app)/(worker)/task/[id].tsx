import { TaskDetailHeader } from '@/components/task-detail-header';
import { TaskInfoCard } from '@/components/task-info-card';
import { TaskNotesCard } from '@/components/task-notes-card';
import { ScreenHeader } from '@/components/screen-header';
import { useAuth } from '@/hooks/auth-context';
import { useTaskNotes } from '@/hooks/task-notes';
import { useTasks } from '@/hooks/tasks-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { useState } from 'react';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = Array.isArray(id) ? id[0] : id;
  const { profile } = useAuth();
  const { tasks, loading, error, completeTask } = useTasks();
  const task = tasks.find(
    (item) =>
      item.id === taskId &&
      (item.assignee.uid
        ? item.assignee.uid === profile?.uid
        : item.assignee.name === 'Colaborador' ||
          item.assignee.name === profile?.name)
  );
  const { notes, loading: notesLoading, error: notesError } =
    useTaskNotes(task?.id ?? null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  if (!task) {
    return (
      <View className="flex-1 bg-surface">
        <ScreenHeader title="Detalhes da Tarefa" />
        <Text className="p-4 text-on-surface-variant">
          {loading ? 'Carregando tarefa...' : error ?? 'Tarefa não encontrada.'}
        </Text>
      </View>
    );
  }

  const isCompleted = !!task.completedAt;

  return (
    <View className="flex-1 bg-surface">
      <TaskDetailHeader
        title="Detalhes da Tarefa"
        taskId={task.id}
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(app)/(worker)/task');
          }
        }}
      />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={{ width: '100%', maxWidth: 960, alignSelf: 'center' }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 14, flexGrow: 1 }}
      >
        <TaskInfoCard
          task={{
            id: task.id,
            code: task.id,
            title: task.name,
            description: task.description,
            status: isCompleted ? 'completed' : 'pending',
            assignee: task.assignee.name,
            dueDate: task.dueDate || 'Sem prazo definido',
            createdAt: formatTaskDate(task.createdAt) ?? '—',
            completedAt: formatTaskDate(task.completedAt),
          }}
        />

        <TaskNotesCard
          notes={notes}
          readOnly
          title="Mensagens do gestor"
          emptyMessage="O gestor ainda não registrou mensagens para esta tarefa."
          loading={notesLoading}
          error={notesError}
        />

        {!isCompleted && (
          <Button
            mode="contained"
            icon="check"
            buttonColor="#0F2042"
            textColor="#FFFFFF"
            contentStyle={{ height: 48 }}
            style={{ borderRadius: 16 }}
            onPress={() => {
              void completeTask(task.id)
                .then(() => setSnackbarVisible(true))
                .catch((failure: unknown) =>
                  Alert.alert(
                    'Não foi possível concluir',
                    failure instanceof Error ? failure.message : 'Tente novamente.'
                  )
                );
            }}
          >
            Marcar como Concluída
          </Button>
        )}
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2200}
      >
        Tarefa marcada como concluída.
      </Snackbar>
    </View>
  );
}

function formatTaskDate(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
