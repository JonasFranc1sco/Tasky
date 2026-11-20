import { auth, db } from '@/config/firebase';
import { CompanyService } from '@/services/company-service';
import {
  generateInviteCode,
  getInitials,
  type CompanyInvite,
  type EmployeeMember,
  type MemberStatus,
  type UserDocument,
  type UserRole,
} from '@/types/company';
import * as Linking from 'expo-linking';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

export type CreateInviteInput = {
  companyId: string;
  companyName: string;
  createdByUid: string;
  name: string;
  email: string;
  jobTitle: string;
  sector: string;
  role?: UserRole;
};

export type AcceptInviteInput = {
  code: string;
  name?: string;
  email?: string;
  password: string;
  jobTitle?: string;
  sector?: string;
};

export type UpdateEmployeeInput = Partial<{
  name: string;
  email: string;
  jobTitle: string;
  sector: string;
  role: UserRole;
  status: MemberStatus;
}>;

export class TeamService {
  private static usersCol = collection(db, 'users');
  private static invitesCol = collection(db, 'invites');

  // Constrói o link de convite para acesso direto na tela de vínculo (/join?code=...)
  static buildInviteLink(code: string): string {
    return Linking.createURL('/join', {
      queryParams: { code: code.trim().toUpperCase() },
    });
  }

  // Cria um convite de funcionário pendente na coleção "invites"
  static async createEmployeeInvite(
    input: CreateInviteInput
  ): Promise<{ invite: CompanyInvite; inviteLink: string }> {
    const inviteRef = doc(this.invitesCol);
    const code = generateInviteCode('TSK');
    const now = Timestamp.now();

    const invite: CompanyInvite = {
      id: inviteRef.id,
      code,
      companyId: input.companyId,
      companyName: input.companyName,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      jobTitle: input.jobTitle.trim(),
      sector: input.sector.trim() || 'Operação',
      role: input.role ?? 'worker',
      status: 'pending',
      createdByUid: input.createdByUid,
      acceptedByUid: null,
      createdAt: now,
      acceptedAt: null,
    };

    await setDoc(inviteRef, invite);

    return {
      invite,
      inviteLink: this.buildInviteLink(code),
    };
  }

  // Busca um convite pendente pelo código na coleção "invites" (sem exigir índice composto)
  static async getPendingInviteByCode(
    code: string
  ): Promise<CompanyInvite | null> {
    const normalized = code.trim().toUpperCase();
    const q = query(this.invitesCol, where('code', '==', normalized), limit(5));
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const pendingDoc = snap.docs.find((d) => {
      const data = d.data() as CompanyInvite;
      return data.status === 'pending' || !data.status;
    });

    if (!pendingDoc) return null;
    return { ...(pendingDoc.data() as CompanyInvite), id: pendingDoc.id };
  }

  // Valida um código (convite individual ou código da empresa) tratando permissões separadamente
  static async resolveInviteOrCompanyCode(code: string): Promise<{
    type: 'invite' | 'company';
    companyId: string;
    companyName: string;
    invite?: CompanyInvite;
  } | null> {
    const normalized = code.trim().toUpperCase();

    try {
      const invite = await this.getPendingInviteByCode(normalized);
      if (invite) {
        return {
          type: 'invite',
          companyId: invite.companyId,
          companyName: invite.companyName,
          invite,
        };
      }
    } catch {
      // Continua para tentar buscar pelo código da empresa caso a leitura de invites falhe
    }

    try {
      const company = await CompanyService.getCompanyByInviteCode(normalized);
      if (company) {
        return {
          type: 'company',
          companyId: company.id,
          companyName: company.companyName,
        };
      }
    } catch {
      // Ignora erro caso o usuário ainda não esteja autenticado e as regras exijam login
    }

    return null;
  }

  // Cria a conta no Firebase Auth ou reutiliza sessão caso o usuário esteja tentando concluir um vínculo anterior
  private static async authenticateForJoin(
    email: string,
    password: string
  ): Promise<{ credential: UserCredential; isNewAuthUser: boolean }> {
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { credential, isNewAuthUser: true };
    } catch (err: unknown) {
      const fbCode = (err as { code?: string })?.code;
      if (fbCode === 'auth/email-already-in-use') {
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        return { credential, isNewAuthUser: false };
      }
      throw err;
    }
  }

  // Cadastra o funcionário no Firebase Auth e o associa à empresa na coleção "users"
  static async acceptInviteAndRegister(
    input: AcceptInviteInput
  ): Promise<EmployeeMember> {
    const normalizedCode = input.code.trim().toUpperCase();

    // Tenta resolver o convite antes do login (caso a leitura pública esteja liberada)
    let resolved = await this.resolveInviteOrCompanyCode(normalizedCode);

    const candidateEmail = (
      input.email?.trim() ||
      resolved?.invite?.email ||
      ''
    )
      .trim()
      .toLowerCase();

    if (!candidateEmail) {
      throw new Error('Informe seu e-mail corporativo.');
    }

    // Autentica o usuário primeiro para garantir que request.auth != null nas regras do Firestore
    const { credential, isNewAuthUser } = await this.authenticateForJoin(
      candidateEmail,
      input.password
    );

    // Se as regras do Firestore exigiam usuário autenticado para ler invites/companies, busca novamente agora logado
    if (!resolved) {
      resolved = await this.resolveInviteOrCompanyCode(normalizedCode);
    }

    if (!resolved) {
      if (isNewAuthUser) {
        await credential.user.delete().catch(() => {});
      }
      throw new Error('Código de convite inválido ou já utilizado.');
    }

    const pendingInvite = resolved.invite;
    const finalName = (input.name?.trim() || pendingInvite?.name || '').trim();
    const finalEmail = (
      input.email?.trim() ||
      pendingInvite?.email ||
      candidateEmail
    )
      .trim()
      .toLowerCase();
    const finalJobTitle = (
      input.jobTitle?.trim() ||
      pendingInvite?.jobTitle ||
      'Colaborador'
    ).trim();
    const finalSector = (
      input.sector?.trim() ||
      pendingInvite?.sector ||
      'Operação'
    ).trim();
    const finalRole: UserRole = pendingInvite?.role ?? 'worker';

    if (!finalName) {
      throw new Error('Informe seu nome completo.');
    }

    await updateProfile(credential.user, {
      displayName: finalName,
    });

    const now = Timestamp.now();
    const userRef = doc(this.usersCol, credential.user.uid);
    const randomCode = Math.floor(1000 + Math.random() * 9000);

    // Documento do funcionário vinculado à empresa na coleção "users"
    const userDoc: UserDocument = {
      id: credential.user.uid,
      uid: credential.user.uid,
      companyId: resolved.companyId,
      companyName: resolved.companyName,
      name: finalName,
      email: finalEmail,
      jobTitle: finalJobTitle,
      sector: finalSector,
      role: finalRole,
      status: 'active',
      inviteId: pendingInvite?.id ?? null,
      employeeCode:
        finalRole === 'admin' ? `#ADM-${randomCode}` : `#EMP-${randomCode}`,
      pendingTasks: 0,
      completedTasks: 0,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Grava primeiro o perfil do usuário em "users/{uid}" para que o documento exista nas regras do Firestore
    await setDoc(userRef, userDoc);

    // 2. Marca o convite individual como aceito caso tenha sido usado
    if (pendingInvite) {
      try {
        const inviteRef = doc(this.invitesCol, pendingInvite.id);
        await updateDoc(inviteRef, {
          status: 'accepted',
          acceptedByUid: credential.user.uid,
          acceptedAt: now,
        });
      } catch {
        // Caso as regras do Firestore restrinjam edição na coleção invites por workers,
        // o usuário já está ativo em "users" e o convite é filtrado automaticamente.
      }
    }

    return {
      ...userDoc,
      initials: getInitials(userDoc.name),
    };
  }

  // Atualiza dados, cargo, setor, permissão (admin/worker) ou status de um funcionário
  static async updateEmployee(
    memberId: string,
    isInvite: boolean,
    updates: UpdateEmployeeInput
  ): Promise<void> {
    if (isInvite) {
      const inviteUpdates: Record<string, unknown> = { ...updates };
      await updateDoc(doc(this.invitesCol, memberId), inviteUpdates);
      return;
    }

    await updateDoc(doc(this.usersCol, memberId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  // Remove um convite pendente ou desvincula um funcionário da coleção
  static async removeMember(
    memberId: string,
    isInvite: boolean
  ): Promise<void> {
    if (isInvite) {
      await deleteDoc(doc(this.invitesCol, memberId));
      return;
    }
    await deleteDoc(doc(this.usersCol, memberId));
  }

  // Mapeia um documento de usuário ("users") para o modelo de exibição da equipe
  private static mapUserDocToMember(
    docId: string,
    data: UserDocument
  ): EmployeeMember {
    return {
      ...data,
      id: docId,
      uid: data.uid || docId,
      name: data.name || 'Colaborador',
      email: data.email || '',
      jobTitle: data.jobTitle || 'Colaborador',
      sector: data.sector || 'Geral',
      role: data.role === 'admin' ? 'admin' : 'worker',
      status: data.status === 'pending' ? 'pending' : 'active',
      employeeCode: data.employeeCode || '#EMP-0001',
      pendingTasks: Number(data.pendingTasks ?? 0),
      completedTasks: Number(data.completedTasks ?? 0),
      initials: getInitials(data.name || 'Colaborador'),
      isInvite: false,
    };
  }

  // Mapeia um documento de convite ("invites") para o modelo de exibição pendente
  private static mapInviteToMember(
    docId: string,
    invite: CompanyInvite
  ): EmployeeMember {
    return {
      id: docId,
      uid: invite.acceptedByUid ?? '',
      companyId: invite.companyId,
      companyName: invite.companyName,
      name: invite.name || 'Convidado',
      email: invite.email || '',
      jobTitle: invite.jobTitle || 'Colaborador',
      sector: invite.sector || 'Geral',
      role: invite.role === 'admin' ? 'admin' : 'worker',
      status: 'pending',
      employeeCode: `#INV-${invite.code?.split('-')[1] ?? '0000'}`,
      pendingTasks: 0,
      completedTasks: 0,
      createdAt: invite.createdAt,
      updatedAt: invite.createdAt,
      initials: getInitials(invite.name || 'Convidado'),
      isInvite: true,
      inviteCode: invite.code,
      statusMessage: `Código: ${invite.code} • Aguardando aceite de convite`,
    };
  }

  // Escuta em tempo real todos os membros vinculados à empresa (usuários + convites pendentes)
  static subscribeToCompanyMembers(
    companyId: string,
    onUpdate: (members: EmployeeMember[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    let usersList: EmployeeMember[] = [];
    let invitesList: EmployeeMember[] = [];

    const emitCombined = () => {
      const activeEmails = new Set(
        usersList.map((u) => u.email.toLowerCase()).filter(Boolean)
      );
      const pendingOnly = invitesList.filter(
        (inv) => !activeEmails.has(inv.email.toLowerCase())
      );

      const combined = [...usersList, ...pendingOnly].sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR')
      );
      onUpdate(combined);
    };

    const usersQuery = query(
      this.usersCol,
      where('companyId', '==', companyId)
    );
    // Consulta invites apenas por companyId para não exigir índice composto no Firestore
    const invitesQuery = query(
      this.invitesCol,
      where('companyId', '==', companyId)
    );

    const unsubUsers = onSnapshot(
      usersQuery,
      (snap) => {
        usersList = snap.docs.map((d) =>
          this.mapUserDocToMember(d.id, d.data() as UserDocument)
        );
        emitCombined();
      },
      (err) => onError?.(err)
    );

    const unsubInvites = onSnapshot(
      invitesQuery,
      (snap) => {
        invitesList = snap.docs
          .filter((d) => {
            const data = d.data() as CompanyInvite;
            return data.status === 'pending' || !data.status;
          })
          .map((d) => this.mapInviteToMember(d.id, d.data() as CompanyInvite));
        emitCombined();
      },
      (err) => {
        // Caso a coleção invites ainda não tenha permissão de leitura para workers, mantém os usuários ativos
        invitesList = [];
        emitCombined();
        onError?.(err);
      }
    );

    return () => {
      unsubUsers();
      unsubInvites();
    };
  }

  // Filtra funcionários por status ('all' | 'active' | 'pending') e termo de busca
  static filterMembers(
    members: EmployeeMember[],
    statusFilter: 'all' | 'active' | 'pending',
    searchQuery = ''
  ): EmployeeMember[] {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return members.filter((member) => {
      const matchesStatus =
        statusFilter === 'all' ? true : member.status === statusFilter;

      const matchesSearch =
        normalizedQuery === '' ||
        member.name.toLowerCase().includes(normalizedQuery) ||
        member.jobTitle.toLowerCase().includes(normalizedQuery) ||
        member.sector.toLowerCase().includes(normalizedQuery) ||
        member.email.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }
}
