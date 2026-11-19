import { InviteEmployeeModal } from '@/components/invite-employee-modal';
import { ScreenHeader } from '@/components/screen-header';
import { TeamInviteCard } from '@/components/team-invite-card';
import { TeamManagementCard } from '@/components/team-management-card';
import { TeamMemberCard } from '@/components/team-member-card';
import { useAuth } from '@/hooks/auth-context';
import { useTeam } from '@/hooks/team-context';
import { TeamService } from '@/services/team-service';
import type { EmployeeMember } from '@/types/company';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Chip } from 'react-native-paper';

export default function GestorTeamScreen() {
  const { company } = useAuth();
  const {
    filteredMembers,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    metrics,
  } = useTeam();

  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<EmployeeMember | null>(
    null
  );

  // Abre o modal para criar um novo convite de funcionário
  const handleOpenNewInvite = () => {
    setEditingMember(null);
    setInviteModalVisible(true);
  };

  // Abre o modal para atualizar os dados ou função de um funcionário existente
  const handleEditMember = (member: EmployeeMember) => {
    setEditingMember(member);
    setInviteModalVisible(true);
  };

  const companyInviteLink = company?.inviteCode
    ? TeamService.buildInviteLink(company.inviteCode)
    : undefined;

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
            <TeamManagementCard totalCount={metrics.total} />

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
              <TeamInviteCard
                inviteCode={company?.inviteCode}
                inviteLink={companyInviteLink}
                onInvitePress={handleOpenNewInvite}
              />
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
                Todos ({metrics.total})
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
                Ativos ({metrics.active})
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
                Pendentes ({metrics.pending})
              </Chip>
            </ScrollView>
          </>
        }
        renderItem={({ item }) => (
          <TeamMemberCard
            member={{
              id: item.id,
              name: item.name,
              role: item.sector
                ? `${item.jobTitle} • ${item.sector}`
                : item.jobTitle,
              status: item.status,
              initials: item.initials,
              pendingTasks: item.pendingTasks,
              completedTasks: item.completedTasks,
              statusMessage: item.statusMessage,
            }}
            onPress={() => handleEditMember(item)}
          />
        )}
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
              Convide novos funcionários ou altere o filtro aplicado.
            </Text>
          </View>
        }
      />

      {/* Modal de Convite e Atualização de Funcionários */}
      <InviteEmployeeModal
        visible={inviteModalVisible}
        editingMember={editingMember}
        onDismiss={() => {
          setInviteModalVisible(false);
          setEditingMember(null);
        }}
      />
    </View>
  );
}
