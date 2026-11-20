import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  DarkTheme,
  DefaultTheme,
  Slot,
  ThemeProvider,
} from "expo-router";
import { StyleSheet, View, useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import "../global.css";

import { taskyTheme } from "@/constants/theme";
import { AuthProvider } from "@/hooks/auth-context";
import { ManagerTasksProvider } from "@/hooks/manager-tasks-context";
import { ChatProvider } from "@/hooks/chat-context";
import { TasksProvider } from "@/hooks/tasks-context";
import { TeamProvider } from "@/hooks/team-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* Providers de contexto ficam acima do PaperProvider para que os Portals/Modals acessem useAuth, useTeam e useChat */}
      <AuthProvider>
        <TeamProvider>
          <ChatProvider>
            <TasksProvider>
              <ManagerTasksProvider>
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
                  <View style={styles.container}>
                    <Slot />
                  </View>
                </PaperProvider>
              </ManagerTasksProvider>
            </TasksProvider>
          </ChatProvider>
        </TeamProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
