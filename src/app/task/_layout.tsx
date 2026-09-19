import { Stack } from 'expo-router';

export default function TaskLayout() {
    return (
    <Stack screenOptions={{ headerTintColor: '#0F2042', headerTitleStyle: { fontWeight: '600' } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhes da Tarefa', 
        headerStyle: { backgroundColor: '#FFFFFF'}, 
        headerTintColor: '#0F2042',
        headerTitleStyle: { color: '#0F2042', fontWeight: '600'} }} />
    </Stack>
    );
}