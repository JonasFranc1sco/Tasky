import { getResponsiveModalContentStyle } from '@/components/responsive-modal-style';
import { useTeam } from '@/hooks/team-context';
import type { EmployeeMember } from '@/types/company';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRef, useState } from 'react';
import { taskErrorMessage } from '@/services/task-service';
import type { NewTask } from '@/types/task';
import { Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Chip, Modal, Portal } from 'react-native-paper';

export type DelegationPayload = NewTask & { assignee: EmployeeMember };

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (payload: DelegationPayload) => Promise<void>;
};

const PRIORITIES: DelegationPayload['priority'][] = [
  'Alta Prioridade',
  'Rotina',
  'Baixa',
];

function FieldLabel({ text }: { text: string }) {
  return (
    <Text className="px-1 text-[11px] font-medium text-on-surface-variant">
      {text}
    </Text>
  );
}

export function DelegateTaskModal({ visible, onDismiss, onConfirm }: Props) {
  const { activeMembers } = useTeam();
  const { width, height } = useWindowDimensions();
  const narrow = width < 480;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] =
    useState<DelegationPayload['priority']>('Alta Prioridade');
  const [assignee, setAssignee] = useState<EmployeeMember | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const reset = () => {
    setTitle('');
    setDescription('');
    setSector('');
    setDueDate('');
    setPriority('Alta Prioridade');
    setAssignee(null);
    setError('');
  };

  const handleDismiss = () => {
    if (savingRef.current) return;
    reset();
    onDismiss();
  };

  const handleConfirm = async () => {
    if (savingRef.current) return;
    if (!title.trim()) {
      setError('Informe o título da tarefa.');
      return;
    }
    if (!assignee) {
      setError('Selecione o funcionário responsável.');
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setError('');
    try {
      await onConfirm({
        title: title.trim(),
        description: description.trim(),
        sector: sector.trim(),
        dueDate: dueDate.trim(),
        priority,
        assignee,
      });
      reset();
    } catch (cause) {
      setError(taskErrorMessage(cause, 'Não foi possível delegar a tarefa.'));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const inputClass =
    'min-h-11 rounded-xl border border-slate-200 bg-surface-container px-3 text-sm text-on-surface';

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={getResponsiveModalContentStyle(width, height, 640)}
      >
        <View className="rounded-3xl bg-surface-lowest p-5 shadow-sm"
          style={{ maxHeight: Math.min(Math.max(height - 48, 0), 760), width: '100%' }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-on-surface">
              Delegar Tarefa
            </Text>
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-container"
              onPress={handleDismiss}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="close" size={18} color="#45464E" />
            </Pressable>
          </View>

          <ScrollView
            className="mt-4 shrink"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="gap-3">
              <View className="gap-1">
                <FieldLabel text="Título da tarefa" />
                <TextInput
                  className={inputClass}
                  value={title}
                  editable={!saving}
                  maxLength={160}
                  onChangeText={setTitle}
                  placeholder="Ex.: Code Review do PR #482"
                  placeholderTextColor="#75777F"
                />
              </View>

              <View className="gap-1">
                <FieldLabel text="Descrição" />
                <TextInput
                  className={inputClass}
                  value={description}
                  editable={!saving}
                  maxLength={4000}
                  onChangeText={setDescription}
                  placeholder="Detalhe o que precisa ser feito..."
                  placeholderTextColor="#75777F"
                  multiline
                />
              </View>

              <View className="gap-2.5" style={{ flexDirection: narrow ? 'column' : 'row' }}>
                <View className="gap-1" style={{ flex: narrow ? undefined : 1 }}>
                  <FieldLabel text="Setor" />
                  <TextInput
                    className={inputClass}
                    value={sector}
                    editable={!saving}
                    maxLength={100}
                    onChangeText={setSector}
                    placeholder="Backend"
                    placeholderTextColor="#75777F"
                  />
                </View>
                <View className="gap-1" style={{ flex: narrow ? undefined : 1 }}>
                  <FieldLabel text="Prazo" />
                  <TextInput
                    className={inputClass}
                    value={dueDate}
                    editable={!saving}
                    maxLength={100}
                    onChangeText={setDueDate}
                    placeholder="Hoje, 16:00"
                    placeholderTextColor="#75777F"
                  />
                </View>
              </View>

              <View className="gap-1">
                <FieldLabel text="Prioridade" />
                <View className="flex-row flex-wrap gap-2">
                  {PRIORITIES.map((item) => (
                    <Chip
                      key={item}
                      mode="flat"
                      selected={priority === item}
                      disabled={saving}
                      onPress={() => setPriority(item)}
                      style={{
                        backgroundColor:
                          priority === item ? '#0F2042' : '#ECEFF0',
                        borderRadius: 12,
                      }}
                      textStyle={{
                        color: priority === item ? '#FFFFFF' : '#45464E',
                        fontWeight: '600',
                        fontSize: 12,
                      }}
                    >
                      {item}
                    </Chip>
                  ))}
                </View>
              </View>

              {/* Lista de funcionários ativos da empresa vindos do Firebase */}
              <View className="gap-1">
                <FieldLabel text="Funcionário responsável" />
                <View className="flex-col gap-2">
                  {activeMembers.length === 0 ? (
                    <Text className="px-1 py-2 text-xs text-on-surface-variant">
                      Nenhum funcionário ativo vinculado à empresa.
                    </Text>
                  ) : (
                    activeMembers.map((employee) => {
                      const selected = assignee?.id === employee.id;
                      return (
                        <Pressable
                          key={employee.id}
                          className={`flex-row items-center gap-3 rounded-xl border p-3 ${selected ? 'border-primary bg-primary-soft' : 'border-slate-200 bg-surface-container'}`}
                          onPress={() => setAssignee(employee)}
                          disabled={saving}
                        >
                          <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-lowest">
                            <Text className="text-xs font-bold text-primary">
                              {employee.initials}
                            </Text>
                          </View>
                          <View className="min-w-0 flex-1">
                            <Text
                              className="text-sm font-semibold text-on-surface"
                              numberOfLines={1}
                            >
                              {employee.name}
                            </Text>
                            <Text
                              className="text-xs text-on-surface-variant"
                              numberOfLines={1}
                            >
                              {employee.jobTitle}
                            </Text>
                          </View>
                          <MaterialCommunityIcons
                            name={selected ? 'check-circle' : 'circle-outline'}
                            size={20}
                            color={selected ? '#0F2042' : '#75777F'}
                          />
                        </Pressable>
                      );
                    })
                  )}
                </View>
              </View>

              {error ? (
                <Text className="text-xs text-error">{error}</Text>
              ) : null}
            </View>
          </ScrollView>

          <View className="mt-4 flex-row gap-2.5">
            <Pressable
              className="h-11 flex-1 items-center justify-center rounded-xl bg-surface-container active:opacity-80"
              onPress={handleDismiss}
            >
              <Text className="text-sm font-semibold text-on-surface-variant">
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              className="h-11 flex-1 items-center justify-center rounded-xl bg-primary active:opacity-80"
              onPress={handleConfirm}
              disabled={saving}
            >
              <Text className="text-sm font-semibold text-white">
                {saving ? 'Salvando…' : 'Delegar Tarefa'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}
