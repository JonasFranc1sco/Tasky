import { useAuth } from '@/hooks/auth-context';
import { useChat } from '@/hooks/chat-context';
import { Href, usePathname, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { BottomNavigation } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabRoute = {
  key: string;
  title: string;
  focusedIcon: string;
  unfocusedIcon?: string;
  badge?: number;
  href: Href;
};

const GESTOR_PATHS = ['/home', '/team', '/view_task', '/profile'];

export function AppBottomBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { isAdmin, profile } = useAuth();
  const { totalUnreadCount } = useChat();

  const chatBadge = totalUnreadCount > 0 ? totalUnreadCount : undefined;

  const isGestor = profile
    ? isAdmin
    : GESTOR_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const tabs = useMemo<TabRoute[]>(() => {
    if (isGestor) {
      return [
        {
          key: '/home',
          href: '/home',
          title: 'Tarefas',
          focusedIcon: 'check-circle',
          unfocusedIcon: 'check-circle-outline',
        },
        {
          key: '/team',
          href: '/team',
          title: 'Equipe',
          focusedIcon: 'account-group',
          unfocusedIcon: 'account-group-outline',
        },
        {
          key: '/chat',
          href: '/chat',
          title: 'Chat',
          focusedIcon: 'forum',
          unfocusedIcon: 'forum-outline',
          badge: chatBadge,
        },
        {
          key: '/profile',
          href: '/profile',
          title: 'Perfil',
          focusedIcon: 'cog',
          unfocusedIcon: 'cog-outline',
        },
      ];
    }

    return [
      {
        key: '/task',
        href: '/task',
        title: 'Tarefas',
        focusedIcon: 'check-circle',
        unfocusedIcon: 'check-circle-outline',
      },
      {
        key: '/my-team',
        href: '/my-team',
        title: 'Equipe',
        focusedIcon: 'account-group',
        unfocusedIcon: 'account-group-outline',
      },
      {
        key: '/chat',
        href: '/chat',
        title: 'Chat',
        focusedIcon: 'forum',
        unfocusedIcon: 'forum-outline',
        badge: chatBadge,
      },
      {
        key: '/my-profile',
        href: '/my-profile',
        title: 'Perfil',
        focusedIcon: 'cog',
        unfocusedIcon: 'cog-outline',
      },
    ];
  }, [chatBadge, isGestor]);

  const index = useMemo(
    () =>
      Math.max(
        0,
        tabs.findIndex(
          (route) =>
            pathname === route.key || pathname.startsWith(`${route.key}/`)
        )
      ),
    [pathname, tabs]
  );

  return (
    <BottomNavigation.Bar
      navigationState={{ index, routes: tabs }}
      onTabPress={({ route }) => router.navigate(route.key as Href)}
      safeAreaInsets={{
        bottom: insets.bottom,
        left: insets.left,
        right: insets.right,
      }}
    />
  );
}
