import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  totalCount?: number;
};

export function TeamManagementCard({ totalCount = 4 }: Props) {
  return (
    <View className="flex-row items-center justify-between rounded-3xl bg-surface-container/70 p-4 shadow-sm">
      {/* Informações da Gestão de Colaboradores */}
      <View className="min-w-0 flex-1">
        <Text className="text-base font-bold text-on-surface">
          Gestão de Colaboradores
        </Text>
        <View className="mt-1 flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-primary" />
          <Text className="text-xs font-medium text-on-surface-variant">
            {totalCount} funcionários vinculados
          </Text>
        </View>
      </View>

      {/* Ícone de Crachá/Identificação */}
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface-high/60">
        <MaterialCommunityIcons
          name="card-account-details-outline"
          size={22}
          color="#0F2042"
        />
      </View>
    </View>
  );
}
