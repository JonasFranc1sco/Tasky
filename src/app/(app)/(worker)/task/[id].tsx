import { useTasks } from '@/hooks/tasks-context';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Button, Divider } from 'react-native-paper';

export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { tasks, completeTask } = useTasks();
    const task = tasks.find((t) => t.id === id);

    if (!task) return <Text className="p-4 text-on-surface-variant">Tarefa não encontrada</Text>;

    return(
    <ScrollView className="flex-1 bg-surface p-4" contentContainerStyle={{ gap: 12 }}>
      <Text className="text-xl font-bold text-on-surface">{task.name}</Text>
      <Text className="text-sm text-on-surface-variant">{task.description}</Text>
      <Divider />
      <View>
        <Text className="text-[11px] text-on-surface-variant">Prazo de entrega</Text>
        <Text className="text-base text-on-surface">{task.dueDate}</Text>
      </View>
      <View>
        <Text className="text-[11px] text-on-surface-variant">Responsável</Text>
        <Text className="text-base text-on-surface">{task.assignee.name}</Text>
      </View>
      <View>
        <Text className="text-[11px] text-on-surface-variant">Status</Text>
        <Text className="text-base text-on-surface">
          {task.completedAt ? `Concluída ${new Date(task.completedAt).toLocaleDateString('pt-BR')}` : 'Pendente'}
        </Text>
      </View>
      {!task.completedAt && (
        <Button mode="contained" icon="check" onPress={() => completeTask(task.id)}>
          Marcar como Concluída
        </Button>
      )}
    </ScrollView>
    );
}
