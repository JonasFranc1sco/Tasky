import { TeamService } from '@/services/team-service';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

export default function JoinCompanyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const { width } = useWindowDimensions();
  const isWideForm = width >= 600;

  const [code, setCode] = useState(() =>
    params.code ? String(params.code).toUpperCase() : ''
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [sector, setSector] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Atualiza o código digitado e limpa o nome da empresa caso o código seja apagado
  function handleCodeChange(nextValue: string) {
    const formatted = nextValue.toUpperCase();
    setCode(formatted);
    if (formatted.trim().length < 5) {
      setCompanyName('');
    }
  }

  // Busca dados do convite ou empresa automaticamente no Firebase ao informar o código
  useEffect(() => {
    const normalized = code.trim().toUpperCase();
    if (normalized.length < 5) {
      return;
    }

    let active = true;
    TeamService.resolveInviteOrCompanyCode(normalized)
      .then((resolved) => {
        if (!active) return;
        if (!resolved) {
          setCompanyName('');
          return;
        }
        setCompanyName(resolved.companyName);
        if (resolved.invite) {
          setName(resolved.invite.name);
          setEmail(resolved.invite.email);
          setJobTitle(resolved.invite.jobTitle);
          setSector(resolved.invite.sector);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [code]);

  // Finaliza o cadastro do funcionário e o vincula à empresa no Firebase
  async function handleJoin() {
    setError('');

    if (!code.trim()) {
      setError('Informe o código de convite.');
      return;
    }

    if (!name.trim() || !email.trim()) {
      setError('Preencha seu nome e e-mail corporativo.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    try {
      setLoading(true);
      const profile = await TeamService.acceptInviteAndRegister({
        code,
        name,
        email,
        password,
        jobTitle,
        sector,
      });

      if (profile.role === 'admin') {
        router.replace('/(app)/(gestor)/home');
      } else {
        router.replace('/(app)/(worker)/task');
      }
    } catch (err: unknown) {
      const fbCode = (err as { code?: string })?.code;
      if (fbCode === 'auth/email-already-in-use') {
        setError('Este e-mail já possui conta cadastrada.');
      } else {
        setError(
          (err as { message?: string })?.message ??
            'Não foi possível validar o convite.'
        );
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
        <View
          className="mx-auto w-full"
          style={{ maxWidth: 560, alignSelf: 'center' }}
        >
          {/* Cabeçalho de vínculo por convite */}
          <View className="mb-6 items-center">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-primary">
              <MaterialCommunityIcons
                name="account-plus-outline"
                size={30}
                color="#FFFFFF"
              />
            </View>
            <Text className="text-center text-2xl font-bold text-primary">
              Entrar na Equipe
            </Text>
            <Text className="mt-1 max-w-[300px] text-center text-xs text-on-surface-variant">
              {companyName
                ? `Vinculando sua conta à empresa ${companyName}`
                : 'Use o código ou link enviado pelo administrador da sua empresa'}
            </Text>
          </View>

          <View className="gap-3.5">
            <FormField
              icon="ticket-confirmation-outline"
              label="Código do convite"
            >
              <TextInput
                autoCapitalize="characters"
                autoCorrect={false}
                className="h-[50px] flex-1 text-sm font-semibold text-on-surface"
                onChangeText={handleCodeChange}
                placeholder="Ex: TSK-9A4B"
                placeholderTextColor="#75777F"
                value={code}
              />
            </FormField>

            <FormField icon="account-outline" label="Nome completo">
              <TextInput
                autoCapitalize="words"
                className="h-[50px] flex-1 text-sm text-on-surface"
                onChangeText={setName}
                placeholder="Digite seu nome completo"
                placeholderTextColor="#75777F"
                value={name}
              />
            </FormField>

            <FormField icon="email-outline" label="E-mail corporativo">
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                className="h-[50px] flex-1 text-sm text-on-surface"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="ex: voce@empresa.com.br"
                placeholderTextColor="#75777F"
                value={email}
              />
            </FormField>

            <View
              className="gap-2.5"
              style={{ flexDirection: isWideForm ? 'row' : 'column' }}
            >
              <View className="flex-1">
                <FormField icon="briefcase-outline" label="Cargo">
                  <TextInput
                    autoCapitalize="words"
                    className="h-[50px] flex-1 text-sm text-on-surface"
                    onChangeText={setJobTitle}
                    placeholder="Ex: QA Engineer"
                    placeholderTextColor="#75777F"
                    value={jobTitle}
                  />
                </FormField>
              </View>
              <View className="flex-1">
                <FormField icon="domain" label="Setor">
                  <TextInput
                    autoCapitalize="words"
                    className="h-[50px] flex-1 text-sm text-on-surface"
                    onChangeText={setSector}
                    placeholder="Ex: Qualidade"
                    placeholderTextColor="#75777F"
                    value={sector}
                  />
                </FormField>
              </View>
            </View>

            <FormField icon="lock-outline" label="Crie sua senha de acesso">
              <TextInput
                autoCapitalize="none"
                className="h-[50px] flex-1 text-sm text-on-surface"
                onChangeText={setPassword}
                placeholder="Mínimo de 8 caracteres"
                placeholderTextColor="#75777F"
                secureTextEntry={!showPassword}
                value={password}
              />
              <Pressable
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

            {error ? (
              <Text className="px-1 text-xs text-error">{error}</Text>
            ) : null}

            <Pressable
              className="mt-1 h-12 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:opacity-80"
              disabled={loading}
              onPress={handleJoin}
            >
              <Text className="text-sm font-semibold text-white">
                {loading
                  ? 'Vinculando à empresa...'
                  : 'Aceitar convite e entrar'}
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          <View className="mt-6 items-center">
            <Pressable onPress={() => router.replace('/login')}>
              <Text className="text-xs font-semibold text-primary">
                Voltar para o Login
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
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
