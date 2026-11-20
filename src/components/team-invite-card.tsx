import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

type Props = {
  inviteCode?: string;
  inviteLink?: string;
  onInvitePress?: () => void;
};

export function TeamInviteCard({
  inviteCode,
  inviteLink,
  onInvitePress,
}: Props) {
  // Compartilha o código ou link geral da empresa
  const handleShareCompanyCode = async () => {
    if (!inviteCode) return;
    try {
      await Share.share({
        message: inviteLink
          ? `Entre na nossa equipe no Tasky!\nCódigo da empresa: ${inviteCode}\nLink: ${inviteLink}`
          : `Entre na nossa equipe no Tasky usando o código: ${inviteCode}`,
      });
    } catch {
      // Ignora cancelamento do compartilhamento
    }
  };

  return (
    <View className="rounded-3xl border border-slate-100 bg-surface-lowest p-4 shadow-sm">
      {/* Cabeçalho do Card de Vínculo com Ícone e Descrição */}
      <View className="flex-row flex-wrap items-center gap-3">
        <View className="h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-container">
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

        {inviteCode ? (
          <Pressable
            className="flex-row shrink-0 items-center gap-1 rounded-xl bg-surface-container px-2.5 py-1.5"
            onPress={handleShareCompanyCode}
          >
            <Text className="text-xs font-bold text-primary">{inviteCode}</Text>
            <MaterialCommunityIcons
              name="share-variant-outline"
              size={14}
              color="#0F2042"
            />
          </Pressable>
        ) : null}
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
