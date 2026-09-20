import { Text, View } from 'react-native';
import { Divider } from 'react-native-paper';

type Props = {
  greeting?: string;
  company?: string;
  date?: string;
};

export function ManagerHeroCard({
  greeting = 'Olá, Gestor 👋',
  company = 'Café & Grãos Ltda',
  date = 'Hoje, 24 de Out',
}: Props) {
  return (
    <View className="rounded-3xl bg-primary p-5 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
          <View className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <Text className="text-xs font-medium text-slate-200">Painel Administrativo</Text>
        </View>
        <Text className="text-xs font-medium text-slate-300">{date}</Text>
      </View>

      <Text className="mt-4 text-2xl font-bold text-white">{greeting}</Text>

      <Divider style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', marginVertical: 14 }} />

      <Text className="text-xs font-medium text-slate-300">{company}</Text>
    </View>
  );
}
