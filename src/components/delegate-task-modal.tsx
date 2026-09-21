import { EMPLOYEES, type Employee } from '@/constants/employees';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Chip, Modal, Portal } from 'react-native-paper';

export type DelegationPayload = {
  title: string;
  description: string;
  sector: string;
  dueDate: string;
  priority: 'Alta Prioridade' | 'Rotina' | 'Baixa';
  assignee: Employee;
};

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (payload: DelegationPayload) => void;
};

const PRIORITIES: DelegationPayload['priority'][] = ['Alta Prioridade', 'Rotina', 'Baixa'];

function FieldLabel({ text }: { text: string }) {
  return <Text className="px-1 text-[11px] font-medium text-on-surface-variant">{text}</Text>;
}

export function DelegateTaskModal({ visible, onDismiss, onConfirm }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<DelegationPayload['priority']>('Alta Prioridade');
  const [assignee, setAssignee] = useState<Employee | null>(null);
  const [error, setError] = useState('');

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
    reset();
    onDismiss();
  };

  const handleConfirm = () => {
    if (!title.trim()) {
      setError('Informe o título da tarefa.');
      return;
    }
    if (!assignee) {
      setError('Selecione o funcionário responsável.');
      return;
    }
    onConfirm({
      title: title.trim(),
      description: description.trim(),
      sector: sector.trim(),
      dueDate: dueDate.trim(),
      priority,
      assignee,
    });
    reset();
  };

  const inputClass = 'min-h-11 rounded-xl border border-slate-200 bg-surface-container px-3 text-sm text-on-surface';

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={{ margin: 20 }}
      >
        <View className="max-h-[85%] rounded-3xl bg-surface-lowest p-5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-on-surface">Delegar Tarefa</Text>
            <Pressable className="h-8 w-8 items-center justify-center rounded-full bg-surface-container" onPress={handleDismiss} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={18} color="#45464E" />
            </Pressable>
          </View>

          <ScrollView
            className="mt-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="gap-3">
              <View className="gap-1">
                <FieldLabel text="Título da tarefa" />
                <TextInput
                  className={inputClass}
                  value={title}
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
                  onChangeText={setDescription}
                  placeholder="Detalhe o que precisa ser feito..."
                  placeholderTextColor="#75777F"
                  multiline
                />
              </View>

              <View className="flex-row gap-2.5">
                <View className="flex-1 gap-1">
                  <FieldLabel text="Setor" />
                  <TextInput
                    className={inputClass}
                    value={sector}
                    onChangeText={setSector}
                    placeholder="Backend"
                    placeholderTextColor="#75777F"
                  />
                </View>
                <View className="flex-1 gap-1">
                  <FieldLabel text="Prazo" />
                  <TextInput
                    className={inputClass}
                    value={dueDate}
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
                      onPress={() => setPriority(item)}
                      style={{
                        backgroundColor: priority === item ? '#0F2042' : '#ECEFF0',
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

              <View className="gap-1">
                <FieldLabel text="Funcionário responsável" />
                <View className="flex-col gap-2">
                  {EMPLOYEES.map((employee) => {
                    const selected = assignee?.id === employee.id;
                    return (
                      <Pressable
                        key={employee.id}
                        className={`flex-row items-center gap-3 rounded-xl border p-3 ${selected ? 'border-primary bg-primary-soft' : 'border-slate-200 bg-surface-container'}`}
                        onPress={() => setAssignee(employee)}
                      >
                        <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-lowest">
                          <Text className="text-xs font-bold text-primary">{employee.initials}</Text>
                        </View>
                        <View className="min-w-0 flex-1">
                          <Text className="text-sm font-semibold text-on-surface" numberOfLines={1}>
                            {employee.name}
                          </Text>
                          <Text className="text-xs text-on-surface-variant" numberOfLines={1}>
                            {employee.role}
                          </Text>
                        </View>
                        <MaterialCommunityIcons
                          name={selected ? 'check-circle' : 'circle-outline'}
                          size={20}
                          color={selected ? '#0F2042' : '#75777F'}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {error ? <Text className="text-xs text-error">{error}</Text> : null}
            </View>
          </ScrollView>

          <View className="mt-4 flex-row gap-2.5">
            <Pressable
              className="h-11 flex-1 items-center justify-center rounded-xl bg-surface-container active:opacity-80"
              onPress={handleDismiss}
            >
              <Text className="text-sm font-semibold text-on-surface-variant">Cancelar</Text>
            </Pressable>
            <Pressable
              className="h-11 flex-1 items-center justify-center rounded-xl bg-primary active:opacity-80"
              onPress={handleConfirm}
            >
              <Text className="text-sm font-semibold text-white">Delegar Tarefa</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}