import { taskErrorMessage } from '@/services/task-service';
import { formatTaskDate, type TaskNote } from '@/types/task';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';

type Props = {
  notes: TaskNote[];
  loading: boolean;
  error: string | null;
  title?: string;
  emptyMessage?: string;
  onSaveNote?: (content: string) => Promise<void>;
};

export function TaskNotesCard({
  notes, loading, error, onSaveNote,
  title = 'Observações da Chefia', emptyMessage = 'Nenhuma observação.',
}: Props) {
  const [inputText, setInputText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savingRef = useRef(false);

  const handleSave = async () => {
    const content = inputText.trim();
    if (!content || !onSaveNote || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      await onSaveNote(content);
      setInputText('');
    } catch (cause) {
      setSaveError(taskErrorMessage(cause, 'Não foi possível salvar a nota.'));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

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
          {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
        </Text>
      </View>

      {error || loading || notes.length === 0 ? (
        <Text className={error ? 'mt-3 text-xs text-error' : 'mt-3 text-xs text-on-surface-variant'}>
          {error ?? (loading ? 'Carregando observações…' : emptyMessage)}
        </Text>
      ) : null}

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
                {formatTaskDate(note.createdAt)}
              </Text>
            </View>

            {/* Conteúdo da Nota com Aspas */}
            <Text className="mt-1.5 text-xs font-medium leading-relaxed text-on-surface-variant">
              &ldquo;{note.content}&rdquo;
            </Text>
          </View>
        ))}
      </View>

      {onSaveNote ? (
        <>
          <Text className="mt-4 text-xs font-semibold text-on-surface-variant">
            Adicionar nova nota ou apontamento
          </Text>

          <View className="mt-2 rounded-2xl bg-surface-low p-3">
            <TextInput
              className="min-h-[72px] text-xs text-on-surface"
              placeholder="Digite uma observação para o colaborador..."
              placeholderTextColor="#75777F"
              multiline
              textAlignVertical="top"
              value={inputText}
              onChangeText={setInputText}
              maxLength={5000}
              editable={!saving}
            />
          </View>

          <View className="mt-3.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <MaterialCommunityIcons name="eye-outline" size={16} color="#75777F" />
              <Text className="text-xs font-medium text-[#75777F]">
                Visível para o responsável
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
              loading={saving}
              disabled={!inputText.trim() || saving}
            >
              Salvar Nota
            </Button>
          </View>
          {saveError ? <Text className="mt-2 text-xs text-error">{saveError}</Text> : null}
        </>
      ) : null}
    </View>
  );
}
