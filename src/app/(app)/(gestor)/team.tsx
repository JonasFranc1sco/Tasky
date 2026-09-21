import { ScreenHeader } from '@/components/screen-header';
import { TeamInviteCard } from '@/components/team-invite-card';
import { TeamManagementCard } from '@/components/team-management-card';
import { TeamMemberCard, type TeamMember } from '@/components/team-member-card';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Chip } from 'react-native-paper';

// Dados definidos localmente no próprio arquivo (sem mock externo)
const METRICS_DATA = {
  total: 4,
  active: 3,
  pending: 1,
};

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Jonas Francisco',
    role: 'Desenvolvedor Frontend',
    status: 'active',
    initials: 'JF',
    pendingTasks: 3,
    completedTasks: 5,
  },
  {
    id: '2',
    name: 'Rafael Horeay',
    role: 'Desenvolvedor Backend',
    status: 'active',
    initials: 'RH',
    pendingTasks: 1,
    completedTasks: 9,
  },
  {
    id: '3',
    name: 'Kemily Freitas',
    role: 'QA Engineer',
    status: 'active',
    initials: 'KF',
    pendingTasks: 2,
    completedTasks: 4,
  },
  {
    id: '4',
    name: 'Eduarda Najara',
    role: 'DevOps Engineer',
    status: 'pending',
    initials: 'EN',
    statusMessage: 'Aguardando aceite de convite',
  },
];

export default function GestorTeamScreen() {
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [members] = useState<TeamMember[]>(INITIAL_MEMBERS);

  const filteredMembers = members.filter((member) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'active'
          ? member.status === 'active'
          : member.status === 'pending';

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      normalizedQuery === '' ||
      member.name.toLowerCase().includes(normalizedQuery) ||
      member.role.toLowerCase().includes(normalizedQuery);

    return matchesFilter && matchesSearch;
  });

  return (
    <View className="flex-1 bg-surface">
      {/* Header padrão da aplicação através do componente ScreenHeader */}
      <ScreenHeader title="Funcionários" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {/* Card de Gestão de Colaboradores */}
            <TeamManagementCard totalCount={METRICS_DATA.total} />

            {/* Barra de Busca de Funcionários */}
            <View className="mt-3 flex-row items-center rounded-2xl border border-slate-200 bg-surface-lowest px-4 h-12 shadow-sm">
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#75777F"
              />
              <TextInput
                className="ml-2 flex-1 text-sm text-on-surface"
                placeholder="Buscar funcionário por nome ou cargo..."
                placeholderTextColor="#75777F"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={18}
                    color="#75777F"
                  />
                </Pressable>
              )}
            </View>

            {/* Card de Convite de Novos Membros */}
            <View className="mt-3">
              <TeamInviteCard onInvitePress={() => {}} />
            </View>

            {/* Chips de Filtro com Paper */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4 mb-1"
              contentContainerStyle={{ gap: 8 }}
            >
              <Chip
                mode="flat"
                selected={filter === 'all'}
                icon="account-group"
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
                Todos ({METRICS_DATA.total})
              </Chip>

              <Chip
                mode="flat"
                selected={filter === 'active'}
                icon={() => (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor:
                        filter === 'active' ? '#FFFFFF' : '#0F2042',
                    }}
                  />
                )}
                onPress={() => setFilter('active')}
                style={{
                  backgroundColor: filter === 'active' ? '#0F2042' : '#ECEFF0',
                  borderRadius: 12,
                }}
                textStyle={{
                  color: filter === 'active' ? '#FFFFFF' : '#45464E',
                  fontWeight: '600',
                  fontSize: 12,
                }}
              >
                Ativos ({METRICS_DATA.active})
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
                      backgroundColor:
                        filter === 'pending' ? '#FFFFFF' : '#75777F',
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
            </ScrollView>
          </>
        }
        renderItem={({ item }) => <TeamMemberCard member={item} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <MaterialCommunityIcons
              name="account-search-outline"
              size={48}
              color="#75777F"
            />
            <Text className="mt-3 text-sm font-semibold text-on-surface">
              Nenhum colaborador encontrado
            </Text>
            <Text className="mt-1 text-xs text-on-surface-variant text-center">
              Tente buscar por outro termo ou alterar o filtro aplicado.
            </Text>
          </View>
        }
      />
    </View>
  );
}
