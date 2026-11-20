import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-paper';

type Props = {
  onValidateAndArchive?: () => void;
  onReopenTask?: () => void;
  isCompleted: boolean;
  isArchived: boolean;
};

export function TaskControlActionsCard({
  onValidateAndArchive,
  onReopenTask,
  isCompleted,
  isArchived,
}: Props) {
  return (
    <View className="rounded-3xl border border-slate-100 bg-surface-lowest p-4 shadow-sm">
      {/* Cabeçalho do Card com Ícone de Ajuste e Título */}
      <View className="flex-row items-center gap-2">
        <MaterialCommunityIcons
          name="tune-variant"
          size={20}
          color="#191C1E"
        />
        <Text className="text-base font-bold text-on-surface">
          Ações de Controle
        </Text>
      </View>

      {/* Subtítulo de Orientação para o Gestor */}
      <Text className="mt-1 text-xs leading-relaxed text-[#75777F]">
        {isArchived
          ? 'A tarefa foi encerrada após a validação. Você ainda pode reabri-la.'
          : 'Se houver inconformidades, devolva a tarefa para correção imediata.'}
      </Text>

      {!isCompleted ? (
        <Text className="mt-4 rounded-2xl bg-surface-low p-3.5 text-xs text-on-surface-variant">
          A tarefa precisa ser concluída pelo colaborador antes da validação.
        </Text>
      ) : isArchived ? (
        <View className="mt-4 flex-row items-center gap-3 rounded-2xl border border-success/20 bg-success/10 p-3.5">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-success/15">
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={22}
              color="#006A61"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-success">
              Tarefa arquivada
            </Text>
            <Text className="mt-0.5 text-xs leading-relaxed text-on-surface-variant">
              Validação concluída pelo gestor.
            </Text>
          </View>
        </View>
      ) : (
        <Button
          mode="contained"
          icon="check"
          buttonColor="#0F2042"
          textColor="#FFFFFF"
          contentStyle={{ height: 48 }}
          style={{ borderRadius: 16, marginTop: 14 }}
          labelStyle={{ fontWeight: '600', fontSize: 14 }}
          onPress={onValidateAndArchive ?? (() => {})}
        >
          Validar e Arquivar Tarefa
        </Button>
      )}

      {isCompleted ? (
        <Button
          mode="contained"
          icon="restart"
          buttonColor="#E4EDF7"
          textColor="#0F2042"
          contentStyle={{ height: 48 }}
          style={{ borderRadius: 16, marginTop: 10 }}
          labelStyle={{ fontWeight: '600', fontSize: 14 }}
          onPress={onReopenTask ?? (() => {})}
        >
          Reabrir Tarefa (Pendente)
        </Button>
      ) : null}
    </View>
  );
}
