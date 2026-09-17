import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import '../global.css';

import { AppBottomBar } from '@/components/app-bottom-bar';
import { taskyTheme } from '@/constants/theme';
import { TasksProvider } from '@/hooks/tasks-context';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PaperProvider
        theme={taskyTheme}
        settings={{
          icon: ({ name, color, size }) => (
            <MaterialCommunityIcons
              name={name as keyof typeof MaterialCommunityIcons.glyphMap}
              color={color}
              size={size}
            />
          ),
        }}
      >
        <TasksProvider>
          <View style={styles.container}>
            <View style={styles.content}>
              <Slot />
            </View>
            <AppBottomBar />
          </View>
        </TasksProvider>
      </PaperProvider>
    </ThemeProvider>
);
}
    const styles = StyleSheet.create({
      container: { flex: 1},
      content: { flex: 1},
    });
