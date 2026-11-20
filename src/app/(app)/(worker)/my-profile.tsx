import { ProfileHeroCard } from '@/components/profile-hero-card';
import { ProfileMetrics } from '@/components/profile-metrics';
import {
  ChangePasswordModal,
  EditPersonalInfoModal,
  TermsPrivacyModal,
} from '@/components/profile-modals';
import { ProfileRow, ProfileSection } from '@/components/profile-section';
import { ScreenHeader } from '@/components/screen-header';
import { useAuth } from '@/hooks/auth-context';
import { useProfilePhoto } from '@/hooks/use-profile-photo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Switch } from 'react-native-paper';

const CHEVRON = (
  <MaterialCommunityIcons name="chevron-right" size={20} color="#75777F" />
);

export default function MyProfileScreen() {
  const { profile, company, signOut } = useAuth();
  const {
    uploading: photoUploading,
    progress: photoUploadProgress,
    error: photoError,
    pickAndUploadPhoto,
  } = useProfilePhoto();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reopenAlertsEnabled, setReopenAlertsEnabled] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const router = useRouter();

  const companyDisplayName =
    company?.companyName || profile?.companyName || 'Empresa';
  const roleDisplay = profile?.sector
    ? `${profile.jobTitle} • ${profile.sector}`
    : (profile?.jobTitle ?? 'Colaborador');

  // Encerra a sessão do funcionário no Firebase
  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Meu Perfil" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={{ width: '100%', maxWidth: 960, alignSelf: 'center' }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 24, flexGrow: 1 }}
      >
        <ProfileHeroCard
          name={profile?.name ?? 'Colaborador'}
          initials={profile?.initials ?? 'CL'}
          photoURL={profile?.photoURL}
          photoUploading={photoUploading}
          photoUploadProgress={photoUploadProgress}
          photoError={photoError}
          onPhotoPress={pickAndUploadPhoto}
          role={roleDisplay}
          company={companyDisplayName}
          statusLabel="Em Turno Ativo"
          employeeCode={profile?.employeeCode ?? '#EMP-0001'}
          onEditPress={() => setEditModalVisible(true)}
        />

        <ProfileMetrics
          completion={94}
          delivered={48}
          deliveredSuffix="mês"
          shiftLabel="Turno A"
          shiftHours="08h – 18h"
        />

        <ProfileSection title="Preferências do App">
          <ProfileRow
            icon="bell-ring"
            iconColor="#0F2042"
            title="Notificações de Novas Tarefas"
            subtitle="Push imediato ao ser designado"
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color="#0F2042"
              />
            }
            divider
          />
          <ProfileRow
            icon="replay"
            iconColor="#0F2042"
            title="Alertas de Reabertura"
            subtitle="Avisar se item precisar de revisão"
            right={
              <Switch
                value={reopenAlertsEnabled}
                onValueChange={setReopenAlertsEnabled}
                color="#0F2042"
              />
            }
          />
        </ProfileSection>

        <ProfileSection title="Segurança & Conta">
          <ProfileRow
            icon="lock-reset"
            title="Alterar Senha de Acesso"
            onPress={() => setPasswordModalVisible(true)}
            right={CHEVRON}
            divider
          />
          <ProfileRow
            icon="shield-search"
            title="Termos de Uso & Privacidade"
            onPress={() => setTermsModalVisible(true)}
            right={CHEVRON}
          />
        </ProfileSection>

        <View>
          <Pressable
            className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-surface-lowest shadow-sm active:opacity-80"
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#BA1A1A" />
            <Text className="text-base font-semibold text-error">
              Encerrar Sessão
            </Text>
          </Pressable>

          <View className="mt-4 items-center gap-0.5 pb-2">
            <Text className="text-[11px] text-outline">
              Tasky Mobile v1.4.2
            </Text>
            <Text className="text-xs font-medium text-on-surface-variant">
              {companyDisplayName} • Operações Integradas
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modais de Edição de Perfil, Senha e Termos */}
      <EditPersonalInfoModal
        visible={editModalVisible}
        onDismiss={() => setEditModalVisible(false)}
      />
      <ChangePasswordModal
        visible={passwordModalVisible}
        onDismiss={() => setPasswordModalVisible(false)}
      />
      <TermsPrivacyModal
        visible={termsModalVisible}
        onDismiss={() => setTermsModalVisible(false)}
      />
    </View>
  );
}
