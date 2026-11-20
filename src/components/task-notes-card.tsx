import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';
import type { TaskNote } from '@/constants/tasks';

type Props = {
  notes: TaskNote[];
  onSaveNote?: (content: string) => void;
  readOnly?: boolean;
  title?: string;
  emptyMessage?: string;
};

export function TaskNotesCard({
  notes,
  onSaveNote,
  readOnly = false,
  title = 'Observações da Chefia',
  emptyMessage = 'Nenhuma observação registrada.',
}: Props) {
  const [inputText, setInputText] = useState('');

  const handleSave = () => {
    if (!inputText.trim()) return;
    onSaveNote?.(inputText.trim());
    setInputText('');
  };

  const entryCountLabel = readOnly
    ? notes.length === 1
      ? 'mensagem'
      : 'mensagens'
    : notes.length === 1
      ? 'nota'
      : 'notas';

  return (
    <View className="rounded-3xl border border-slate-100 bg-surface-lowest p-4 shadow-sm">
      {/* Cabeçalho do Card com Ícone, Título e Contador */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons
            name="message-text-outline"
            size={20}
            color="#191C1E"
          />
          <Text className="text-base font-bold text-on-surface">
            {title}
          </Text>
        </View>

        <Text className="text-xs font-medium text-[#75777F]">
          {notes.length} {entryCountLabel}
        </Text>
      </View>

      {/* Lista de Notas Cadastradas */}
      <View className="mt-3.5 gap-2.5">
        {notes.map((note) => (
          <View
            key={note.id}
            className="rounded-2xl bg-surface-low p-3.5"
          >
            {/* Autor, Cargo e Horário */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-xs font-bold text-on-surface">
                  {note.author}
                </Text>
                <Text className="text-xs text-[#75777F]">
                  {' '}
                  ({note.role})
                </Text>
              </View>
              <Text className="text-xs font-medium text-[#75777F]">
                {note.timestamp}
              </Text>
            </View>

            {/* Conteúdo da Nota com Aspas */}
            <Text className="mt-1.5 text-xs font-medium leading-relaxed text-on-surface-variant">
              &ldquo;{note.content}&rdquo;
            </Text>
          </View>
        ))}
        {notes.length === 0 && (
          <Text className="rounded-2xl bg-surface-low p-3.5 text-xs text-on-surface-variant">
            {emptyMessage}
          </Text>
        )}
      </View>

      {!readOnly && (
        <>
          {/* Rótulo de Criação de Nova Nota */}
          <Text className="mt-4 text-xs font-semibold text-on-surface-variant">
            Adicionar nova nota ou apontamento
          </Text>

          {/* Campo de Entrada da Observação */}
          <View className="mt-2 rounded-2xl bg-surface-low p-3">
            <TextInput
              className="min-h-[72px] text-xs text-on-surface"
              placeholder="Digite uma observação para o colaborador..."
              placeholderTextColor="#75777F"
              multiline
              textAlignVertical="top"
              value={inputText}
              onChangeText={setInputText}
            />
          </View>

          {/* Rodapé de Ações: Indicador de Visibilidade e Botão Salvar */}
          <View className="mt-3.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <MaterialCommunityIcons
                name="eye-outline"
                size={16}
                color="#75777F"
              />
              <Text className="text-xs font-medium text-[#75777F]">
                Visível para a equipe
              </Text>
            </View>

            <Button
              mode="contained"
              icon="arrow-right"
              buttonColor="#0F2042"
              textColor="#FFFFFF"
              contentStyle={{ flexDirection: 'row-reverse', height: 40 }}
              style={{ borderRadius: 12 }}
              labelStyle={{ fontWeight: '600', fontSize: 13 }}
              onPress={handleSave}
              disabled={!inputText.trim()}
            >
              Salvar Nota
            </Button>
          </View>
        </>
      )}
    </View>
  );
}
