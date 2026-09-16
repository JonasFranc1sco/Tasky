import { Href, usePathname, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { BottomNavigation } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabRoute = {
  key: '/' | '/profile' | '/team';
  title: string;
  focusedIcon: string;
  unfocusedIcon?: string;
};

const TAB_ROUTES: TabRoute[] = [
  { key: '/', title: 'Tarefas', focusedIcon: 'check-circle', unfocusedIcon: 'check-circle-outline' },
  {key: '/team', title: 'Equipe', focusedIcon: 'account-group', unfocusedIcon: 'account-group-outline' },
  {key: '/profile', title: 'Perfil', focusedIcon: 'cog', unfocusedIcon: 'cog-outline' },

]

export function AppBottomBar() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const index = useMemo(
        () =>
            Math.max(
                0,
                TAB_ROUTES.findIndex(
                    (route) => pathname === route.key || pathname.startsWith(`${route.key}/`)
                ),
            ),
            [pathname],
    );

    return (
        <BottomNavigation.Bar
            navigationState={{ index, routes: TAB_ROUTES }}
            onTabPress={({ route }) => router.navigate(route.key as Href)}
            safeAreaInsets={{ bottom: insets.bottom, left: insets.left, right: insets.right}}
            />
    );
}