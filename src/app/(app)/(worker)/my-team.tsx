import { ColleagueCard, type Colleague } from '@/components/colleague-card';
import { ScreenHeader } from '@/components/screen-header';
import { TeamLeadershipCard, type TeamLead } from '@/components/team-leadership-card';
import { TeamShiftStats } from '@/components/team-shift-stats';
import { CURRENT_COMPANY, CURRENT_EMPLOYEE } from '@/constants/tasks';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Chip } from 'react-native-paper';

const COLLEAGUES: Colleague[] = [
  {
    id: 'c1',
    name: CURRENT_EMPLOYEE,
    role: 'Desenvolvedor Frontend • Desenvolvimento',
    sector: 'Frontend',
    status: 'turno',
    initials: 'JF',
    isSelf: true,
    shift: 'A',
    statusDetail: 'Em turno até 18:00',
  },
  {
    id: 'c2',
    name: 'Rafael Horeay',
    role: 'Desenvolvedor Backend • Backend',
    sector: 'Backend',
    status: 'turno',
    initials: 'RH',
    statusDetail: 'Em turno • Code review do dia',
  },
  {
    id: 'c3',
    name: 'Kemily Freitas',
    role: 'QA Engineer • Qualidade',
    sector: 'Qualidade',
    status: 'turno',
    initials: 'KF',
    statusDetail: 'Em turno • Iteração de testes',
  },
  {
    id: 'c4',
    name: 'Eduarda Najara',
    role: 'DevOps Engineer • Infraestrutura',
    sector: 'Infraestrutura',
    status: 'turno',
    initials: 'EN',
    statusDetail: 'Em turno • Deploy monitorado',
  },
];

const MANAGER: TeamLead = {
    name: 'João Pedro',
    role: 'Gerente',
    initials: 'JP'
};

type Filter = 'all' | 'turno' | 'sector';

export default function MyTeamScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const selfSector = COLLEAGUES.find((c) => c.isSelf)?.sector ?? '';
  const onShift = COLLEAGUES.filter((c) => c.status === 'turno').length;

  const filtered = COLLEAGUES.filter((colleague) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'turno'
          ? colleague.status === 'turno'
          : colleague.sector === selfSector;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      colleague.name.toLowerCase().includes(q) ||
      colleague.role.toLowerCase().includes(q) ||
      colleague.sector.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Equipe" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => <ColleagueCard colleague={item} />}
        ListHeaderComponent={
          <>
            <View className="flex-row items-center justify-between pt-1">
              <View>
                <Text className="text-xl font-bold text-on-surface">Nossa Equipe</Text>
                <View className="mt-0.5 flex-row items-center gap-1.5">
                  <View className="h-2 w-2 rounded-full bg-[#006A61]" />
                  <Text className="text-xs font-medium text-on-surface-variant">
                    {CURRENT_COMPANY} • {COLLEAGUES.length} colegas
                  </Text>
                </View>
              </View>
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-container">
                <MaterialCommunityIcons name="badge-account-outline" size={20} color="#0F2042" />
              </View>
            </View>

            <View className="gap-2.5">
              <View className="flex-row items-center rounded-2xl border border-slate-200 bg-surface-lowest px-4 h-12 shadow-sm">
                <MaterialCommunityIcons name="magnify" size={20} color="#75777F" />
                <TextInput
                  className="ml-2 flex-1 text-sm text-on-surface"
                  placeholder="Buscar colega por nome ou setor..."
                  placeholderTextColor="#75777F"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                    <MaterialCommunityIcons name="close-circle" size={18} color="#75777F" />
                  </Pressable>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="py-0.5"
                contentContainerClassName="gap-2"
              >
                <Chip
                  mode="flat"
                  selected={filter === 'all'}
                  onPress={() => setFilter('all')}
                  style={{ backgroundColor: filter === 'all' ? '#0F2042' : '#ECEFF0', borderRadius: 12 }}
                  textStyle={{ color: filter === 'all' ? '#FFFFFF' : '#45464E', fontWeight: '600', fontSize: 12 }}
                >
                  Todos ({COLLEAGUES.length})
                </Chip>

                <Chip
                  mode="flat"
                  selected={filter === 'sector'}
                  onPress={() => setFilter('sector')}
                  style={{ backgroundColor: filter === 'sector' ? '#0F2042' : '#ECEFF0', borderRadius: 12 }}
                  textStyle={{ color: filter === 'sector' ? '#FFFFFF' : '#45464E', fontWeight: '600', fontSize: 12 }}
                >
                  Meu Setor ({selfSector})
                </Chip>

                <Chip
                  mode="flat"
                  selected={filter === 'turno'}
                  onPress={() => setFilter('turno')}
                  style={{ backgroundColor: filter === 'turno' ? '#0F2042' : '#ECEFF0', borderRadius: 12 }}
                  textStyle={{ color: filter === 'turno' ? '#FFFFFF' : '#45464E', fontWeight: '600', fontSize: 12 }}
                >
                  Em Turno ({onShift})
                </Chip>
              </ScrollView>
            </View>
            </>
        }
        ListFooterComponent={
          <>
            <TeamLeadershipCard manager={MANAGER} />
            <TeamShiftStats
              shift="08:00 – 18:00"
              shiftStatus="Operando normal"
              present={onShift}
              total={COLLEAGUES.length}
            />
          </>
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <MaterialCommunityIcons name="account-search-outline" size={48} color="#75777F" />
            <Text className="mt-3 text-sm font-semibold text-on-surface">
              Nenhum colega encontrado
            </Text>
            <Text className="mt-1 text-xs text-on-surface-variant">
              Tente outro nome ou remova o filtro ativo.
            </Text>
          </View>
        }
      />
    </View>
  );
}