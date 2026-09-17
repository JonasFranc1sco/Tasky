import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    title: string;
    right?: React.ReactNode;
};

export function ScreenHeader({ title, right }: Props) {
    const insets = useSafeAreaInsets();

    return (
    <View className="border-b border-surface-container bg-surface-lowest" style={{ paddingTop: insets.top }}>
      <View className="h-16 flex-row items-center justify-between px-4">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color="#FFFFFF" />
          </View>
          <View className="min-w-0">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Tasky</Text>
            <Text className="text-base font-semibold text-on-surface" numberOfLines={1}>{title}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          {right ?? <IconButton icon="bell" size={22} onPress={() => {}} />}
        </View>
      </View>
    </View>
    );
}