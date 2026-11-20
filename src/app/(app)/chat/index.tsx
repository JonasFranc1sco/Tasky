import { ChatConversationItem } from '@/components/chat-conversation-item';
import { NewChatModal } from '@/components/new-chat-modal';
import { ScreenHeader } from '@/components/screen-header';
import { useAuth } from '@/hooks/auth-context';
import { useChat } from '@/hooks/chat-context';
import { useTeam } from '@/hooks/team-context';
import type { EmployeeMember } from '@/types/company';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FAB } from 'react-native-paper';

export default function ChatListScreen() {
  const router = useRouter();
  const { profile, company } = useAuth();
  const { conversations, loading, error, startChatWithMember } = useChat();
  const { activeMembers } = useTeam();

  const [searchQuery, setSearchQuery] = useState('');
  const [newChatVisible, setNewChatVisible] = useState(false);

  const currentUid = profile?.uid || profile?.id || '';

  // Mapa auxiliar de membros ativos caso algum detalhe tenha sido atualizado
  const membersByUid = useMemo(() => {
    const map: Record<string, EmployeeMember> = {};
    activeMembers.forEach((m) => {
      map[m.uid || m.id] = m;
    });
    return map;
  }, [activeMembers]);

  // Filtra conversas pelo nome do participante ou conteúdo da última mensagem
  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;

    return conversations.filter((conv) => {
      const otherUid =
        conv.participants.find((id) => id !== currentUid) ?? currentUid;
      const details =
        conv.participantDetails?.[otherUid] ?? membersByUid[otherUid];
      const nameMatch = details?.name?.toLowerCase().includes(q);
      const messageMatch = conv.lastMessage?.toLowerCase().includes(q);
      return Boolean(nameMatch || messageMatch);
    });
  }, [conversations, currentUid, membersByUid, searchQuery]);

  // Inicia ou abre conversa ao selecionar um colega no modal
  const handleSelectMember = async (member: EmployeeMember) => {
    setNewChatVisible(false);
    try {
      const conv = await startChatWithMember(member);
      router.push(`/chat/${conv.id}`);
    } catch {
      // Erro tratado silenciosamente ou via feedback visual
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Mini Chat" />
      <Stack.Screen options={{ headerShown: false }} />

      <View className="mx-auto w-full max-w-[760px] flex-1">
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 10 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View className="mb-2 gap-3">
              {/* Cabeçalho com identificação da empresa e botão de nova conversa */}
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xl font-bold text-on-surface">
                    Conversas
                  </Text>
                  <Text className="text-xs text-on-surface-variant">
                    {company?.companyName || profile?.companyName || 'Equipe'} •
                    Comunicação interna em tempo real
                  </Text>
                </View>
              </View>

              {/* Barra de busca de conversas */}
              <View className="flex-row items-center rounded-2xl border border-slate-200 bg-surface-lowest px-4 h-12 shadow-sm">
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color="#75777F"
                />
                <TextInput
                  className="ml-2 flex-1 text-sm text-on-surface"
                  placeholder="Buscar conversa por colaborador ou mensagem..."
                  placeholderTextColor="#75777F"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
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

              {error ? (
                <View className="rounded-xl bg-error/10 p-3">
                  <Text className="text-xs text-error">{error}</Text>
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => {
            const otherUid =
              item.participants.find((id) => id !== currentUid) ?? currentUid;
            const fallback = membersByUid[otherUid];

            return (
              <ChatConversationItem
                conversation={item}
                currentUid={currentUid}
                fallbackParticipant={
                  fallback
                    ? {
                        uid: fallback.uid || fallback.id,
                        name: fallback.name,
                        jobTitle: fallback.jobTitle,
                        sector: fallback.sector,
                        initials: fallback.initials,
                      }
                    : undefined
                }
                onPress={() => router.push(`/chat/${item.id}`)}
              />
            );
          }}
          ListEmptyComponent={
            loading ? (
              <View className="items-center justify-center py-12">
                <ActivityIndicator size="large" color="#0F2042" />
                <Text className="mt-3 text-xs text-on-surface-variant">
                  Carregando conversas...
                </Text>
              </View>
            ) : (
              <View className="items-center justify-center py-12 px-4">
                <MaterialCommunityIcons
                  name="forum-outline"
                  size={48}
                  color="#75777F"
                />
                <Text className="mt-3 text-sm font-semibold text-on-surface">
                  Nenhuma conversa iniciada
                </Text>
                <Text className="mt-1 text-center text-xs text-on-surface-variant">
                  Inicie um bate-papo com qualquer colaborador ou gestor da sua
                  empresa clicando em &quot;Nova Conversa&quot;.
                </Text>
              </View>
            )
          }
        />
      </View>

      <FAB
        icon="message-plus"
        color="#FFFFFF"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: '#0F2042',
          borderRadius: 28,
        }}
        onPress={() => setNewChatVisible(true)}
      />

      <NewChatModal
        visible={newChatVisible}
        onDismiss={() => setNewChatVisible(false)}
        onSelectMember={handleSelectMember}
      />
    </View>
  );
}
