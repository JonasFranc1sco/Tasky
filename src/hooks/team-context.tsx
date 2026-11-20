import { useAuth } from '@/hooks/auth-context';
import {
  TeamService,
  type CreateInviteInput,
  type UpdateEmployeeInput,
} from '@/services/team-service';
import type { CompanyInvite, EmployeeMember } from '@/types/company';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type TeamStatusFilter = 'all' | 'active' | 'pending';

type TeamContextValue = {
  members: EmployeeMember[];
  activeMembers: EmployeeMember[];
  pendingMembers: EmployeeMember[];
  filteredMembers: EmployeeMember[];
  manager: EmployeeMember | null;
  filter: TeamStatusFilter;
  setFilter: (filter: TeamStatusFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  metrics: {
    total: number;
    active: number;
    pending: number;
  };
  loading: boolean;
  inviteEmployee: (
    data: Omit<CreateInviteInput, 'companyId' | 'companyName' | 'createdByUid'>
  ) => Promise<{ invite: CompanyInvite; inviteLink: string }>;
  updateEmployee: (
    memberId: string,
    isInvite: boolean,
    updates: UpdateEmployeeInput
  ) => Promise<void>;
  removeMember: (memberId: string, isInvite: boolean) => Promise<void>;
};

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { profile, company, isAdmin } = useAuth();
  const [rawMembers, setRawMembers] = useState<EmployeeMember[]>([]);
  const [filter, setFilter] = useState<TeamStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const companyId = profile?.companyId ?? null;

  // Sincroniza em tempo real a lista de funcionários e convites da empresa
  useEffect(() => {
    if (!companyId) {
      return;
    }

    const unsubscribe = TeamService.subscribeToCompanyMembers(
      companyId,
      (nextMembers) => {
        setRawMembers(nextMembers);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [companyId]);

  const members = useMemo(
    () => (companyId ? rawMembers : []),
    [companyId, rawMembers]
  );

  // Lista apenas funcionários com vínculo ativo
  const activeMembers = useMemo(
    () => members.filter((m) => m.status === 'active'),
    [members]
  );

  // Lista apenas funcionários ou convites pendentes
  const pendingMembers = useMemo(
    () => members.filter((m) => m.status === 'pending'),
    [members]
  );

  // Identifica o administrador/gestor principal da empresa
  const manager = useMemo(
    () => activeMembers.find((m) => m.role === 'admin') ?? null,
    [activeMembers]
  );

  // Aplica o filtro de status (todos, ativos, pendentes) e busca por texto
  const filteredMembers = useMemo(
    () => TeamService.filterMembers(members, filter, searchQuery),
    [members, filter, searchQuery]
  );

  // Calcula contadores de equipe para os cards e chips de filtro
  const metrics = useMemo(
    () => ({
      total: members.length,
      active: activeMembers.length,
      pending: pendingMembers.length,
    }),
    [members.length, activeMembers.length, pendingMembers.length]
  );

  // Cria um novo convite de funcionário vinculado à empresa do administrador
  const inviteEmployee = useCallback<TeamContextValue['inviteEmployee']>(
    async (data) => {
      if (!isAdmin || !profile) {
        throw new Error('Apenas administradores podem convidar funcionários.');
      }

      const targetCompanyId = company?.id || profile.companyId;
      const targetCompanyName =
        company?.companyName || profile.companyName || 'Empresa';

      return TeamService.createEmployeeInvite({
        ...data,
        companyId: targetCompanyId,
        companyName: targetCompanyName,
        createdByUid: profile.uid,
      });
    },
    [company, isAdmin, profile]
  );

  // Atualiza informações, função (admin/worker) ou status de um funcionário
  const updateEmployee = useCallback<TeamContextValue['updateEmployee']>(
    async (memberId, isInvite, updates) => {
      if (!isAdmin) {
        throw new Error('Apenas administradores podem atualizar funcionários.');
      }
      await TeamService.updateEmployee(memberId, isInvite, updates);
    },
    [isAdmin]
  );

  // Remove um convite ou desvincula um membro da equipe
  const removeMember = useCallback<TeamContextValue['removeMember']>(
    async (memberId, isInvite) => {
      if (!isAdmin) {
        throw new Error('Apenas administradores podem remover membros.');
      }
      await TeamService.removeMember(memberId, isInvite);
    },
    [isAdmin]
  );

  const value = useMemo<TeamContextValue>(
    () => ({
      members,
      activeMembers,
      pendingMembers,
      filteredMembers,
      manager,
      filter,
      setFilter,
      searchQuery,
      setSearchQuery,
      metrics,
      loading,
      inviteEmployee,
      updateEmployee,
      removeMember,
    }),
    [
      members,
      activeMembers,
      pendingMembers,
      filteredMembers,
      manager,
      filter,
      searchQuery,
      metrics,
      loading,
      inviteEmployee,
      updateEmployee,
      removeMember,
    ]
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) {
    throw new Error('useTeam deve ser usado dentro de <TeamProvider>');
  }
  return ctx;
}
