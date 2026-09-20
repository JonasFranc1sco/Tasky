import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-paper';

type Props = {
  onInvitePress?: () => void;
};

export function TeamInviteCard({ onInvitePress }: Props) {
  return (
    <View className="rounded-3xl border border-slate-100 bg-surface-lowest p-4 shadow-sm">
      {/* Cabeçalho do Card de Vínculo com Ícone e Descrição */}
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface-container">
          <MaterialCommunityIcons
            name="account-plus-outline"
            size={22}
            color="#0F2042"
          />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-on-surface">
            Novo Vínculo de Equipe
          </Text>
          <Text className="mt-0.5 text-xs text-on-surface-variant">
            Adicione membros usando link ou código (RF02)
          </Text>
        </View>
      </View>

      {/* Botão de Convidar Funcionário com Paper */}
      <Button
        mode="contained"
        icon="plus"
        buttonColor="#0F2042"
        textColor="#FFFFFF"
        contentStyle={{ height: 48 }}
        style={{ borderRadius: 16, marginTop: 14 }}
        labelStyle={{ fontWeight: '600', fontSize: 14 }}
        onPress={onInvitePress ?? (() => {})}
      >
        Convidar Funcionário
      </Button>
    </View>
  );
}
