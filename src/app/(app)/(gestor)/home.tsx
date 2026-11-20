import { DelegateTaskModal, DelegationPayload } from '@/components/delegate-task-modal';
import { ManagerHeroCard } from '@/components/manager-hero-card';
import { ManagerStatCard } from '@/components/manager-stat-card';
import { ManagerTaskCard, type ManagerTask } from '@/components/manager-task-card';
import { ScreenHeader } from '@/components/screen-header';
import type { Task } from '@/constants/tasks';
import { useAuth } from '@/hooks/auth-context';
import { useTasks } from '@/hooks/tasks-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState, type ComponentProps } from 'react';
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
  const sectors = [
    ...new Set(
      tasks
        .map((task) => task.sector)
        .filter((sector): sector is string => Boolean(sector))
    ),
  ];
  const companyDisplayName =
    company?.companyName || profile?.companyName || 'Empresa';

  const managerDisplayName = profile?.name || 'Gestor';

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filter === 'all' ||
      (filter === 'archived'
        ? !!task.archivedAt
        : task.status === filter);

    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    const matchesSearch = [
      task.title,
      task.description,
      task.assignee,
      task.sector ?? '',
    ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));

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
            Status
          </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-2"
              contentContainerStyle={{ gap: 8 }}
            >
              <TaskFilterChip
                label={`Todas (${metrics.total})`}
                icon="format-list-bulleted"
                selected={filter === 'all'}
                onPress={() => setFilter('all')}
              />
              <TaskFilterChip
                label={`Pendentes (${metrics.pending})`}
                icon="clock-outline"
                selected={filter === 'pending'}
                onPress={() => setFilter('pending')}
              />
              <TaskFilterChip
                label={`Concluídas (${metrics.completed})`}
                icon="check-circle-outline"
                selected={filter === 'completed'}
                onPress={() => setFilter('completed')}
              />
              <TaskFilterChip
                label={`Arquivadas (${metrics.archived})`}
                icon="archive-outline"
                selected={filter === 'archived'}
                onPress={() => setFilter('archived')}
              />
            </ScrollView>

            <Text className="mt-4 text-sm font-semibold text-on-surface">
              Prioridade
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-2"
              contentContainerStyle={{ gap: 8 }}
            >
              <TaskFilterChip
                label="Todas"
                icon="filter-variant"
                selected={priorityFilter === 'all'}
                onPress={() => setPriorityFilter('all')}
              />
              <TaskFilterChip
                label="Alta"
                icon="fire"
                selected={priorityFilter === 'Alta Prioridade'}
                onPress={() => setPriorityFilter('Alta Prioridade')}
              />
              <TaskFilterChip
                label="Rotina"
                icon="calendar-clock"
                selected={priorityFilter === 'Rotina'}
                onPress={() => setPriorityFilter('Rotina')}
              />
              <TaskFilterChip
                label="Baixa"
                icon="arrow-down-circle-outline"
                selected={priorityFilter === 'Baixa'}
                onPress={() => setPriorityFilter('Baixa')}
              />
            </ScrollView>

            <Text className="mt-4 text-sm font-semibold text-on-surface">
              Funcionário
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-2"
              contentContainerStyle={{ gap: 8 }}
            >
              <TaskFilterChip
                label="Todos"
                icon="account-group-outline"
                selected={employeeFilter === 'all'}
                onPress={() => setEmployeeFilter('all')}
              />
              {employees.map((employee) => (
                <TaskFilterChip
                  key={employee}
                  label={employee}
                  icon="account-outline"
                  selected={employeeFilter === employee}
                  onPress={() => setEmployeeFilter(employee)}
                />
              ))}
            </ScrollView>

            <Text className="mt-4 text-sm font-semibold text-on-surface">
              Setor
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-2 mb-1"
              contentContainerStyle={{ gap: 8 }}
            >
              <TaskFilterChip
                label="Todos os setores"
                icon="domain"
                selected={sectorFilter === 'all'}
                onPress={() => setSectorFilter('all')}
              />
              {sectors.map((sector) => (
                <TaskFilterChip
                  key={sector}
                  label={sector}
                  icon="tag-outline"
                  selected={sectorFilter === sector}
                  onPress={() => setSectorFilter(sector)}
                />
              ))}
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

type TaskFilterChipProps = {
  label: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  selected: boolean;
  onPress: () => void;
};

function TaskFilterChip({
  label,
  icon,
  selected,
  onPress,
}: TaskFilterChipProps) {
  const iconColor = selected ? '#FFFFFF' : '#45464E';

  return (
    <Chip
      mode="flat"
      selected={selected}
      icon={() => (
        <MaterialCommunityIcons name={icon} size={16} color={iconColor} />
      )}
      onPress={onPress}
      style={{
        backgroundColor: selected ? '#0F2042' : '#ECEFF0',
        borderRadius: 12,
      }}
      textStyle={{
        color: iconColor,
        fontWeight: '600',
        fontSize: 12,
      }}
    >
      {label}
    </Chip>
  );
}

function toManagerTask(task: Task): ManagerTask {
  return {
    id: task.id,
    title: task.name,
    description: task.description,
    assignee: task.assignee.name,
    time: task.dueDate,
    sector: task.sector,
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
