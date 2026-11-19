import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

type Props = {
  name: string;
  initials: string;
  photoURL?: string | null;
  photoUploading?: boolean;
  photoError?: string | null;
  role: string;
  company: string;
  statusLabel: string;
  employeeCode: string;
  badgeLabel?: string;
  onEditPress?: () => void;
  onPhotoPress?: () => void;
};

export function ProfileHeroCard({
  name,
  initials,
  photoURL,
  photoUploading = false,
  photoError,
  role,
  company,
  statusLabel,
  employeeCode,
  badgeLabel = 'Você',
  onEditPress,
  onPhotoPress,
}: Props) {
  return (
    <View className="rounded-2xl bg-surface-lowest p-4 shadow-sm">
      <View className="flex-row items-start gap-4">
        <View className="relative shrink-0">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Alterar foto do perfil"
            accessibilityHint="Abre a galeria para escolher uma nova foto."
            disabled={photoUploading}
            onPress={onPhotoPress}
            className="h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-surface-container shadow-sm active:opacity-80"
          >
            {photoURL ? (
              <Image
                source={{ uri: photoURL }}
                resizeMode="cover"
                style={{ width: 80, height: 80 }}
              />
            ) : (
              <Text className="text-lg font-bold text-on-surface">
                {initials}
              </Text>
            )}
          </Pressable>
          <View
            pointerEvents="none"
            className="absolute -top-1 -right-1 h-4 w-4 items-center justify-center rounded-full bg-surface-lowest"
          >
            <View className="h-2.5 w-2.5 rounded-full bg-[#006A61]" />
          </View>
          <View
            pointerEvents="none"
            className="absolute -bottom-1 -right-1 h-7 w-7 items-center justify-center rounded-full border-2 border-surface-lowest bg-primary"
          >
            {photoUploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons
                name="camera-outline"
                size={14}
                color="#FFFFFF"
              />
            )}
          </View>
        </View>

        <View className="min-w-0 flex-1 justify-center">
          <View className="flex-row flex-wrap items-center gap-1.5">
            <Text className="text-lg font-bold text-on-surface" numberOfLines={1}>
              {name}
            </Text>
            <View className="rounded-full bg-[#0F2042] px-2 py-0.5">
              <Text className="text-[10px] font-semibold uppercase tracking-wider text-white">
                {badgeLabel}
              </Text>
            </View>
          </View>
          <Text className="mt-0.5 text-sm text-on-surface-variant" numberOfLines={1}>
            {role}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <MaterialCommunityIcons name="storefront" size={15} color="#006A61" />
            <Text className="text-xs text-on-surface" numberOfLines={1}>
              {company}
            </Text>
          </View>
          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            <View className="flex-row items-center gap-1 rounded-full bg-[#006A61]/10 px-2 py-0.5">
              <View className="h-1.5 w-1.5 rounded-full bg-[#006A61]" />
              <Text className="text-[11px] font-medium text-[#006A61]">{statusLabel}</Text>
            </View>
            <View className="rounded bg-surface-container px-1.5 py-0.5">
              <Text className="text-[11px] text-outline">{employeeCode}</Text>
            </View>
          </View>
        </View>
      </View>

      {photoError ? (
        <Text className="mt-2 text-xs text-error">{photoError}</Text>
      ) : null}

      <Pressable
        className="mt-4 h-10 flex-row items-center justify-center gap-2 rounded-xl bg-surface-container active:opacity-80"
        onPress={onEditPress}
      >
        <MaterialCommunityIcons name="pencil" size={18} color="#0F2042" />
        <Text className="text-sm font-semibold text-primary">Editar Informações Pessoais</Text>
      </Pressable>
    </View>
  );
}
