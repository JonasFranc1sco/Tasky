import { useAuth } from '@/hooks/auth-context';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { user, profile, isAdmin, loading } = useAuth();

  // Usuário já autenticado não precisa ver login, cadastro ou convite
  if (!loading && user && profile) {
    return (
      <Redirect href={isAdmin ? '/(app)/(gestor)/home' : '/(app)/(worker)/task'} />
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
