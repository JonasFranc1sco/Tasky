import { DelegateTaskModal, DelegationPayload } from '@/components/delegate-task-modal';
import { ManagerHeroCard } from '@/components/manager-hero-card';
import { ManagerStatCard } from '@/components/manager-stat-card';
import { ManagerTaskCard, type ManagerTask } from '@/components/manager-task-card';
import { ScreenHeader } from '@/components/screen-header';
import { CURRENT_COMPANY } from '@/constants/tasks';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { Button, Chip, FAB } from 'react-native-paper';

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

export default function GestorHomeScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [tasks, setTasks] = useState<ManagerTask[]>(INITIAL_TASKS);
  const [delegateVisible, setDelegateVisible] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const handleDelegate = (payload: DelegationPayload) => {
    setTasks((prev) => [
      {
        id: `-${Date.now()}`,
        title: payload.title,
        description: payload.description,
        assignee: payload.assignee.name,
        time: payload.dueDate,
        status: 'pending',
        category: payload.priority,
      },
      ...prev,
    ]);
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
              greeting="Olá, João Pedro 👋"
              company={CURRENT_COMPANY}
              date="Hoje, 24 de Out"
            />

            {/* Cards de Métricas */}
            <View className="mt-4 flex-row gap-2.5">
              <ManagerStatCard
                title="Total"
                value={METRICS_DATA.total}
                subtitle="Tarefas ativas"
              />
              <ManagerStatCard
                title="Pendentes"
                value={METRICS_DATA.pending}
                subtitle="Requer ação"
              />
              <ManagerStatCard
                title="Concluídas"
                value={METRICS_DATA.completed}
                subtitle={METRICS_DATA.completedPercentage}
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
                    {filteredTasks.length} ativas
                  </Text>
                </View>
              </View>

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
                Pendentes ({METRICS_DATA.pending})
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
                Concluídas ({METRICS_DATA.completed})
              </Chip>
            </ScrollView>
          </>
        }
        renderItem={({ item }) => (
          <ManagerTaskCard
            task={item}
            onPress={() => router.push('/(app)/(gestor)/view_task')}
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
