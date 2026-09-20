import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'pending';
  initials: string;
  pendingTasks?: number;
  completedTasks?: number;
  statusMessage?: string;
};

type Props = {
  member: TeamMember;
  onPress?: () => void;
  onActionPress?: () => void;
};

export function TeamMemberCard({ member, onPress, onActionPress }: Props) {
  const isActive = member.status === 'active';

  return (
    <Pressable
      className="flex-row items-center justify-between rounded-2xl border border-slate-100 bg-surface-lowest p-3.5 shadow-sm active:bg-slate-50"
      onPress={onPress}
    >
      {/* Informações do Colaborador (Avatar com Iniciais e Dados) */}
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        {/* Avatar com Iniciais e Indicador de Status (Sem foto de perfil) */}
        <View className="relative h-12 w-12 items-center justify-center rounded-full bg-surface-container">
          <Text className="text-sm font-bold text-on-surface">
            {member.initials}
          </Text>

          {/* Indicador de Status no Avatar */}
          <View
            className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white"
            style={{
              backgroundColor: isActive ? '#0F2042' : '#94A3B8',
            }}
          />
        </View>

        {/* Detalhes: Nome, Status, Cargo e Tarefas/Mensagem */}
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className="text-sm font-bold text-on-surface"
              numberOfLines={1}
            >
              {member.name}
            </Text>

            {/* Badge de Status */}
            <View className="rounded-md bg-surface-container px-2 py-0.5">
              <Text className="text-[10px] font-medium text-on-surface-variant">
                {isActive ? 'Ativo' : 'Pendente'}
              </Text>
            </View>
          </View>

          {/* Cargo do Colaborador */}
          <Text
            className="mt-0.5 text-xs text-on-surface-variant"
            numberOfLines={1}
          >
            {member.role}
          </Text>

          {/* Resumo de Tarefas ou Mensagem de Convite */}
          <Text
            className="mt-1 text-[11px] text-slate-400"
            numberOfLines={1}
          >
            {isActive
              ? `${member.pendingTasks ?? 0} ${member.pendingTasks === 1 ? 'pendente' : 'pendentes'} • ${member.completedTasks ?? 0} ${member.completedTasks === 1 ? 'concluída' : 'concluídas'}`
              : (member.statusMessage ?? 'Aguardando aceite de convite')}
          </Text>
        </View>
      </View>

     </Pressable>
  );
}
