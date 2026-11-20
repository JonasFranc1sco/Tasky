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

import {
  Alert,
  FlatList,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  Button,
  Chip,
  Dialog,
  FAB,
  Portal,
  Searchbar,
  Snackbar,
} from 'react-native-paper';

// Dados definidos localmente no próprio arquivo (sem mock externo)
const METRICS_DATA = {
  total: 14,
  pending: 6,
  completed: 8,
  completedPercentage: '57% concluído',
};

const INITIAL_TASKS: ManagerTask[] = [
  {
    id: '1',
    title: 'Code Review do PR #482',
    description: 'Revisar os arquivos alterados, validar a cobertura de testes e aprovar ou solicitar correções.',
    assignee: 'Rafael Horeay',
    time: 'Hoje, 17:00',
    status: 'pending',
    category: 'Alta Prioridade',
  },
  {
    id: '2',
    title: 'Configuração do Runner CI/CD',
    description: 'Instalar o novo runner, definir tags de execução e revisar os workflows de deploy.',
    assignee: 'Eduarda Najara',
    time: 'Hoje, 11:30',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Auditoria de Cobertura de Testes',
    description: 'Levantar a cobertura dos módulos críticos e gerar relatório para o Sprint.',
    assignee: 'Kemily Freitas',
    time: 'Amanhã, 18:00',
    status: 'pending',
    category: 'Rotina',
  },
];
function getTaskDate(time: string): number {
  if (!time) return NaN;

  const value = time.trim();

  // Datas no formato DD/MM/AAAA
  const dateMatch = value.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/
  );

  if (dateMatch) {
    const [, day, month, year, hour = '0', minute = '0'] = dateMatch;

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute)
    ).getTime();
  }

  // Datas relativas
  const now = new Date();

  if (value.startsWith('Hoje')) {
    const result = new Date(now);
    const match = value.match(/(\d{1,2}):(\d{2})/);

    if (match) {
      result.setHours(Number(match[1]), Number(match[2]), 0, 0);
    }

    return result.getTime();
  }

  if (value.startsWith('Amanhã')) {
    const result = new Date(now);
    result.setDate(result.getDate() + 1);

    const match = value.match(/(\d{1,2}):(\d{2})/);

    if (match) {
      result.setHours(Number(match[1]), Number(match[2]), 0, 0);
    }

    return result.getTime();
  }

  // Datas ISO
  return Date.parse(value);
}
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
  const [dateSort, setDateSort] = useState<'default' | 'asc' | 'desc'>('default');
  const [alphabeticalSort, setAlphabeticalSort] =
  useState<'default' | 'asc' | 'desc'>('default');
  const handleClearFilters = () => {
  setSearchQuery('');
  setEmployeeFilter('all');
  setSectorFilter('all');
  setPriorityFilter('all');
  setDateSort('default');
  setFilter('all');
  setAlphabeticalSort('default');
};
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

    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    const matchesSearch = [
      task.title,
      task.description,
      task.assignee,
      task.sector ?? '',
    ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));

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
const sortedTasks = [...filteredTasks].sort((a, b) => {
  if (alphabeticalSort === 'asc') {
    return a.title.localeCompare(b.title, 'pt-BR');
  }

  if (alphabeticalSort === 'desc') {
    return b.title.localeCompare(a.title, 'pt-BR');
  }

  if (dateSort !== 'default') {
    const dateA = getTaskDate(a.time);
    const dateB = getTaskDate(b.time);

    if (!Number.isFinite(dateA) && !Number.isFinite(dateB)) return 0;
    if (!Number.isFinite(dateA)) return 1;
    if (!Number.isFinite(dateB)) return -1;

    return dateSort === 'asc'
      ? dateA - dateB
      : dateB - dateA;
  }

  return 0;
});
const totalFilteredTasks = filteredTasks.length;
const activeFiltersCount = [
  searchQuery.trim() !== '',
  priorityFilter !== 'all',
  employeeFilter !== 'all',
  sectorFilter !== 'all',
  dateSort !== 'default',
  alphabeticalSort !== 'default',
  filter !== 'all',
].filter(Boolean).length;
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
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
  !tasksLoading ? (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#0F2042',
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        Nenhuma tarefa encontrada
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: '#45464E',
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        Tente alterar os filtros ou limpar a pesquisa
        para visualizar outras tarefas.
      </Text>

      <Button
        mode="contained"
        icon="filter-remove"
        onPress={handleClearFilters}
      >
        {activeFiltersCount > 0 && (
  <View
    style={{
      marginTop: 12,
      padding: 10,
      backgroundColor: '#E8EEF8',
      borderRadius: 12,
    }}
  >
    <Text
      style={{
        color: '#0F2042',
        fontSize: 13,
        fontWeight: '600',
      }}
    >
      {activeFiltersCount === 1
        ? '1 filtro ativo'
        : `${activeFiltersCount} filtros ativos`}
    </Text>
  </View>
)}
        Limpar filtros
      </Button>
    </View>
  ) : null
}
        ListHeaderComponent={
          <>
          <Text
  style={{
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#45464E',
  }}
>
  {totalFilteredTasks === 0
    ? 'Nenhuma tarefa encontrada'
    : `${totalFilteredTasks} ${
        totalFilteredTasks === 1
          ? 'tarefa encontrada'
          : 'tarefas encontradas'
      }`}
</Text>
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

        <Text className="mt-4 text-sm font-semibold text-on-surface">
          Ordenar por prazo
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2"
          contentContainerStyle={{ gap: 8 }}
        >
          <Chip
            selected={dateSort === 'default'}
            onPress={() => setDateSort('default')}
          >
            Padrão
          </Chip>

          <Chip
            selected={dateSort === 'asc'}
            onPress={() => {
              setDateSort('asc');
              setAlphabeticalSort('default');
            }}
          >
            Mais próximas
          </Chip>

          <Chip
            selected={dateSort === 'desc'}
            onPress={() => {
              setDateSort('desc');
              setAlphabeticalSort('default');
            }}
          >
            Mais distantes
          </Chip>
        </ScrollView>

        <Text className="mt-4 text-sm font-semibold text-on-surface">
          Ordenar por título
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2"
          contentContainerStyle={{ gap: 8 }}
        >
          <Chip
            selected={alphabeticalSort === 'default'}
            onPress={() => setAlphabeticalSort('default')}
          >
            Padrão
          </Chip>

          <Chip
            selected={alphabeticalSort === 'asc'}
            onPress={() => {
              setAlphabeticalSort('asc');
              setDateSort('default');
            }}
          >
            A–Z
          </Chip>

          <Chip
            selected={alphabeticalSort === 'desc'}
            onPress={() => {
              setAlphabeticalSort('desc');
              setDateSort('default');
            }}
          >
            Z–A
          </Chip>
        </ScrollView>

        {/* Filtros de status */}
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
            <Button
  mode="outlined"
  icon="filter-remove"
  onPress={handleClearFilters}
  style={{ marginVertical: 12 }}
>
  Limpar filtros
</Button>
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
