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
import { FlatList, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Button, Chip, FAB, Searchbar } from 'react-native-paper';

export default function GestorHomeScreen() {
  const router = useRouter();
  const { profile, company } = useAuth();
  const { width } = useWindowDimensions();
  const numColumns = width >= 1080 ? 2 : 1;
  const isWideMetrics = width >= 600;
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const {
    tasks: allTasks,
    metrics,
    addTask,
    updateTaskStatus,
  } = useTasks();
  const tasks = useMemo(() => allTasks.map(toManagerTask), [allTasks]);
  const [delegateVisible, setDelegateVisible] = useState(false);

  const companyDisplayName =
    company?.companyName || profile?.companyName || 'Empresa';
  const managerDisplayName = profile?.name || 'Gestor';

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filter === 'all' || task.status === filter;

    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleDelegate = (payload: DelegationPayload) => {
    addTask({
      name: payload.title,
      description: payload.description,
      assignee: { name: payload.assignee.name, uid: payload.assignee.uid },
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
              onToggleStatus={() =>
                updateTaskStatus(
                  item.id,
                  item.status === 'completed' ? 'pending' : 'completed'
                )
              }
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
  };
}
