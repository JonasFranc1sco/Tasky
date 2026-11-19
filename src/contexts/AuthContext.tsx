import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { onlyDigits, type CompanySignupValues } from '@/constants/signup-validation';

type SignUpData = {
  name: string;
  email: string;
  password: string;
  company: CompanySignupValues;
};

type AuthContextData = {
  user: User | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }

  async function signUp({ name, email, password, company }: SignUpData) {
    const { user: newUser } = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );

    try {
      await updateProfile(newUser, { displayName: name.trim() });

      const companyRef = doc(collection(db, 'companies'));
      const userRef = doc(db, 'users', newUser.uid);
      const batch = writeBatch(db);

      batch.set(companyRef, {
        name: company.companyName.trim(),
        legalName: company.legalName.trim(),
        taxId: onlyDigits(company.taxId),
        phone: onlyDigits(company.phone),
        industry: company.industry.trim(),
        ownerUid: newUser.uid,
        createdAt: serverTimestamp(),
      });

      batch.set(userRef, {
        uid: newUser.uid,
        name: name.trim(),
        email: newUser.email,
        role: 'gestor',
        companyId: companyRef.id,
        active: true,
        createdAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      await newUser.delete();
      throw error;
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email.trim());
  }

  return (
    <AuthContext.Provider
      value={{ user, initializing, signIn, signUp, signOut, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return context;
}