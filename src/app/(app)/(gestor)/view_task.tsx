import { TaskControlActionsCard } from '@/components/task-control-actions-card';
import { TaskDetailHeader } from '@/components/task-detail-header';
import { TaskInfoCard, type TaskDetailInfo } from '@/components/task-info-card';
import { TaskNotesCard, type TaskNote } from '@/components/task-notes-card';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Snackbar } from 'react-native-paper';

// Dados definidos localmente no próprio arquivo (sem mock externo)
const INITIAL_TASK: TaskDetailInfo = {
  id: 'RF06',
  code: 'RF06',
  title: 'Configuração do Runner CI/CD',
  description:
    'Instalar e validar o novo runner na organização, configurar as tags de execução e revisar os workflows de deploy.',
  status: 'completed',
  assignee: 'Rafael Horeay',
  dueDate: '18/10 às 16:00',
  createdAt: '16/10 às 09:30',
  completedAt: '18/10 às 15:42',
};

const INITIAL_NOTES: TaskNote[] = [
  {
    id: '1',
    author: 'João Pedro',
    role: 'Supervisor',
    timestamp: 'Ontem',
    content:
      'Confirmar a versão do runner e o cache de dependências antes de encerrar a configuração.',
  },
];

export default function GestorViewTaskScreen() {
  const router = useRouter();
  const [task, setTask] = useState<TaskDetailInfo>(INITIAL_TASK);
  const [notes, setNotes] = useState<TaskNote[]>(INITIAL_NOTES);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const handleSaveNote = (content: string) => {
    const newNote: TaskNote = {
      id: Date.now().toString(),
      author: 'João Pedro',
      role: 'Supervisor',
      timestamp: 'Agora',
      content,
    };
    setNotes((prev) => [...prev, newNote]);
    setSnackbarMessage('Nota adicionada com sucesso!');
  };

  const handleValidateAndArchive = () => {
    setTask((prev) => ({
      ...prev,
      status: 'completed',
      completedAt: prev.completedAt ?? '18/10 às 15:42',
    }));
    Alert.alert(
      'Tarefa Validada',
      'A tarefa foi validada e arquivada com sucesso pelo gestor.',
      [{ text: 'OK' }]
    );
  };

  const handleReopenTask = () => {
    setTask((prev) => ({
      ...prev,
      status: 'pending',
      completedAt: undefined,
    }));
    Alert.alert(
      'Tarefa Reaberta',
      'A tarefa foi reaberta com status Pendente para revisão da equipe.',
      [{ text: 'OK' }]
    );
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card de Informações Principais e Metadados da Tarefa */}
        <TaskInfoCard task={task} />

        {/* Card de Observações da Chefia e Inclusão de Apontamentos */}
        <TaskNotesCard notes={notes} onSaveNote={handleSaveNote} />

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
