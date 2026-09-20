import React from 'react';
import { Text, View } from 'react-native';

export type TaskDetailInfo = {
  id: string;
  code: string;
  title: string;
  description: string;
  status: 'completed' | 'pending';
  assignee: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
};

type Props = {
  task: TaskDetailInfo;
};

export function TaskInfoCard({ task }: Props) {
  const isCompleted = task.status === 'completed';

  return (
    <View className="rounded-3xl border border-slate-100 bg-surface-lowest p-4 shadow-sm">
      {/* Linha Superior: Badge de Status e Código da Tarefa */}
      <View className="flex-row items-center gap-2.5">
        {isCompleted ? (
          <View className="flex-row items-center gap-1.5 rounded-full bg-[#E0F2F1] px-2.5 py-1">
            <View className="h-2 w-2 rounded-full bg-[#00796B]" />
            <Text className="text-xs font-semibold text-[#004D40]">
              Concluída
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1">
            <View className="h-2 w-2 rounded-full bg-amber-600" />
            <Text className="text-xs font-semibold text-amber-800">
              Pendente
            </Text>
          </View>
        )}

        <Text className="text-xs font-medium text-on-surface-variant">
          {task.code}
        </Text>
      </View>

      {/* Título Principal da Tarefa */}
      <Text className="mt-3 text-lg font-bold text-on-surface">
        {task.title}
      </Text>

      {/* Descrição Detalhada da Tarefa */}
      <Text className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">
        {task.description}
      </Text>

      {/* Grade 2x2 com Metadados da Tarefa */}
      <View className="mt-4 gap-2.5">
        {/* Linha 1: Responsável e Prazo de Entrega */}
        <View className="flex-row gap-2.5">
          <View className="flex-1 rounded-2xl bg-surface-low p-3.5">
            <Text className="text-[11px] font-medium text-[#75777F]">
              Responsável
            </Text>
            <Text className="mt-1 text-xs font-bold text-on-surface">
              {task.assignee}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl bg-surface-low p-3.5">
            <Text className="text-[11px] font-medium text-[#75777F]">
              Prazo de Entrega
            </Text>
            <Text className="mt-1 text-xs font-bold text-on-surface">
              {task.dueDate}
            </Text>
          </View>
        </View>

        {/* Linha 2: Criado em e Conclusão */}
        <View className="flex-row gap-2.5">
          <View className="flex-1 rounded-2xl bg-surface-low p-3.5">
            <Text className="text-[11px] font-medium text-[#75777F]">
              Criado em
            </Text>
            <Text className="mt-1 text-xs font-bold text-on-surface">
              {task.createdAt}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl bg-surface-low p-3.5">
            <Text className="text-[11px] font-medium text-[#75777F]">
              Conclusão
            </Text>
            <Text className="mt-1 text-xs font-bold text-on-surface">
              {task.completedAt ?? 'Em andamento'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
