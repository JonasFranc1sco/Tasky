import { auth, db } from '@/config/firebase';
import { CompanyService } from '@/services/company-service';
import {
  getInitials,
  type Company,
  type EmployeeMember,
  type UserDocument,
  type UserRole,
} from '@/types/company';
import {
  EmailAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type UpdatePersonalInfoInput = {
  name: string;
  jobTitle: string;
  sector: string;
  companyName?: string;
};

type AuthContextValue = {
  user: User | null;
  profile: EmployeeMember | null;
  company: Company | null;
  role: UserRole | null;
  isAdmin: boolean;
  isWorker: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<EmployeeMember>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfilePhoto: (photoURL: string) => Promise<void>;
  updatePersonalInfo: (input: UpdatePersonalInfoInput) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Formata um UserDocument do Firestore para o tipo EmployeeMember da aplicação
function formatUserProfile(
  docId: string,
  data: UserDocument,
  photoURL?: string | null
): EmployeeMember {
  return {
    ...data,
    photoURL: photoURL ?? null,
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
  };
}

// Localiza o documento do usuário no Firestore protegendo contra erros de permissão em queries de fallback
async function findUserDocument(
  uid: string,
  email?: string | null
): Promise<{ id: string; data: UserDocument } | null> {
  try {
    const directSnap = await getDoc(doc(db, 'users', uid));
    if (directSnap.exists()) {
      return { id: directSnap.id, data: directSnap.data() as UserDocument };
    }
  } catch {
    // Segue para tentativas alternativas caso aplicável
  }

  try {
    const byUidQuery = query(
      collection(db, 'users'),
      where('uid', '==', uid),
      limit(1)
    );
    const byUidSnap = await getDocs(byUidQuery);
    if (!byUidSnap.empty) {
      const d = byUidSnap.docs[0];
      return { id: d.id, data: d.data() as UserDocument };
    }
  } catch {
    // Ignora erro caso as regras do Firestore bloqueiem listagem geral sem filtro de companyId
  }

  if (email) {
    try {
      const byEmailQuery = query(
        collection(db, 'users'),
        where('email', '==', email.trim().toLowerCase()),
        limit(1)
      );
      const byEmailSnap = await getDocs(byEmailQuery);
      if (!byEmailSnap.empty) {
        const d = byEmailSnap.docs[0];
        return { id: d.id, data: d.data() as UserDocument };
      }
    } catch {
      // Ignora erro caso as regras do Firestore bloqueiem busca por email sem companyId
    }
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<EmployeeMember | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitora alterações na sessão do Firebase Auth e sincroniza o perfil no Firestore
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (!firebaseUser) {
        setProfile(null);
        setCompany(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const found = await findUserDocument(
          firebaseUser.uid,
          firebaseUser.email
        );
        const targetDocId = found ? found.id : firebaseUser.uid;

        unsubProfile = onSnapshot(
          doc(db, 'users', targetDocId),
          async (snap) => {
            if (!snap.exists()) {
              setProfile(null);
              setCompany(null);
              setLoading(false);
              return;
            }

            const memberData = formatUserProfile(
              snap.id,
              snap.data() as UserDocument,
              firebaseUser.photoURL
            );
            setProfile(memberData);

            if (memberData.companyId) {
              try {
                const companyData = await CompanyService.getCompanyById(
                  memberData.companyId
                );
                setCompany(companyData);
              } catch {
                // Mantém o perfil mesmo se a leitura complementar da empresa falhar
              }
            }

            setLoading(false);
          },
          () => {
            setLoading(false);
          }
        );
      } catch {
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  // Realiza login com e-mail e senha e retorna o perfil com a função (admin ou worker)
  const signIn = async (
    email: string,
    password: string
  ): Promise<EmployeeMember> => {
    const normalizedEmail = email.trim().toLowerCase();
    const credential = await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );

    const found = await findUserDocument(
      credential.user.uid,
      credential.user.email
    );

    if (!found) {
      throw new Error('Perfil corporativo não encontrado para este usuário.');
    }

    const memberProfile = formatUserProfile(
      found.id,
      found.data,
      credential.user.photoURL
    );
    setProfile(memberProfile);

    if (memberProfile.companyId) {
      try {
        const companyData = await CompanyService.getCompanyById(
          memberProfile.companyId
        );
        setCompany(companyData);
      } catch {
        // Ignora falha complementar de leitura da empresa
      }
    }

    return memberProfile;
  };

  // Encerra a sessão ativa no Firebase Auth
  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
    setCompany(null);
  };

  // Envia o e-mail de redefinição de senha do Firebase Authentication
  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const updateProfilePhoto = useCallback(async (photoURL: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== profile?.uid) {
      throw new Error('Sessão inválida. Faça login novamente.');
    }

    await updateProfile(currentUser, { photoURL });
    setProfile((prev) => (prev ? { ...prev, photoURL } : prev));
  }, [profile?.uid]);

  // Atualiza as informações pessoais do usuário logado (e nome da empresa se for admin)
  const updatePersonalInfo = useCallback(
    async (input: UpdatePersonalInfoInput) => {
      if (!profile) {
        throw new Error('Perfil de usuário não encontrado.');
      }

      const trimmedName = input.name.trim();
      const trimmedJobTitle = input.jobTitle.trim();
      const trimmedSector = input.sector.trim() || 'Geral';
      const trimmedCompanyName = input.companyName?.trim();

      if (auth.currentUser && trimmedName) {
        await updateProfile(auth.currentUser, {
          displayName: trimmedName,
        }).catch(() => {});
      }

      const userUpdates: Record<string, unknown> = {
        name: trimmedName,
        jobTitle: trimmedJobTitle,
        sector: trimmedSector,
        updatedAt: Timestamp.now(),
      };

      if (profile.role === 'admin' && trimmedCompanyName) {
        userUpdates.companyName = trimmedCompanyName;
      }

      await updateDoc(doc(db, 'users', profile.id), userUpdates);

      if (
        profile.role === 'admin' &&
        trimmedCompanyName &&
        company?.id &&
        trimmedCompanyName !== company.companyName
      ) {
        await CompanyService.updateCompany(company.id, {
          companyName: trimmedCompanyName,
        });
        setCompany((prev) =>
          prev ? { ...prev, companyName: trimmedCompanyName } : prev
        );
      }
    },
    [company, profile]
  );

  // Reautentica o usuário atual e altera a senha de acesso no Firebase Authentication
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const currentUser = auth.currentUser;
      const userEmail = currentUser?.email || profile?.email;

      if (!currentUser || !userEmail) {
        throw new Error('Sessão inválida. Faça login novamente.');
      }

      const credential = EmailAuthProvider.credential(
        userEmail,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
    },
    [profile?.email]
  );

  const value = useMemo<AuthContextValue>(() => {
    const role = profile?.role ?? null;
    return {
      user,
      profile,
      company,
      role,
      isAdmin: role === 'admin',
      isWorker: role === 'worker',
      loading,
      signIn,
      signOut,
      resetPassword,
      updateProfilePhoto,
      updatePersonalInfo,
      changePassword,
    };
  }, [
    user,
    profile,
    company,
    loading,
    resetPassword,
    updateProfilePhoto,
    updatePersonalInfo,
    changePassword,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
