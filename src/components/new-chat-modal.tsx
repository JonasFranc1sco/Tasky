import { useAuth } from '@/hooks/auth-context';
import { getResponsiveModalContentStyle } from '@/components/responsive-modal-style';
import { useTeam } from '@/hooks/team-context';
import type { EmployeeMember } from '@/types/company';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Modal, Portal } from 'react-native-paper';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onSelectMember: (member: EmployeeMember) => void;
};

export function NewChatModal({ visible, onDismiss, onSelectMember }: Props) {
  const { profile } = useAuth();
  const { activeMembers } = useTeam();
  const { width, height } = useWindowDimensions();
  const [search, setSearch] = useState('');

  const currentUid = profile?.uid || profile?.id;

  // Filtra funcionários ativos da mesma empresa exceto o próprio usuário logado
  const availableColleagues = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeMembers.filter((member) => {
      const memberUid = member.uid || member.id;
      if (memberUid === currentUid) return false;
      if (!q) return true;
      return (
        member.name.toLowerCase().includes(q) ||
        member.jobTitle.toLowerCase().includes(q) ||
        member.sector.toLowerCase().includes(q)
      );
    });
  }, [activeMembers, currentUid, search]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={getResponsiveModalContentStyle(width, height, 560)}
      >
        <View
          className="max-h-[80%] rounded-3xl bg-surface-lowest p-5 shadow-sm"
          style={{ maxHeight: Math.min(height - 64, 720), width: '100%' }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-on-surface">
              Nova Conversa
            </Text>
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-container"
              onPress={onDismiss}
            >
              <MaterialCommunityIcons name="close" size={18} color="#45464E" />
            </Pressable>
          </View>

          <Text className="mt-1 text-xs text-on-surface-variant">
            Selecione um colaborador da sua empresa para iniciar o chat
          </Text>

          {/* Busca rápida de colaborador */}
          <View className="mt-3 flex-row items-center rounded-xl border border-slate-200 bg-surface-container px-3 h-11">
            <MaterialCommunityIcons name="magnify" size={18} color="#75777F" />
            <TextInput
              className="ml-2 flex-1 text-sm text-on-surface"
              placeholder="Buscar por nome, cargo ou setor..."
              placeholderTextColor="#75777F"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
          </View>

          <FlatList
            className="mt-3 flex-1"
            data={availableColleagues}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            renderItem={({ item }) => (
              <Pressable
                className="flex-row items-center justify-between rounded-xl border border-slate-100 bg-surface p-3 active:bg-primary-soft"
                onPress={() => {
                  setSearch('');
                  onSelectMember(item);
                }}
              >
                <View className="flex-1 flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container">
                    <Text className="text-xs font-bold text-primary">
                      {item.initials}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold text-on-surface"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text
                      className="text-xs text-on-surface-variant"
                      numberOfLines={1}
                    >
                      {item.sector
                        ? `${item.jobTitle} • ${item.sector}`
                        : item.jobTitle}
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="message-plus-outline"
                  size={18}
                  color="#0F2042"
                />
              </Pressable>
            )}
            ListEmptyComponent={
              <View className="items-center py-8">
                <Text className="text-xs text-on-surface-variant">
                  Nenhum outro funcionário ativo encontrado na empresa.
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
    </Portal>
  );
}
