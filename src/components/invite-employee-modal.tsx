import { useAuth } from '@/hooks/auth-context';
import { getResponsiveModalContentStyle } from '@/components/responsive-modal-style';
import { useTeam } from '@/hooks/team-context';
import { TeamService } from '@/services/team-service';
import type { EmployeeMember, MemberStatus, UserRole } from '@/types/company';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Chip, Modal, Portal } from 'react-native-paper';

type Props = {
  visible: boolean;
  editingMember?: EmployeeMember | null;
  onDismiss: () => void;
};

export function InviteEmployeeModal({
  visible,
  editingMember,
  onDismiss,
}: Props) {
  const { width, height } = useWindowDimensions();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={getResponsiveModalContentStyle(width, height, 640)}
      >
        <InviteEmployeeForm
          key={`${editingMember?.id ?? 'new'}-${visible ? 'open' : 'closed'}`}
          editingMember={editingMember}
          onDismiss={onDismiss}
        />
      </Modal>
    </Portal>
  );
}

function InviteEmployeeForm({
  editingMember,
  onDismiss,
}: {
  editingMember?: EmployeeMember | null;
  onDismiss: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const isNarrow = width < 480;
  const { company, profile } = useAuth();
  const { inviteEmployee, updateEmployee, removeMember } = useTeam();

  const isEditing = Boolean(editingMember);
  const isActiveMember = isEditing && !editingMember?.isInvite;
  // Admin editando o próprio cadastro não pode mudar a função nem o status
  const isSelf = isActiveMember && editingMember?.uid === profile?.uid;

  const [name, setName] = useState(editingMember?.name ?? '');
  const [email, setEmail] = useState(editingMember?.email ?? '');
  const [jobTitle, setJobTitle] = useState(editingMember?.jobTitle ?? '');
  const [sector, setSector] = useState(editingMember?.sector ?? '');
  const [role, setRole] = useState<UserRole>(editingMember?.role ?? 'worker');
  const [status, setStatus] = useState<MemberStatus>(
    editingMember?.status ?? 'active'
  );
  const [generatedCode, setGeneratedCode] = useState<string | null>(
    editingMember?.inviteCode ?? null
  );
  const [generatedLink, setGeneratedLink] = useState<string | null>(
    editingMember?.inviteCode
      ? TeamService.buildInviteLink(editingMember.inviteCode)
      : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);

  // Remove o membro (ou exclui o convite) após um segundo toque de confirmação
  const handleRemove = async () => {
    if (!editingMember) return;

    if (!confirmRemove) {
      setConfirmRemove(true);
      return;
    }

    try {
      setLoading(true);
      setError('');
      await removeMember(editingMember.id, Boolean(editingMember.isInvite));
      onDismiss();
    } catch (err: unknown) {
      setError(
        (err as { message?: string })?.message ??
          'Não foi possível remover o membro.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Salva um novo convite ou atualiza um funcionário existente no Firestore
  const handleSubmit = async () => {
    setError('');

    if (!name.trim() || !jobTitle.trim()) {
      setError('Informe ao menos o nome e o cargo do funcionário.');
      return;
    }

    if (!isEditing && (!email.trim() || !email.includes('@'))) {
      setError('Informe um e-mail corporativo válido.');
      return;
    }

    try {
      setLoading(true);

      if (isEditing && editingMember) {
        await updateEmployee(editingMember.id, Boolean(editingMember.isInvite), {
          name: name.trim(),
          ...(isActiveMember ? {} : { email: email.trim().toLowerCase() }),
          jobTitle: jobTitle.trim(),
          sector: sector.trim() || 'Operação',
          ...(isSelf ? {} : { role, status }),
        });
        onDismiss();
        return;
      }

      const { invite, inviteLink } = await inviteEmployee({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        jobTitle: jobTitle.trim(),
        sector: sector.trim() || 'Operação',
        role,
      });

      setGeneratedCode(invite.code);
      setGeneratedLink(inviteLink);
    } catch (err: unknown) {
      setError(
        (err as { message?: string })?.message ??
          'Não foi possível salvar os dados do funcionário.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Compartilha o código e o link do convite através do menu nativo do sistema
  const handleShareInvite = async (codeToShare: string, linkToShare: string) => {
    try {
      await Share.share({
        message: `Convite para a equipe ${company?.companyName ?? 'Tasky'}!\nCódigo: ${codeToShare}\nLink de acesso: ${linkToShare}`,
      });
    } catch {
      // Ignora cancelamento do compartilhamento
    }
  };

  const inputClass =
    'min-h-11 rounded-xl border border-slate-200 bg-surface-container px-3 text-sm text-on-surface';

  return (
    <View
      className="max-h-[88%] rounded-3xl bg-surface-lowest p-5 shadow-sm"
      style={{ maxHeight: Math.min(height - 64, 800), width: '100%' }}
    >
      {/* Cabeçalho do Modal */}
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-on-surface">
          {isEditing
            ? 'Atualizar Funcionário'
            : generatedCode
              ? 'Convite Gerado'
              : 'Convidar Funcionário'}
        </Text>
        <Pressable
          className="h-8 w-8 items-center justify-center rounded-full bg-surface-container"
          onPress={onDismiss}
          hitSlop={8}
        >
          <MaterialCommunityIcons name="close" size={18} color="#45464E" />
        </Pressable>
      </View>

      {!isEditing && generatedCode && generatedLink ? (
        <View className="mt-4 gap-3">
          {/* Exibição do código e link gerados após o cadastro */}
          <View className="items-center rounded-2xl bg-surface-container p-4">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Código do Convite
            </Text>
            <Text className="mt-1 text-2xl font-extrabold text-primary">
              {generatedCode}
            </Text>
            <Text className="mt-2 text-center text-xs text-on-surface-variant">
              Link: {generatedLink}
            </Text>
          </View>

          <Pressable
            className="h-11 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:opacity-80"
            onPress={() => handleShareInvite(generatedCode, generatedLink)}
          >
            <MaterialCommunityIcons
              name="share-variant-outline"
              size={18}
              color="#FFFFFF"
            />
            <Text className="text-sm font-semibold text-white">
              Compartilhar Código ou Link
            </Text>
          </Pressable>

          <Pressable
            className="h-11 items-center justify-center rounded-xl bg-surface-container active:opacity-80"
            onPress={onDismiss}
          >
            <Text className="text-sm font-semibold text-on-surface-variant">
              Concluir
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            className="mt-4 flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="gap-3">
              <View className="gap-1">
                <Text className="px-1 text-[11px] font-medium text-on-surface-variant">
                  Nome completo
                </Text>
                <TextInput
                  className={inputClass}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex.: Jonas Francisco"
                  placeholderTextColor="#75777F"
                />
              </View>

              <View className="gap-1">
                <Text className="px-1 text-[11px] font-medium text-on-surface-variant">
                  E-mail corporativo
                </Text>
                <TextInput
                  className={inputClass}
                  value={email}
                  onChangeText={setEmail}
                  // O e-mail de login de um membro ativo fica no Firebase Authentication
                  // e não pode ser alterado por aqui
                  editable={!isActiveMember}
                  style={isActiveMember ? { opacity: 0.6 } : undefined}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="Ex.: jonas@dubaisoftwarehouse.com.br"
                  placeholderTextColor="#75777F"
                />
              </View>

              <View className="gap-2.5" style={{ flexDirection: isNarrow ? 'column' : 'row' }}>
                <View className="gap-1" style={{ flex: isNarrow ? undefined : 1 }}>
                  <Text className="px-1 text-[11px] font-medium text-on-surface-variant">
                    Cargo
                  </Text>
                  <TextInput
                    className={inputClass}
                    value={jobTitle}
                    onChangeText={setJobTitle}
                    placeholder="Desenvolvedor Backend"
                    placeholderTextColor="#75777F"
                  />
                </View>
                <View className="gap-1" style={{ flex: isNarrow ? undefined : 1 }}>
                  <Text className="px-1 text-[11px] font-medium text-on-surface-variant">
                    Setor
                  </Text>
                  <TextInput
                    className={inputClass}
                    value={sector}
                    onChangeText={setSector}
                    placeholder="Desenvolvimento"
                    placeholderTextColor="#75777F"
                  />
                </View>
              </View>

              {/* Seleção de função e permissão (admin ou worker) */}
              {isSelf ? (
                <Text className="px-1 text-[11px] text-on-surface-variant">
                  Você não pode alterar a própria função nem o próprio status.
                </Text>
              ) : (
                <View className="gap-1">
                  <Text className="px-1 text-[11px] font-medium text-on-surface-variant">
                    Função e Permissão
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    <Chip
                      mode="flat"
                      selected={role === 'worker'}
                      onPress={() => setRole('worker')}
                      style={{
                        backgroundColor:
                          role === 'worker' ? '#0F2042' : '#ECEFF0',
                        borderRadius: 12,
                      }}
                      textStyle={{
                        color: role === 'worker' ? '#FFFFFF' : '#45464E',
                        fontWeight: '600',
                        fontSize: 12,
                      }}
                    >
                      Funcionário (Worker)
                    </Chip>
                    <Chip
                      mode="flat"
                      selected={role === 'admin'}
                      onPress={() => setRole('admin')}
                      style={{
                        backgroundColor:
                          role === 'admin' ? '#0F2042' : '#ECEFF0',
                        borderRadius: 12,
                      }}
                      textStyle={{
                        color: role === 'admin' ? '#FFFFFF' : '#45464E',
                        fontWeight: '600',
                        fontSize: 12,
                      }}
                    >
                      Administrador (Admin)
                    </Chip>
                  </View>
                </View>
              )}

              {/* Atualização de status quando estiver editando um funcionário */}
              {isActiveMember && !isSelf ? (
                <View className="gap-1">
                  <Text className="px-1 text-[11px] font-medium text-on-surface-variant">
                    Status do Vínculo
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    <Chip
                      mode="flat"
                      selected={status === 'active'}
                      onPress={() => setStatus('active')}
                      style={{
                        backgroundColor:
                          status === 'active' ? '#0F2042' : '#ECEFF0',
                        borderRadius: 12,
                      }}
                      textStyle={{
                        color: status === 'active' ? '#FFFFFF' : '#45464E',
                        fontWeight: '600',
                        fontSize: 12,
                      }}
                    >
                      Ativo
                    </Chip>
                    <Chip
                      mode="flat"
                      selected={status === 'pending'}
                      onPress={() => setStatus('pending')}
                      style={{
                        backgroundColor:
                          status === 'pending' ? '#0F2042' : '#ECEFF0',
                        borderRadius: 12,
                      }}
                      textStyle={{
                        color: status === 'pending' ? '#FFFFFF' : '#45464E',
                        fontWeight: '600',
                        fontSize: 12,
                      }}
                    >
                      Pendente
                    </Chip>
                  </View>
                </View>
              ) : null}

              {/* Caso seja um convite pendente em edição, permite compartilhar o código/link */}
              {isEditing && generatedCode && generatedLink ? (
                <Pressable
                  className="mt-1 flex-row items-center justify-between rounded-xl bg-surface-container p-3"
                  onPress={() =>
                    handleShareInvite(generatedCode, generatedLink)
                  }
                >
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-primary">
                      Código: {generatedCode}
                    </Text>
                    <Text
                      className="text-[11px] text-on-surface-variant"
                      numberOfLines={1}
                    >
                      {generatedLink}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="share-variant-outline"
                    size={18}
                    color="#0F2042"
                  />
                </Pressable>
              ) : null}

              {error ? (
                <Text className="text-xs text-error">{error}</Text>
              ) : null}

              {/* Remoção do membro ou exclusão do convite (não disponível para si mesmo) */}
              {isEditing && !isSelf ? (
                <Pressable
                  className="mt-1 h-11 flex-row items-center justify-center gap-2 rounded-xl active:opacity-80"
                  style={{ borderWidth: 1, borderColor: '#BA1A1A' }}
                  disabled={loading}
                  onPress={handleRemove}
                >
                  <MaterialCommunityIcons
                    name="account-remove-outline"
                    size={18}
                    color="#BA1A1A"
                  />
                  <Text className="text-sm font-semibold text-error">
                    {editingMember?.isInvite
                      ? confirmRemove
                        ? 'Toque de novo para excluir o convite'
                        : 'Excluir convite'
                      : confirmRemove
                        ? 'Toque de novo para remover da equipe'
                        : 'Remover da equipe'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </ScrollView>

          <View className="mt-4 flex-row gap-2.5">
            <Pressable
              className="h-11 flex-1 items-center justify-center rounded-xl bg-surface-container active:opacity-80"
              onPress={onDismiss}
            >
              <Text className="text-sm font-semibold text-on-surface-variant">
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              className="h-11 flex-1 items-center justify-center rounded-xl bg-primary active:opacity-80"
              disabled={loading}
              onPress={handleSubmit}
            >
              <Text className="text-sm font-semibold text-white">
                {loading
                  ? 'Salvando...'
                  : isEditing
                    ? 'Salvar Alterações'
                    : 'Gerar Convite'}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
