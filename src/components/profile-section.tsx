import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

type SectionProps = {
  title: string;
  children: ReactNode;
};

export function ProfileSection({ title, children }: SectionProps) {
  return (
    <View>
      <Text className="px-1 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
        {title}
      </Text>
      <View className="mt-1.5 rounded-2xl bg-surface-lowest shadow-sm">{children}</View>
    </View>
  );
}

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type RowProps = {
  icon: IconName;
  iconColor?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  divider?: boolean;
};

export function ProfileRow({
  icon,
  iconColor = '#45464E',
  title,
  subtitle,
  right,
  onPress,
  divider,
}: RowProps) {
  return (
    <View>
      <Pressable
        className="flex-row items-center justify-between px-4 py-3.5 active:bg-surface-container"
        onPress={onPress}
        disabled={!onPress}
      >
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container">
            <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-medium text-on-surface" numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text className="mt-0.5 text-[11px] text-outline" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {right}
      </Pressable>
      {divider ? <View className="mx-4 h-px bg-surface-container" /> : null}
    </View>
  );
}