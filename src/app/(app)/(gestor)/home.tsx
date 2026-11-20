import { DelegateTaskModal, type DelegationPayload } from '@/components/delegate-task-modal';
import { ManagerHeroCard } from '@/components/manager-hero-card';
import { ManagerStatCard } from '@/components/manager-stat-card';
import { ManagerTaskCard } from '@/components/manager-task-card';
import { ScreenHeader } from '@/components/screen-header';
import { useAuth } from '@/hooks/auth-context';
import { useTasks } from '@/hooks/tasks-context';
import { taskErrorMessage } from '@/services/task-service';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';
import { Stack, useRouter } from 'expo-router';
import { useRef, useState, type ComponentProps } from 'react';
import { FlatList, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Button, Chip, Dialog, FAB, Portal, Searchbar, Snackbar } from 'react-native-paper';

type TaskOrder = 'recent' | 'due-asc' | 'due-desc' | 'title-asc' | 'title-desc';

const priorities: FilterOption<'all' | TaskPriority>[] = [
  { value: 'all', label: 'Todas' },
  { value: 'Alta Prioridade', label: 'Alta', icon: 'fire' },
  { value: 'Rotina', label: 'Rotina', icon: 'calendar-clock' },
  { value: 'Baixa', label: 'Baixa', icon: 'arrow-down-circle-outline' },
];

const orders: FilterOption<TaskOrder>[] = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'due-asc', label: 'Prazo mais próximo' },
  { value: 'due-desc', label: 'Prazo mais distante' },
  { value: 'title-asc', label: 'A–Z' },
  { value: 'title-desc', label: 'Z–A' },
];

export default function GestorHomeScreen() {
  const router = useRouter();
  const { profile, company } = useAuth();
  const { width } = useWindowDimensions();
  const columns = width >= 1080 ? 2 : 1;
  const { tasks, metrics, loading, error, delegateTask, completeTask, reopenTask, deleteTask } = useTasks();
  const [status, setStatus] = useState<'all' | TaskStatus>('all');
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<'all' | TaskPriority>('all');
  const [employee, setEmployee] = useState('');
  const [sector, setSector] = useState('');
  const [order, setOrder] = useState<TaskOrder>('recent');
  const [delegateVisible, setDelegateVisible] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const deleteInProgress = useRef(false);

  const query = search.trim().toLocaleLowerCase('pt-BR');
  const employees = new Map<string, string>();
  for (const task of tasks) {
    if (task.assigneeUid && !employees.has(task.assigneeUid)) {
      employees.set(task.assigneeUid, task.assigneeName);
    }
  }
  const employeeOptions = [...employees].map(([value, label]) => ({ value, label }));
  employeeOptions.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  const sectors = [...new Set(tasks.map((task) => task.sector).filter(Boolean))];
  sectors.sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const visibleTasks = tasks.filter((task) => {
    const matchesSearch = !query || [task.title, task.description, task.assigneeName, task.sector]
      .some((value) => value.toLocaleLowerCase('pt-BR').includes(query));
    return matchesSearch && (status === 'all' || task.status === status)
      && (priority === 'all' || task.priority === priority)
      && (!employee || task.assigneeUid === employee)
      && (!sector || task.sector === sector);
  });
  if (order !== 'recent') visibleTasks.sort((a, b) => compareTasks(a, b, order));

  const activeFilters = [Boolean(query), status !== 'all', priority !== 'all', Boolean(employee),
    Boolean(sector), order !== 'recent'].filter(Boolean).length;

  function clearFilters() {
    setSearch('');
    setStatus('all');
    setPriority('all');
    setEmployee('');
    setSector('');
    setOrder('recent');
  }

  async function handleDelegate({ assignee, ...task }: DelegationPayload) {
    await delegateTask(task, assignee);
    setDelegateVisible(false);
  }

  async function changeStatus(task: Task) {
    try {
      await (task.status === 'pending' ? completeTask(task.id) : reopenTask(task.id));
    } catch (cause) {
      setMessage(taskErrorMessage(cause, 'Não foi possível atualizar a tarefa.'));
    }
  }

  function openDeleteDialog(task: Task) {
    setDeleteError(null);
    setPendingDelete(task);
  }

  async function confirmDelete() {
    if (!pendingDelete || deleteInProgress.current) return;
    deleteInProgress.current = true;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteTask(pendingDelete.id);
      setPendingDelete(null);
      setMessage('Tarefa excluída.');
    } catch (cause) {
      setDeleteError(taskErrorMessage(cause, 'Não foi possível excluir a tarefa. Tente novamente.'));
    } finally {
      deleteInProgress.current = false;
      setDeleting(false);
    }
  }

  const metricCards = [
    { title: 'Total', value: metrics.total, subtitle: metrics.completedPercentage },
    { title: 'Pendentes', value: metrics.pending, subtitle: 'Requerem ação' },
    { title: 'Concluídas', value: metrics.completed, subtitle: 'Aguardam validação' },
    { title: 'Arquivadas', value: metrics.archived, subtitle: 'Validadas pelo gestor' },
  ];

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Início Tarefas" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        key={columns}
        data={visibleTasks}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? { gap: 12 } : undefined}
        keyExtractor={(task) => task.id}
        style={{ width: '100%', maxWidth: 1120, alignSelf: 'center' }}
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <ManagerHeroCard
              greeting={`Olá, ${profile?.name || 'Gestor'} 👋`}
              company={company?.companyName || profile?.companyName || 'Empresa'}
              date={new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
            />

            <View className="mt-4 flex-row flex-wrap gap-2.5">
              {metricCards.map((card) => (
                <View key={card.title} style={{ flexBasis: width >= 600 ? 0 : '46%', flexGrow: 1 }}>
                  <ManagerStatCard {...card} />
                </View>
              ))}
            </View>

            <Button mode="contained" icon="plus" className="mt-4" onPress={() => setDelegateVisible(true)}>
              Nova Tarefa • Delegar
            </Button>

            <Searchbar
              className="mt-6"
              placeholder="Pesquisar tarefas..."
              value={search}
              onChangeText={setSearch}
            />
            <TaskFilterRow<'all' | TaskStatus>
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: 'all', label: `Todas (${metrics.total})`, icon: 'format-list-bulleted' },
                { value: 'pending', label: `Pendentes (${metrics.pending})`, icon: 'clock-outline' },
                { value: 'completed', label: `Concluídas (${metrics.completed})`, icon: 'check-circle-outline' },
                { value: 'archived', label: `Arquivadas (${metrics.archived})`, icon: 'archive-outline' },
              ]}
            />
            <TaskFilterRow label="Prioridade" options={priorities} value={priority} onChange={setPriority} />
            {(employeeOptions.length > 0 || employee) && (
              <TaskFilterRow label="Funcionário" options={[{ value: '', label: 'Todos' }, ...employeeOptions]}
                value={employee} onChange={setEmployee} />
            )}
            {(sectors.length > 0 || sector) && (
              <TaskFilterRow label="Setor" options={[{ value: '', label: 'Todos' }, ...sectors.map((name) => ({ value: name, label: name }))]}
                value={sector} onChange={setSector} />
            )}
            <TaskFilterRow label="Ordenar por" options={orders} value={order} onChange={setOrder} />

            <View className="mt-4 flex-row flex-wrap items-center justify-between gap-2">
              <Text className="text-base font-bold text-on-surface">
                {visibleTasks.length} {visibleTasks.length === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}
              </Text>
              {activeFilters > 0 && (
                <Button mode="outlined" icon="filter-remove" compact onPress={clearFilters}>
                  Limpar filtros ({activeFilters})
                </Button>
              )}
            </View>
          </>
        }
        ListEmptyComponent={loading ? <ActivityIndicator /> : (
          <Text className={error ? 'text-error' : 'text-on-surface-variant'}>
            {error ?? 'Nenhuma tarefa encontrada.'}
          </Text>
        )}
        renderItem={({ item }) => (
          <View style={{ flex: 1, maxWidth: columns > 1 ? '50%' : '100%' }}>
            <ManagerTaskCard
              task={item}
              onPress={() => router.push({ pathname: '/(app)/(gestor)/view_task', params: { id: item.id } })}
              onToggleStatus={() => void changeStatus(item)}
              onDelete={() => openDeleteDialog(item)}
            />
          </View>
        )}
      />

      <FAB icon="plus" style={{ position: 'absolute', right: 16, bottom: 16 }}
        onPress={() => setDelegateVisible(true)} />
      <DelegateTaskModal visible={delegateVisible} onDismiss={() => setDelegateVisible(false)} onConfirm={handleDelegate} />

      <Portal>
        <Dialog visible={Boolean(pendingDelete)} dismissable={!deleting} onDismiss={() => setPendingDelete(null)}
          style={{ width: '90%', maxWidth: 480, alignSelf: 'center' }}>
          <Dialog.Title>{pendingDelete?.deleting ? 'Retomar exclusão' : 'Excluir tarefa'}</Dialog.Title>
          <Dialog.Content>
            <Text className="text-on-surface">
              {pendingDelete?.title} e suas observações serão excluídas permanentemente.
            </Text>
            {deleteError && <Text className="mt-3 text-error">{deleteError}</Text>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button disabled={deleting} onPress={() => setPendingDelete(null)}>Fechar</Button>
            <Button textColor="#BA1A1A" loading={deleting} disabled={deleting} onPress={confirmDelete}>Excluir</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar visible={Boolean(message)} onDismiss={() => setMessage(null)}>{message}</Snackbar>
    </View>
  );
}

type FilterOption<Value extends string> = {
  value: Value;
  label: string;
  icon?: ComponentProps<typeof Chip>['icon'];
};

function TaskFilterRow<Value extends string>({ label, options, value, onChange }: {
  label: string;
  options: FilterOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
}) {
  return (
    <View className="mt-3 gap-1.5">
      <Text className="text-sm font-semibold text-on-surface">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {options.map((option) => (
          <Chip key={option.value} selected={value === option.value} icon={option.icon}
            onPress={() => onChange(option.value)}>
            {option.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

function compareTasks(a: Task, b: Task, order: Exclude<TaskOrder, 'recent'>): number {
  if (order === 'title-asc' || order === 'title-desc') {
    const comparison = a.title.localeCompare(b.title, 'pt-BR');
    return order === 'title-asc' ? comparison : -comparison;
  }

  const first = parseDueDate(a.dueDate);
  const second = parseDueDate(b.dueDate);
  if (!Number.isFinite(first)) return Number.isFinite(second) ? 1 : 0;
  if (!Number.isFinite(second)) return -1;
  return order === 'due-asc' ? first - second : second - first;
}

function parseDueDate(dueDate: string): number {
  const value = dueDate.trim();
  const localDate = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,]?\s+(\d{1,2}):(\d{2}))?$/.exec(value);
  if (localDate) {
    const [, day, month, year, hour = '0', minute = '0'] = localDate;
    const date = new Date(+year, +month - 1, +day, +hour, +minute);
    return date.getMonth() === +month - 1 && date.getDate() === +day && +hour < 24 && +minute < 60
      ? date.getTime()
      : NaN;
  }
  const relativeDate = /^(Hoje|Amanhã)(?:[,]?\s+(\d{1,2}):(\d{2}))?$/i.exec(value);
  if (relativeDate) {
    const [, day, hour = '0', minute = '0'] = relativeDate;
    const date = new Date();
    if (day.toLocaleLowerCase('pt-BR') === 'amanhã') date.setDate(date.getDate() + 1);
    return +hour < 24 && +minute < 60 ? date.setHours(+hour, +minute, 0, 0) : NaN;
  }
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? Date.parse(value) : NaN;
}
