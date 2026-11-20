import { DelegateTaskModal, type DelegationPayload } from '@/components/delegate-task-modal';
import { ManagerHeroCard } from '@/components/manager-hero-card';
import { ManagerStatCard } from '@/components/manager-stat-card';
import { ManagerTaskCard } from '@/components/manager-task-card';
import { ScreenHeader } from '@/components/screen-header';
import { useAuth } from '@/hooks/auth-context';
import { useTasks } from '@/hooks/tasks-context';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { ActivityIndicator, Button, Chip, FAB, Searchbar } from 'react-native-paper';

export default function GestorHomeScreen() {
  const router = useRouter();
  const { profile, company } = useAuth();
  const { tasks, loading, error, delegateTask } = useTasks();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [delegateVisible, setDelegateVisible] = useState(false);

  const companyDisplayName =
    company?.companyName || profile?.companyName || 'Empresa';

  const managerDisplayName = profile?.name || 'Gestor';

  const pendingCount = tasks.filter((task) => task.status === 'pending').length;
  const completedCount = tasks.length - pendingCount;
  const completedPercentage = tasks.length ? Math.round(completedCount * 100 / tasks.length) : 0;

  const filteredTasks = tasks.filter((task) => {
    const status = task.status === 'pending' ? 'pending' : 'completed';
    const matchesStatus = filter === 'all' || status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesStatus && matchesSearch && matchesPriority;
  });

  const handleDelegate = async ({ assignee, ...task }: DelegationPayload) => {
    await delegateTask(task, assignee);
    setDelegateVisible(false);
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
        ListHeaderComponent={
          <>
            {/* Banner do Gestor */}
            <ManagerHeroCard
              greeting={`Olá, ${managerDisplayName} 👋`}
              company={companyDisplayName}
              date={new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
            />

            {/* Cards de Métricas */}
            <View className="mt-4 flex-row gap-2.5">
              <ManagerStatCard
                title="Total"
                value={tasks.length}
                subtitle="Tarefas da empresa"
              />
              <ManagerStatCard
                title="Pendentes"
                value={pendingCount}
                subtitle="Requer ação"
              />
              <ManagerStatCard
                title="Concluídas"
                value={completedCount}
                subtitle={`${completedPercentage}% concluído`}
              />
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
                    {filteredTasks.length}
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
/><View className="mt-3 flex-row flex-wrap gap-2">
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
                Pendentes ({pendingCount})
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
                Concluídas ({completedCount})
              </Chip>
            </ScrollView>
          </>
        }
        ListEmptyComponent={loading ? <ActivityIndicator /> : (
          <Text className={error ? 'text-error' : 'text-on-surface-variant'}>
            {error ?? 'Nenhuma tarefa encontrada.'}
          </Text>
        )}
        renderItem={({ item }) => (
          <ManagerTaskCard
            task={item}
            onPress={() => router.push({
              pathname: '/(app)/(gestor)/view_task',
              params: { id: item.id },
            })}
          />
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
