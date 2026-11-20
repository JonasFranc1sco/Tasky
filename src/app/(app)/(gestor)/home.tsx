import { DelegateTaskModal, DelegationPayload } from '@/components/delegate-task-modal';
import { ManagerHeroCard } from '@/components/manager-hero-card';
import { ManagerStatCard } from '@/components/manager-stat-card';
import { ManagerTaskCard, type ManagerTask } from '@/components/manager-task-card';
import { ScreenHeader } from '@/components/screen-header';
import type { Task } from '@/constants/tasks';
import { useAuth } from '@/hooks/auth-context';
import { useTasks } from '@/hooks/tasks-context';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import {
  Button,
  Chip,
  Dialog,
  FAB,
  Portal,
  Searchbar,
  Snackbar,
} from 'react-native-paper';

export default function GestorHomeScreen() {
  const router = useRouter();
  const { profile, company } = useAuth();
  const { width } = useWindowDimensions();
  const numColumns = width >= 1080 ? 2 : 1;
  const isWideMetrics = width >= 600;
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'completed' | 'archived'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const {
    tasks: allTasks,
    metrics,
    loading: tasksLoading,
    error: tasksError,
    addTask,
    updateTaskStatus,
    deleteTask: removeTask,
  } = useTasks();
  const tasks = useMemo(() => allTasks.map(toManagerTask), [allTasks]);
  const [delegateVisible, setDelegateVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [pendingDeleteTask, setPendingDeleteTask] = useState<ManagerTask | null>(
    null
  );
  const [deleteTaskError, setDeleteTaskError] = useState<string | null>(null);
  const [deletingTask, setDeletingTask] = useState(false);

  const employees = [...new Set(tasks.map((task) => task.assignee))];
  const companyDisplayName =
    company?.companyName || profile?.companyName || 'Empresa';

  const managerDisplayName = profile?.name || 'Gestor';

  const sectors = [
  ...new Set(
    tasks
      .map((task) => task.sector)
      .filter((sector): sector is string => Boolean(sector))
  ),
];

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filter === 'all' ||
      (filter === 'archived'
        ? !!task.archivedAt
        : task.status === filter);

    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());

    const matchesPriority =
      priorityFilter === 'all' || task.category === priorityFilter;

    const matchesPriority =
      priorityFilter === 'all' || task.category === priorityFilter;

    const matchesEmployee =
      employeeFilter === 'all' || task.assignee === employeeFilter;

    const matchesSector =
      sectorFilter === 'all' || task.sector === sectorFilter;

    return (
      matchesStatus &&
      matchesSearch &&
      matchesPriority &&
      matchesEmployee &&
      matchesSector
    );
  });

  const handleDelegate = async (payload: DelegationPayload) => {
    await addTask({
      name: payload.title,
      description: payload.description,
      assignee: {
        name: payload.assignee.name,
        uid: payload.assignee.uid,
      },
      dueDate: payload.dueDate,
      sector: payload.sector,
      priority:
        payload.priority === 'Alta Prioridade'
          ? 'alta'
          : payload.priority === 'Baixa'
            ? 'baixa'
            : 'media',
      category: payload.priority,
    });

    setDelegateVisible(false);
    setSnackbarMessage('Tarefa delegada e sincronizada.');
  };

  const handleDeleteTask = (task: ManagerTask) => {
    setDeleteTaskError(null);
    setPendingDeleteTask(task);
  };

  const handleConfirmDeleteTask = async () => {
    if (!pendingDeleteTask) return;

    setDeletingTask(true);
    setDeleteTaskError(null);
    try {
      await removeTask(pendingDeleteTask.id);
      setPendingDeleteTask(null);
      setSnackbarMessage('Tarefa excluída.');
    } catch (failure) {
      setDeleteTaskError(
        failure instanceof Error ? failure.message : 'Tente novamente.'
      );
    } finally {
      setDeletingTask(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header padrão da aplicação através do componente ScreenHeader */}
      <ScreenHeader title="Inicio Tarefas" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        key={numColumns}
        style={{ width: '100%', maxWidth: 1120, alignSelf: 'center' }}
        data={filteredTasks}
        ListEmptyComponent={
          <Text className="py-6 text-center text-sm text-on-surface-variant">
            {tasksLoading
              ? 'Sincronizando tarefas...'
              : tasksError ?? 'Nenhuma tarefa cadastrada nesta empresa.'}
          </Text>
        }
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? { gap: 12 } : undefined}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Banner do Gestor */}
            <ManagerHeroCard
              greeting={`Olá, ${managerDisplayName} 👋`}
              company={companyDisplayName}
              date="Hoje, 24 de Out"
            />

            {/* Cards de Métricas */}
            <View
              className="mt-4 gap-2.5"
              style={{ flexDirection: 'row', flexWrap: isWideMetrics ? 'nowrap' : 'wrap' }}
            >
              <View style={{ width: isWideMetrics ? undefined : '48%', flexGrow: isWideMetrics ? 1 : 0 }}>
                <ManagerStatCard
                  title="Total"
                  value={metrics.total}
                  subtitle="Tarefas cadastradas"
                />
              </View>
              <View style={{ width: isWideMetrics ? undefined : '48%', flexGrow: isWideMetrics ? 1 : 0 }}>
                <ManagerStatCard
                  title="Pendentes"
                  value={metrics.pending}
                  subtitle="Requer ação"
                />
              </View>
              <View style={{ width: isWideMetrics ? undefined : '48%', flexGrow: isWideMetrics ? 1 : 0 }}>
                <ManagerStatCard
                  title="Concluídas"
                  value={metrics.completed}
                  subtitle={metrics.completedPercentage}
                />
              </View>
              <View style={{ width: isWideMetrics ? undefined : '48%', flexGrow: isWideMetrics ? 1 : 0 }}>
                <ManagerStatCard
                  title="Arquivadas"
                  value={metrics.archived}
                  subtitle="Tarefas validadas"
                />
              </View>
            </View>

            {/* Botão Paper Nova Tarefa • Delegar */}
            <Button
              mode="contained"
              icon="plus"
              buttonColor="#0F2042"
              textColor="#FFFFFF"
              contentStyle={{ height: 48 }}
              style={{ borderRadius: 16, marginTop: 16 }}
              labelStyle={{ fontWeight: '600', fontSize: 14 }}
              onPress={() => setDelegateVisible(true)}
            >
              Nova Tarefa • Delegar
            </Button>

            {/* Cabeçalho da Seção de Tarefas Recentes */}
            <View className="mt-6 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-bold text-on-surface">
                  Tarefas Recentes
                </Text>
                <View className="rounded-full bg-surface-container px-2 py-0.5">
                  <Text className="text-xs font-medium text-on-surface-variant">
                    {filteredTasks.length} tarefas
                  </Text>
                </View>
              </View>

            </View>
          <Searchbar
            placeholder="Pesquisar tarefas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
            marginTop: 12,
            backgroundColor: '#ECEFF0',
            borderRadius: 12,
            }}
            inputStyle={{ fontSize: 14 }}
/>
<Text className="mt-4 text-sm font-semibold text-on-surface">
  Filtrar por funcionário
</Text>

<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  className="mt-2"
  contentContainerStyle={{ gap: 8 }}
>
  <Text className="mt-4 text-sm font-semibold text-on-surface">
  Filtrar por setor
</Text>

<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  className="mt-2"
  contentContainerStyle={{ gap: 8 }}
>
  <Chip
    selected={sectorFilter === 'all'}
    onPress={() => setSectorFilter('all')}
  >
    Todos os setores
  </Chip>

  {sectors.map((sector) => (
    <Chip
      key={sector}
      selected={sectorFilter === sector}
      onPress={() => setSectorFilter(sector)}
    >
      {sector}
    </Chip>
  ))}
</ScrollView>
  <Chip
    selected={employeeFilter === 'all'}
    onPress={() => setEmployeeFilter('all')}
  >
    Todos
  </Chip>

  {employees.map((employee) => (
    <Chip
      key={employee}
      selected={employeeFilter === employee}
      onPress={() => setEmployeeFilter(employee)}
    >
      {employee}
    </Chip>
  ))}
</ScrollView>
<View className="mt-3 flex-row flex-wrap gap-2">
  {[
    { label: 'Todas prioridades', value: 'all' },
    { label: 'Alta', value: 'Alta Prioridade' },
    { label: 'Rotina', value: 'Rotina' },
    { label: 'Baixa', value: 'Baixa' },
  ].map((item) => (
    <Chip
      key={item.value}
      selected={priorityFilter === item.value}
      onPress={() => setPriorityFilter(item.value)}
      style={{
        backgroundColor:
          priorityFilter === item.value ? '#0F2042' : '#ECEFF0',
        borderRadius: 12,
      }}
      textStyle={{
        color:
          priorityFilter === item.value ? '#FFFFFF' : '#45464E',
        fontSize: 12,
      }}
    >
      {item.label}
    </Chip>
  ))}
</View>
            {/* Chips de Filtro com Paper */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3 mb-1"
              contentContainerStyle={{ gap: 8 }}
            >
              <Chip
                mode="flat"
                selected={filter === 'all'}
                icon="format-list-bulleted"
                onPress={() => setFilter('all')}
                style={{
                  backgroundColor: filter === 'all' ? '#0F2042' : '#ECEFF0',
                  borderRadius: 12,
                }}
                textStyle={{
                  color: filter === 'all' ? '#FFFFFF' : '#45464E',
                  fontWeight: '600',
                  fontSize: 12,
                }}
              >
                Todas
              </Chip>

              <Chip
                mode="flat"
                selected={filter === 'pending'}
                icon={() => (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: filter === 'pending' ? '#FFFFFF' : '#45464E',
                    }}
                  />
                )}
                onPress={() => setFilter('pending')}
                style={{
                  backgroundColor: filter === 'pending' ? '#0F2042' : '#ECEFF0',
                  borderRadius: 12,
                }}
                textStyle={{
                  color: filter === 'pending' ? '#FFFFFF' : '#45464E',
                  fontWeight: '600',
                  fontSize: 12,
                }}
              >
                Pendentes ({metrics.pending})
              </Chip>

              <Chip
                mode="flat"
                selected={filter === 'completed'}
                icon={() => (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: filter === 'completed' ? '#FFFFFF' : '#45464E',
                    }}
                  />
                )}
                onPress={() => setFilter('completed')}
                style={{
                  backgroundColor: filter === 'completed' ? '#0F2042' : '#ECEFF0',
                  borderRadius: 12,
                }}
                textStyle={{
                  color: filter === 'completed' ? '#FFFFFF' : '#45464E',
                  fontWeight: '600',
                  fontSize: 12,
                }}
              >
                Concluídas ({metrics.completed})
              </Chip>

              <Chip
                mode="flat"
                selected={filter === 'archived'}
                icon="archive-outline"
                onPress={() => setFilter('archived')}
                style={{
                  backgroundColor: filter === 'archived' ? '#0F2042' : '#ECEFF0',
                  borderRadius: 12,
                }}
                textStyle={{
                  color: filter === 'archived' ? '#FFFFFF' : '#45464E',
                  fontWeight: '600',
                  fontSize: 12,
                }}
              >
                Arquivadas ({metrics.archived})
              </Chip>
            </ScrollView>
          </>
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1, maxWidth: numColumns > 1 ? '49%' : '100%' }}>
            <ManagerTaskCard
              task={item}
              onPress={() =>
                router.push(
                  `/(app)/(gestor)/view_task?taskId=${encodeURIComponent(item.id)}`
                )
              }
              onToggleStatus={() => {
                void updateTaskStatus(
                  item.id,
                  item.status === 'completed' ? 'pending' : 'completed'
                ).catch((failure: unknown) => {
                  Alert.alert(
                    'Não foi possível atualizar',
                    failure instanceof Error ? failure.message : 'Tente novamente.'
                  );
                });
              }}
              onDelete={() => handleDeleteTask(item)}
            />
          </View>
        )}
      />

      {/* FAB Flutuante com Paper */}
      <FAB
        icon="plus"
        color="#FFFFFF"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: '#0F2042',
          borderRadius: 28,
        }}
        onPress={() => setDelegateVisible(true)}
      />

      <DelegateTaskModal
        visible={delegateVisible}
        onDismiss={() => setDelegateVisible(false)}
        onConfirm={handleDelegate}
      />
      <Portal>
        <Dialog
          visible={!!pendingDeleteTask}
          onDismiss={() => {
            if (!deletingTask) setPendingDeleteTask(null);
          }}
        >
          <Dialog.Title>Excluir tarefa?</Dialog.Title>
          <Dialog.Content>
            <Text className="text-sm text-on-surface-variant">
              {pendingDeleteTask
                ? `"${pendingDeleteTask.title}" será excluída permanentemente.`
                : ''}
            </Text>
            {deleteTaskError ? (
              <Text className="mt-3 text-sm text-error">{deleteTaskError}</Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setPendingDeleteTask(null)}
              disabled={deletingTask}
            >
              Cancelar
            </Button>
            <Button
              textColor="#BA1A1A"
              onPress={() => void handleConfirmDeleteTask()}
              disabled={deletingTask}
              loading={deletingTask}
            >
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar
        visible={!!snackbarMessage}
        onDismiss={() => setSnackbarMessage(null)}
        duration={2500}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

function toManagerTask(task: Task): ManagerTask {
  return {
    id: task.id,
    title: task.name,
    description: task.description,
    assignee: task.assignee.name,
    time: task.dueDate,
    status: task.completedAt ? 'completed' : 'pending',
    category:
      task.category ??
      (task.priority === 'alta'
        ? 'Alta Prioridade'
        : task.priority === 'baixa'
          ? 'Baixa'
          : task.priority === 'media'
            ? 'Rotina'
            : undefined),
    createdAt: task.createdAt,
    completedAt: task.completedAt ?? undefined,
    archivedAt: task.archivedAt ?? undefined,
  };
}
