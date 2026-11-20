import { TaskDetailHeader } from '@/components/task-detail-header';
import { TaskInfoCard } from '@/components/task-info-card';
import { TaskNotesCard } from '@/components/task-notes-card';
import { ScreenHeader } from '@/components/screen-header';
import { useAuth } from '@/hooks/auth-context';
import { useTasks } from '@/hooks/tasks-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = Array.isArray(id) ? id[0] : id;
  const { profile } = useAuth();
  const { tasks, completeTask } = useTasks();
  const task = tasks.find(
    (item) =>
      item.id === taskId &&
      (item.assignee.uid
        ? item.assignee.uid === profile?.uid
        : item.assignee.name === 'Colaborador' ||
          item.assignee.name === profile?.name)
  );

  if (!task) {
    return (
      <View className="flex-1 bg-surface">
        <ScreenHeader title="Detalhes da Tarefa" />
        <Text className="p-4 text-on-surface-variant">Tarefa não encontrada</Text>
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
          notes={task.notes ?? []}
          readOnly
          title="Mensagens do gestor"
          emptyMessage="O gestor ainda não registrou mensagens para esta tarefa."
        />

        {!isCompleted && (
          <Button
            mode="contained"
            icon="check"
            buttonColor="#0F2042"
            textColor="#FFFFFF"
            contentStyle={{ height: 48 }}
            style={{ borderRadius: 16 }}
            onPress={() => completeTask(task.id)}
          >
            Marcar como Concluída
          </Button>
        )}
      </ScrollView>
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
