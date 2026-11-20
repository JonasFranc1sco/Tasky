import { auth, db } from '@/config/firebase';
import {
  onlyDigits,
  type AdminSignupValues,
  type CompanySignupValues,
} from '@/constants/signup-validation';
import {
  generateInviteCode,
  getInitials,
  type Company,
  type EmployeeMember,
  type UserDocument,
} from '@/types/company';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

export class CompanyService {
  private static companiesCol = collection(db, 'companies');
  private static usersCol = collection(db, 'users');

  // Cadastra a empresa e o administrador vinculado a ela no Firebase Auth e Firestore
  static async registerCompanyWithAdmin(
    companyInput: CompanySignupValues,
    adminInput: AdminSignupValues
  ): Promise<{ company: Company; adminProfile: EmployeeMember }> {
    const cleanTaxId = onlyDigits(companyInput.taxId);
    const normalizedEmail = adminInput.adminEmail.trim().toLowerCase();
    const trimmedName = adminInput.adminName.trim();

    // Cria a conta de acesso do administrador no Firebase Authentication (ou recupera caso tentativa anterior tenha parado nas regras)
    let credential;
    try {
      credential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        adminInput.password
      );
    } catch (err: unknown) {
      const fbCode = (err as { code?: string })?.code;
      if (fbCode === 'auth/email-already-in-use') {
        credential = await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          adminInput.password
        );
      } else {
        throw err;
      }
    }

    await updateProfile(credential.user, {
      displayName: trimmedName,
    });

    const now = Timestamp.now();
    const companyRef = doc(this.companiesCol);
    const adminRef = doc(this.usersCol, credential.user.uid);

    // Dados do documento da coleção "companies"
    const company: Company = {
      id: companyRef.id,
      companyName: companyInput.companyName.trim(),
      legalName: companyInput.legalName.trim(),
      taxId: cleanTaxId,
      formattedTaxId: companyInput.taxId.trim(),
      phone: companyInput.phone.trim(),
      industry: companyInput.industry.trim(),
      ownerId: credential.user.uid,
      inviteCode: generateInviteCode(companyInput.companyName),
      createdAt: now,
      updatedAt: now,
    };

    // Dados do documento da coleção "users" para o administrador
    const adminDoc: UserDocument = {
      id: credential.user.uid,
      uid: credential.user.uid,
      companyId: companyRef.id,
      companyName: company.companyName,
      name: trimmedName,
      email: normalizedEmail,
      jobTitle: 'Gerente',
      sector: 'Gestão',
      role: 'admin',
      status: 'active',
      employeeCode: '#ADM-0001',
      pendingTasks: 0,
      completedTasks: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Salva primeiro o perfil do administrador em "users" e em seguida a empresa em "companies"
    await setDoc(adminRef, adminDoc);
    await setDoc(companyRef, company);

    return {
      company,
      adminProfile: {
        ...adminDoc,
        initials: getInitials(adminDoc.name),
      },
    };
  }

  // Busca os dados da empresa pelo ID do documento ou pelo campo "id"
  static async getCompanyById(companyId: string): Promise<Company | null> {
    try {
      const directSnap = await getDoc(doc(this.companiesCol, companyId));
      if (directSnap.exists()) {
        const data = directSnap.data() as Company;
        return { ...data, id: directSnap.id };
      }
    } catch {
      // Continua para tentativa alternativa
    }

    try {
      const fallbackQuery = query(
        this.companiesCol,
        where('id', '==', companyId),
        limit(1)
      );
      const fallbackSnap = await getDocs(fallbackQuery);
      if (fallbackSnap.empty) return null;

      const docSnap = fallbackSnap.docs[0];
      return { ...(docSnap.data() as Company), id: docSnap.id };
    } catch {
      return null;
    }
  }

  // Busca uma empresa pelo seu código geral de convite (inviteCode)
  static async getCompanyByInviteCode(code: string): Promise<Company | null> {
    const normalized = code.trim().toUpperCase();
    const q = query(
      this.companiesCol,
      where('inviteCode', '==', normalized),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const docSnap = snap.docs[0];
    return { ...(docSnap.data() as Company), id: docSnap.id };
  }

  // Atualiza informações cadastrais da empresa
  static async updateCompany(
    companyId: string,
    updates: Partial<
      Pick<Company, 'companyName' | 'legalName' | 'phone' | 'industry'>
    >
  ): Promise<void> {
    await updateDoc(doc(this.companiesCol, companyId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  // Gera e salva um novo código geral de convite para a empresa
  static async regenerateInviteCode(
    companyId: string,
    companyName: string
  ): Promise<string> {
    const nextCode = generateInviteCode(companyName);
    await updateDoc(doc(this.companiesCol, companyId), {
      inviteCode: nextCode,
      updatedAt: Timestamp.now(),
    });
    return nextCode;
  }
}
