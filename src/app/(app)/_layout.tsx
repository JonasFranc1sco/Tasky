import { AppBottomBar } from '@/components/app-bottom-bar';
import { useAuth } from '@/hooks/auth-context';
import { Redirect, Slot, usePathname } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

const GESTOR_PATHS = ['/home', '/team', '/view_task', '/profile'];

export default function AppLayout() {
  const { user, profile, isAdmin, loading } = useAuth();
  const pathname = usePathname();

  // Exibe indicador de carregamento enquanto valida a sessão no Firebase
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#0F2042" />
      </View>
    );
  }

  // Redireciona para o login caso o usuário não esteja autenticado
  if (!user || !profile) {
    return <Redirect href="/login" />;
  }

  const isGestorRoute = GESTOR_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // Restringe o acesso às telas de gestor apenas para usuários com função admin
  if (!isAdmin && isGestorRoute) {
    return <Redirect href="/(app)/(worker)/task" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      <AppBottomBar />
    </View>
  );
}
