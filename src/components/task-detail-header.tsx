import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  title?: string;
  taskId?: string;
  onBackPress?: () => void;
};

export function TaskDetailHeader({
  title = 'Detalhes da Tarefa',
  taskId = 'RF06',
  onBackPress,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/(gestor)/home');
    }
  };

  return (
    <View
      className="border-b border-surface-container bg-surface-lowest"
      style={{ paddingTop: insets.top }}
    >
      <View className="h-14 flex-row items-center justify-between px-4">
        {/* Botão de Voltar e Título da Tela */}
        <View className="flex-1 flex-row items-center">
          <Pressable
            onPress={handleBack}
            className="mr-2.5 h-10 w-10 items-center justify-center rounded-full active:bg-slate-100"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#191C1E" />
          </Pressable>

          <Text className="text-base font-bold text-on-surface" numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Badge do ID da Tarefa */}
        <View className="rounded-lg bg-surface-container px-2.5 py-1">
          <Text className="text-xs font-bold text-secondary">
            ID #{taskId}
          </Text>
        </View>
      </View>
    </View>
  );
}
