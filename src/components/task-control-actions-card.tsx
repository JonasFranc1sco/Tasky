import type { TaskStatus } from '@/types/task';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-paper';

type Props = {
  onValidateAndArchive: () => void;
  onReopenTask: () => void;
  status: TaskStatus;
  busy: boolean;
};

export function TaskControlActionsCard({
  onValidateAndArchive,
  onReopenTask,
  status,
  busy,
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
        {status === 'archived' ? 'A tarefa foi validada e arquivada.' :
          status === 'pending' ? 'A tarefa precisa ser concluída antes da validação.' :
            'Se houver inconformidades, reabra a tarefa para correção.'}
      </Text>

      {/* Botão de Validar e Arquivar Tarefa (Ação Principal) */}
      {status === 'completed' && <Button
        mode="contained"
        icon="check"
        buttonColor="#0F2042"
        textColor="#FFFFFF"
        contentStyle={{ height: 48 }}
        style={{ borderRadius: 16, marginTop: 14 }}
        labelStyle={{ fontWeight: '600', fontSize: 14 }}
        onPress={onValidateAndArchive}
        disabled={busy}
      >
        Validar e Arquivar Tarefa
      </Button>}

      {/* Botão de Reabertura de Tarefa (Ação Secundária) */}
      {status !== 'pending' && <Button
        mode="contained"
        icon="restart"
        buttonColor="#E4EDF7"
        textColor="#0F2042"
        contentStyle={{ height: 48 }}
        style={{ borderRadius: 16, marginTop: 10 }}
        labelStyle={{ fontWeight: '600', fontSize: 14 }}
        onPress={onReopenTask}
        disabled={busy}
      >
        Reabrir Tarefa (Pendente)
      </Button>}
    </View>
  );
}
