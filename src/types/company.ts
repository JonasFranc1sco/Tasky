import type { Timestamp } from 'firebase/firestore';

// Perfis de permissão suportados na plataforma
export type UserRole = 'admin' | 'worker';

// Status do vínculo do funcionário com a empresa
export type MemberStatus = 'active' | 'pending';

// Estrutura da coleção "companies" no Firestore
export type Company = {
  id: string;
  companyName: string;
  legalName: string;
  taxId: string;
  formattedTaxId: string;
  phone: string;
  industry: string;
  ownerId: string;
  inviteCode: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// Estrutura da coleção "invites" no Firestore
export type CompanyInvite = {
  id: string;
  code: string;
  companyId: string;
  companyName: string;
  name: string;
  email: string;
  jobTitle: string;
  sector: string;
  role: UserRole;
  status: 'pending' | 'accepted';
  createdByUid: string;
  acceptedByUid: string | null;
  createdAt: Timestamp;
  acceptedAt: Timestamp | null;
};

// Estrutura da coleção "users" no Firestore
export type UserDocument = {
  id: string;
  uid: string;
  companyId: string;
  companyName: string;
  name: string;
  email: string;
  jobTitle: string;
  sector: string;
  role: UserRole;
  status: MemberStatus;
  employeeCode: string;
  pendingTasks: number;
  completedTasks: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// Modelo unificado de membro da equipe usado nas telas e listagens
export type EmployeeMember = UserDocument & {
  initials: string;
  isInvite?: boolean;
  inviteCode?: string;
  statusMessage?: string;
};

// Extrai as iniciais a partir do nome completo do colaborador
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TK';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

// Gera um código curto de convite no formato PREFIXO-XXXX
export function generateInviteCode(prefix = 'TSK'): string {
  const cleanPrefix =
    prefix
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 5) || 'TSK';
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanPrefix}-${randomPart}`;
}
