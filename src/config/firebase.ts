import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import {
  getAuth,
  initializeAuth,
  type Auth,
  type Persistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Configuração do projeto Firebase via variáveis de ambiente do Expo
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Evita múltiplas inicializações durante Fast Refresh
const isNewApp = getApps().length === 0;
export const app = isNewApp ? initializeApp(firebaseConfig) : getApp();

// Configura a autenticação com suporte a persistência no mobile e na web
function createAuth(): Auth {
  if (!isNewApp) {
    return getAuth(app);
  }

  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  const getRNPersistence = (
    firebaseAuth as unknown as {
      getReactNativePersistence?: (storage: typeof AsyncStorage) => Persistence;
    }
  ).getReactNativePersistence;

  if (getRNPersistence) {
    return initializeAuth(app, {
      persistence: getRNPersistence(AsyncStorage),
    });
  }

  return getAuth(app);
}

export const auth = createAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);
