import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
    DarkTheme,
    DefaultTheme,
    Slot,
    ThemeProvider
} from "expo-router";
import { StyleSheet, View, useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import "../global.css";

import { taskyTheme } from "@/constants/theme";
import { TasksProvider } from "@/hooks/tasks-context";
import { AuthProvider } from "@/contexts/AuthContext";
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
        <AuthProvider>
          <TasksProvider>
            <View style={styles.container}>
                <Slot />
            </View>
          </TasksProvider>
        </AuthProvider>
      </PaperProvider>
    </ThemeProvider>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
