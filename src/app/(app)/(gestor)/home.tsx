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
import { Alert, FlatList, ScrollView, Text, View, useWindowDimensions, } from 'react-native';
import { Button, Chip, FAB, Searchbar, Snackbar } from 'react-native-paper';

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
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
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
  } = useTasks();
  const tasks = useMemo(() => allTasks.map(toManagerTask), [allTasks]);
  const [delegateVisible, setDelegateVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

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
    const matchesStatus = filter === 'all' || task.status === filter;

    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());

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
 <Chip
  selected={dateSort === 'asc'}
  onPress={() => {
    setDateSort('asc');
    setAlphabeticalSort('default');
  }}
>
  Mais próximas
</Chip>
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
