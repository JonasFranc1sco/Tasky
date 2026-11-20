import { useAuth } from '@/hooks/auth-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

type Role = 'admin' | 'worker';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, resetPassword } = useAuth();
  const [role, setRole] = useState<Role>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Autentica o usuário no Firebase e redireciona de acordo com a função (admin ou worker)
  async function handleLogin() {
    setError('');
    setInfo('');

    if (!email.trim() || !password) {
      setError('Informe seu e-mail corporativo e senha.');
      return;
    }

    try {
      setLoading(true);
      const memberProfile = await signIn(email, password);

      if (memberProfile.role === 'admin') {
        router.replace('/(app)/(gestor)/home');
      } else {
        router.replace('/(app)/(worker)/task');
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password'
      ) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError(
          (err as { message?: string })?.message ??
            'Não foi possível acessar sua conta.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // Envia o link de redefinição de senha para o e-mail informado no campo
  async function handleForgotPassword() {
    setError('');
    setInfo('');

    if (!email.trim()) {
      setError('Digite seu e-mail corporativo para recuperar a senha.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      // Mensagem neutra: o Firebase não revela se o e-mail está cadastrado
      setInfo(
        'Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.'
      );
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/invalid-email') {
        setError('E-mail inválido.');
      } else if (code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else {
        setError('Não foi possível enviar o e-mail de recuperação.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-4 pb-8 pt-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-auto w-full max-w-[460px]">
          <View className="mb-7 items-center">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-primary">
              <MaterialCommunityIcons
                name="checkbox-marked-circle-outline"
                size={32}
                color="#FFFFFF"
              />
            </View>
            <Text className="text-center text-2xl font-bold text-primary">
              Acesse sua conta
            </Text>
            <Text className="mt-1 max-w-[280px] text-center text-xs text-on-surface-variant">
              Gerencie tarefas e sua equipe com simplicidade
            </Text>
          </View>

          <View className="mb-6 flex-row rounded-xl bg-primary-soft p-1">
            <RoleButton
              active={role === 'admin'}
              icon="shield-account-outline"
              label="Administrador"
              onPress={() => setRole('admin')}
            />
            <RoleButton
              active={role === 'worker'}
              icon="badge-account-outline"
              label="Funcionário"
              onPress={() => setRole('worker')}
            />
          </View>

          <View className="gap-4">
            <FormField icon="email-outline" label="E-mail corporativo">
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                className="h-[50px] flex-1 text-sm text-on-surface"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="ex: gestor@dubaisoftwarehouse.com.br"
                placeholderTextColor="#75777F"
                value={email}
              />
            </FormField>

            <FormField icon="lock-outline" label="Senha de acesso">
              <TextInput
                autoComplete="password"
                className="h-[50px] flex-1 text-sm text-on-surface"
                onChangeText={setPassword}
                placeholder="Digite sua senha"
                placeholderTextColor="#75777F"
                secureTextEntry={!showPassword}
                value={password}
              />
              <Pressable
                accessibilityLabel={
                  showPassword ? 'Ocultar senha' : 'Mostrar senha'
                }
                className="h-10 w-10 items-center justify-center rounded-lg"
                onPress={() => setShowPassword((visible) => !visible)}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#45464E"
                />
              </Pressable>
            </FormField>

            <View className="flex-row items-center justify-between px-1">
              <Pressable
                className="flex-row items-center"
                onPress={() => setRemember((value) => !value)}
              >
                <Checkbox
                  color="#0F2042"
                  status={remember ? 'checked' : 'unchecked'}
                  onPress={() => setRemember((value) => !value)}
                />
                <Text className="-ml-1 text-xs text-on-surface-variant">
                  Lembrar neste aparelho
                </Text>
              </Pressable>
              <Pressable disabled={loading} onPress={handleForgotPassword}>
                <Text className="text-xs font-semibold text-primary">
                  Esqueceu a senha?
                </Text>
              </Pressable>
            </View>

            {error ? (
              <Text className="px-1 text-xs text-error">{error}</Text>
            ) : null}

            {info ? (
              <Text className="px-1 text-xs text-success">{info}</Text>
            ) : null}

            <Pressable
              className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:opacity-80"
              disabled={loading}
              onPress={handleLogin}
            >
              <Text className="text-sm font-semibold text-white">
                {loading ? 'Entrando...' : 'Entrar na conta'}
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1 bg-slate-200" />
            <Text className="px-3 text-[10px] font-semibold tracking-wider text-outline">
              CONVITE DE EQUIPE
            </Text>
            <View className="h-px flex-1 bg-slate-200" />
          </View>

          {/* Atalho para funcionários que receberam código ou link de convite */}
          <Pressable
            className="flex-row items-center justify-between rounded-xl border border-slate-100 bg-surface-lowest p-3.5 active:bg-primary-soft"
            onPress={() => router.push('/join')}
          >
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-primary-soft">
                <MaterialCommunityIcons
                  name="ticket-confirmation-outline"
                  size={20}
                  color="#0F2042"
                />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-sm font-semibold text-on-surface">
                  Entrar com código de convite
                </Text>
                <Text className="text-xs text-on-surface-variant">
                  Vincule-se à empresa usando o código enviado pelo gestor
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#75777F"
            />
          </Pressable>

          <View className="mt-6 items-center">
            <Text className="text-xs text-on-surface-variant">
              Não tem uma conta corporativa?
            </Text>
            <Pressable onPress={() => router.replace('/signup')}>
              <Text className="mt-0.5 text-xs font-semibold text-primary">
                Cadastre sua empresa
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function RoleButton({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className={`min-h-10 flex-1 flex-row items-center justify-center gap-1.5 rounded-lg ${active ? 'bg-primary shadow-sm' : ''}`}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={active ? '#FFFFFF' : '#45464E'}
      />
      <Text
        className={`text-xs ${active ? 'font-semibold text-white' : 'font-medium text-on-surface-variant'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FormField({
  children,
  icon,
  label,
}: {
  children: React.ReactNode;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}) {
  return (
    <View className="gap-1">
      <Text className="px-1 text-[11px] font-medium text-on-surface-variant">
        {label}
      </Text>
      <View className="flex-row items-center rounded-xl border border-slate-200 bg-surface-lowest px-3">
        <MaterialCommunityIcons name={icon} size={20} color="#45464E" />
        <View className="ml-2 flex-1 flex-row items-center">{children}</View>
      </View>
    </View>
  );
}
