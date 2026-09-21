import { Href, usePathname, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { BottomNavigation } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabRoute = {
  key: string;
  title: string;
  focusedIcon: string;
  unfocusedIcon?: string;
  href: Href;
};

const GESTOR_TABS: TabRoute[] = [
    { key: '/home', href: '/home',title: 'Tarefas', focusedIcon: 'check-circle', unfocusedIcon: 'check-circle-outline' },
    { key: '/team', href: '/team',title: 'Equipe', focusedIcon: 'account-group', unfocusedIcon: 'account-group-outline' },
    { key: '/profile', href: '/profile' ,title: 'Perfil', focusedIcon: 'cog', unfocusedIcon: 'cog-outline' },
];

const WORKER_TABS: TabRoute[] = [
  { key: '/task', href: '/task' ,title: 'Tarefas', focusedIcon: 'check-circle', unfocusedIcon: 'check-circle-outline' },
  {key: '/my-team', href: '/my-team' ,title: 'Equipe', focusedIcon: 'account-group', unfocusedIcon: 'account-group-outline' },
  {key: '/my-profile', href: '/my-profile' ,title: 'Perfil', focusedIcon: 'cog', unfocusedIcon: 'cog-outline' },

]

const GESTOR_PATHS = ['/home', '/team', '/view_task', '/profile'];

export function AppBottomBar() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    
    const isGestor = GESTOR_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    const tabs = isGestor ? GESTOR_TABS : WORKER_TABS;

    const index = useMemo(
        () =>
            Math.max(
                0,
                tabs.findIndex(
                    (route) => pathname === route.key || pathname.startsWith(`${route.key}/`)
                ),
            ),
            [pathname, tabs],
    );

    return (
        <BottomNavigation.Bar
            navigationState={{ index, routes: tabs }}
            onTabPress={({ route }) => router.navigate(route.key as Href)}
            safeAreaInsets={{ bottom: insets.bottom, left: insets.left, right: insets.right}}
            />
    );
}