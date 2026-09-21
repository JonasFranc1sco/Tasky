import { ProfileHeroCard } from '@/components/profile-hero-card';
import { ProfileMetrics } from '@/components/profile-metrics';
import { ProfileRow, ProfileSection } from '@/components/profile-section';
import { ScreenHeader } from '@/components/screen-header';
import { CURRENT_COMPANY, CURRENT_EMPLOYEE } from '@/constants/tasks';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Switch } from 'react-native-paper';

const CHEVRON = <MaterialCommunityIcons name="chevron-right" size={20} color="#75777F" />;

export default function MyProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reopenAlertsEnabled, setReopenAlertsEnabled] = useState(true);
  const router = useRouter()
  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Meu Perfil" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 24 }}
      >
        <ProfileHeroCard
          name={CURRENT_EMPLOYEE}
          initials="JF"
          role="Desenvolvedor Frontend • Desenvolvimento"
          company={CURRENT_COMPANY}
          statusLabel="Em Turno Ativo"
          employeeCode="#DEV-4821"
        />

        <ProfileMetrics
          completion={94}
          delivered={48}
          deliveredSuffix="mês"
          shiftLabel="Turno A"
          shiftHours="08h – 18h"
        />

        <ProfileSection title="Minha Jornada & Escala">
          <ProfileRow
            icon="history"
            title="Histórico de Tarefas"
            subtitle="Últimas 124 execuções registradas"
            onPress={() => {}}
            right={CHEVRON}
            divider
          />
          <ProfileRow
            icon="calendar-month"
            title="Turnos e Escala Semanal"
            subtitle="Segunda a Sexta-feira • Remoto"
            onPress={() => {}}
            right={CHEVRON}
            divider
          />
          <View className="flex-row items-center justify-between px-4 py-3.5">
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container">
                <Text className="text-[11px] font-semibold text-on-surface">JP</Text>
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-outline">
                  Meu Gestor Direto
                </Text>
                <Text className="text-sm font-medium text-on-surface" numberOfLines={1}>
                  João Pedro
                </Text>
                <Text className="text-[11px] text-on-surface-variant" numberOfLines={1}>
                  Gerente
                </Text>
              </View>
            </View>
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-container active:opacity-80"
              onPress={() => {}}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="chat" size={18} color="#006A61" />
            </Pressable>
          </View>
        </ProfileSection>

        <ProfileSection title="Preferências do App">
          <ProfileRow
            icon="bell-ring"
            iconColor="#0F2042"
            title="Notificações de Novas Tarefas"
            subtitle="Push imediato ao ser designado"
            right={<Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} color="#0F2042" />}
            divider
          />
          <ProfileRow
            icon="replay"
            iconColor="#0F2042"
            title="Alertas de Reabertura"
            subtitle="Avisar se item precisar de revisão"
            right={<Switch value={reopenAlertsEnabled} onValueChange={setReopenAlertsEnabled} color="#0F2042" />}
            divider
          />
          <ProfileRow
            icon="translate"
            iconColor="#0F2042"
            title="Idioma do Sistema"
            subtitle="Português (Brasil)"
            right={
              <View className="rounded bg-[#0F2042]/10 px-2 py-1">
                <Text className="text-[11px] font-semibold text-primary">PT-BR</Text>
              </View>
            }
          />
        </ProfileSection>

        <ProfileSection title="Segurança & Conta">
          <ProfileRow
            icon="lock-reset"
            title="Alterar Senha de Acesso"
            onPress={() => {}}
            right={CHEVRON}
            divider
          />
          <ProfileRow
            icon="shield-search"
            title="Termos de Uso & Privacidade"
            onPress={() => {}}
            right={CHEVRON}
          />
        </ProfileSection>

        <View>
          <Pressable
            className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-surface-lowest shadow-sm active:opacity-80"
            onPress={() => router.replace('/login')}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#BA1A1A" />
            <Text className="text-base font-semibold text-error">Encerrar Sessão</Text>
          </Pressable>

          <View className="mt-4 items-center gap-0.5 pb-2">
            <Text className="text-[11px] text-outline">Tasky Mobile v1.4.2</Text>
            <Text className="text-xs font-medium text-on-surface-variant">
              {CURRENT_COMPANY} • Operações Integradas
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}