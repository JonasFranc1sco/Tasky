import { useAuth } from '@/hooks/auth-context';
import { getResponsiveModalContentStyle } from '@/components/responsive-modal-style';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Modal, Portal } from 'react-native-paper';

type ModalProps = {
  visible: boolean;
  onDismiss: () => void;
};

const inputClass =
  'h-10 rounded-xl border border-slate-200 bg-surface-container px-3 text-sm text-on-surface';

// Modal para edição das informações pessoais do colaborador ou administrador
export function EditPersonalInfoModal({ visible, onDismiss }: ModalProps) {
  const { profile } = useAuth();
  const { width, height } = useWindowDimensions();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={getResponsiveModalContentStyle(width, height, 560)}
      >
        <EditPersonalInfoForm
          key={`${profile?.id ?? 'user'}-${visible ? 'open' : 'closed'}`}
          onDismiss={onDismiss}
        />
      </Modal>
    </Portal>
  );
}

function EditPersonalInfoForm({ onDismiss }: { onDismiss: () => void }) {
  const { profile, company, isAdmin, updatePersonalInfo } = useAuth();
  const { width } = useWindowDimensions();
  const isNarrow = width < 480;

  const [name, setName] = useState(profile?.name ?? '');
  const [jobTitle, setJobTitle] = useState(profile?.jobTitle ?? '');
  const [sector, setSector] = useState(profile?.sector ?? '');
  const [companyName, setCompanyName] = useState(
    company?.companyName || profile?.companyName || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Valida e salva as alterações de perfil no Firebase
  const handleSave = async () => {
    setError('');

    if (name.trim().length < 2) {
      setError('Informe seu nome completo.');
      return;
    }

    if (jobTitle.trim().length < 2) {
      setError('Informe seu cargo.');
      return;
    }

    if (isAdmin && companyName.trim().length < 2) {
      setError('Informe o nome da empresa.');
      return;
    }

    try {
      setLoading(true);
      await updatePersonalInfo({
        name,
        jobTitle,
        sector,
        companyName: isAdmin ? companyName : undefined,
      });
      onDismiss();
    } catch (err: unknown) {
      setError(
        (err as { message?: string })?.message ??
          'Não foi possível atualizar suas informações.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="rounded-3xl bg-surface-lowest p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-on-surface">
          Editar Informações Pessoais
        </Text>
        <Pressable
          className="h-8 w-8 items-center justify-center rounded-full bg-surface-container"
          onPress={onDismiss}
          hitSlop={8}
        >
          <MaterialCommunityIcons name="close" size={18} color="#45464E" />
        </Pressable>
      </View>

      {/* Campos dispostos de forma compacta sem necessidade de scroll em telas mobile */}
      <View className="mt-3 gap-2.5">
        <View className="gap-1">
          <Text className="px-1 text-[11px] font-medium text-on-surface-variant">
            Nome completo
          </Text>
          <TextInput
            className={inputClass}
            value={name}
            onChangeText={setName}
            placeholder="Digite seu nome completo"
            placeholderTextColor="#75777F"
          />
        </View>

        <View className="gap-2" style={{ flexDirection: isNarrow ? 'column' : 'row' }}>
          <View className="gap-1" style={{ flex: isNarrow ? undefined : 1 }}>
            <Text className="px-1 text-[11px] font-medium text-on-surface-variant">
              Cargo
            </Text>
            <TextInput
              className={inputClass}
              value={jobTitle}
              onChangeText={setJobTitle}
              placeholder="Ex.: Gerente"
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
              placeholder="Ex.: Operações"
              placeholderTextColor="#75777F"
            />
          </View>
        </View>

        {isAdmin && (
          <View className="gap-1">
            <Text className="px-1 text-[11px] font-medium text-on-surface-variant">
              Nome da Empresa
            </Text>
            <TextInput
              className={inputClass}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Nome fantasia da empresa"
              placeholderTextColor="#75777F"
            />
          </View>
        )}

        {error ? <Text className="text-xs text-error">{error}</Text> : null}
      </View>

      <View className="mt-3.5 flex-row gap-2.5">
        <Pressable
          className="h-10 flex-1 items-center justify-center rounded-xl bg-surface-container active:opacity-80"
          onPress={onDismiss}
        >
          <Text className="text-sm font-semibold text-on-surface-variant">
            Cancelar
          </Text>
        </Pressable>
        <Pressable
          className="h-10 flex-1 items-center justify-center rounded-xl bg-primary active:opacity-80"
          disabled={loading}
          onPress={handleSave}
        >
          <Text className="text-sm font-semibold text-white">
            {loading ? 'Salvando...' : 'Salvar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// Modal para alteração da senha de acesso com reautenticação no Firebase Auth
export function ChangePasswordModal({ visible, onDismiss }: ModalProps) {
  const { width, height } = useWindowDimensions();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={getResponsiveModalContentStyle(width, height, 480)}
      >
        <ChangePasswordForm
          key={`pwd-${visible ? 'open' : 'closed'}`}
          onDismiss={onDismiss}
        />
      </Modal>
    </Portal>
  );
}

function ChangePasswordForm({ onDismiss }: { onDismiss: () => void }) {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reautentica e atualiza a senha do usuário no Firebase
  const handleUpdatePassword = async () => {
    setError('');

    if (!currentPassword) {
      setError('Digite sua senha atual.');
      return;
    }

    if (newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação da nova senha não confere.');
      return;
    }

    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential'
      ) {
        setError('A senha atual informada está incorreta.');
      } else if (code === 'auth/weak-password') {
        setError('Escolha uma senha mais segura (mínimo de 8 caracteres).');
      } else {
        setError(
          (err as { message?: string })?.message ??
            'Não foi possível alterar a senha.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="rounded-3xl bg-surface-lowest p-5 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-on-surface">
          Alterar Senha de Acesso
        </Text>
        <Pressable
          className="h-8 w-8 items-center justify-center rounded-full bg-surface-container"
          onPress={onDismiss}
          hitSlop={8}
        >
          <MaterialCommunityIcons name="close" size={18} color="#45464E" />
        </Pressable>
      </View>

      {success ? (
        <View className="mt-4 items-center gap-3 py-2">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-[#006A61]/15">
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={28}
              color="#006A61"
            />
          </View>
          <Text className="text-center text-sm font-semibold text-on-surface">
            Senha atualizada com sucesso!
          </Text>
          <Pressable
            className="mt-1 h-11 w-full items-center justify-center rounded-xl bg-primary active:opacity-80"
            onPress={onDismiss}
          >
            <Text className="text-sm font-semibold text-white">Fechar</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View className="mt-4 gap-3">
            <View className="gap-1">
              <Text className="px-1 text-[11px] font-medium text-on-surface-variant">
                Senha atual
              </Text>
              <TextInput
                className={inputClass}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showPasswords}
                autoCapitalize="none"
                placeholder="Digite sua senha atual"
                placeholderTextColor="#75777F"
              />
            </View>

            <View className="gap-1">
              <Text className="px-1 text-[11px] font-medium text-on-surface-variant">
                Nova senha
              </Text>
              <TextInput
                className={inputClass}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPasswords}
                autoCapitalize="none"
                placeholder="Mínimo de 8 caracteres"
                placeholderTextColor="#75777F"
              />
            </View>

            <View className="gap-1">
              <Text className="px-1 text-[11px] font-medium text-on-surface-variant">
                Confirmar nova senha
              </Text>
              <TextInput
                className={inputClass}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPasswords}
                autoCapitalize="none"
                placeholder="Repita a nova senha"
                placeholderTextColor="#75777F"
              />
            </View>

            <Pressable
              className="flex-row items-center gap-1.5 self-start px-1"
              onPress={() => setShowPasswords((v) => !v)}
            >
              <MaterialCommunityIcons
                name={showPasswords ? 'eye-off-outline' : 'eye-outline'}
                size={16}
                color="#45464E"
              />
              <Text className="text-xs font-medium text-on-surface-variant">
                {showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}
              </Text>
            </Pressable>

            {error ? <Text className="text-xs text-error">{error}</Text> : null}
          </View>

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
              onPress={handleUpdatePassword}
            >
              <Text className="text-sm font-semibold text-white">
                {loading ? 'Atualizando...' : 'Alterar Senha'}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

// Modal informativo de Termos de Uso e Política de Privacidade do Tasky
export function TermsPrivacyModal({ visible, onDismiss }: ModalProps) {
  const { width, height } = useWindowDimensions();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={getResponsiveModalContentStyle(width, height, 760)}
      >
        <View
          className="max-h-[85%] rounded-3xl bg-surface-lowest p-5 shadow-sm"
          style={{ maxHeight: Math.min(height - 64, 800), width: '100%' }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={22}
                color="#0F2042"
              />
              <Text className="text-lg font-bold text-on-surface">
                Termos de Uso & Privacidade
              </Text>
            </View>
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-container"
              onPress={onDismiss}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="close" size={18} color="#45464E" />
            </Pressable>
          </View>

          <ScrollView
            className="mt-4 flex-1"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-3.5 pb-2">
              <View className="gap-1">
                <Text className="text-sm font-bold text-primary">
                  1. Uso Corporativo da Plataforma
                </Text>
                <Text className="text-xs leading-5 text-on-surface-variant">
                  O Tasky é destinado exclusivamente à gestão de tarefas,
                  equipes e comunicação interna entre gestores e colaboradores
                  vinculados à mesma organização.
                </Text>
              </View>

              <View className="gap-1">
                <Text className="text-sm font-bold text-primary">
                  2. Isolamento e Segurança dos Dados
                </Text>
                <Text className="text-xs leading-5 text-on-surface-variant">
                  Todas as informações cadastradas (empresas, convites, tarefas
                  e mensagens do Mini Chat) são isoladas por identificador
                  corporativo no Firebase Cloud Firestore, sendo acessíveis
                  apenas por membros autenticados da própria empresa.
                </Text>
              </View>

              <View className="gap-1">
                <Text className="text-sm font-bold text-primary">
                  3. Privacidade e Proteção de Dados (LGPD)
                </Text>
                <Text className="text-xs leading-5 text-on-surface-variant">
                  Coletamos apenas os dados estritamente necessários para a
                  identificação profissional (nome, e-mail corporativo, cargo e
                  setor). Nenhum dado é compartilhado com terceiros fora do
                  ambiente da organização.
                </Text>
              </View>

              <View className="gap-1">
                <Text className="text-sm font-bold text-primary">
                  4. Responsabilidades da Conta
                </Text>
                <Text className="text-xs leading-5 text-on-surface-variant">
                  As credenciais de acesso são pessoais e intransferíveis.
                  Administradores são responsáveis pela emissão de códigos de
                  convite e pela gestão de permissões da sua equipe.
                </Text>
              </View>
            </View>
          </ScrollView>

          <Pressable
            className="mt-4 h-11 items-center justify-center rounded-xl bg-primary active:opacity-80"
            onPress={onDismiss}
          >
            <Text className="text-sm font-semibold text-white">Entendi</Text>
          </Pressable>
        </View>
      </Modal>
    </Portal>
  );
}
