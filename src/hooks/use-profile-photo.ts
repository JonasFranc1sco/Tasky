import { useAuth } from '@/hooks/auth-context';
import { uploadProfilePhoto } from '@/services/profile-photo-service';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

function getUploadErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : '';

  if (code === 'storage/bucket-not-found' || code === 'storage/no-default-bucket') {
    return 'O Firebase Storage ainda não foi configurado para este projeto.';
  }

  if (code === 'storage/unauthorized') {
    return 'O Firebase Storage recusou o envio. Verifique as regras de acesso.';
  }

  if (code === 'storage/quota-exceeded') {
    return 'O Firebase Storage está indisponível por limite de uso ou configuração de cobrança.';
  }

  if (code === 'storage/retry-limit-exceeded') {
    return 'O envio expirou. Verifique sua conexão e tente novamente.';
  }

  return error instanceof Error
    ? error.message
    : 'Não foi possível atualizar a foto de perfil.';
}

export function useProfilePhoto() {
  const { profile, updateProfilePhoto } = useAuth();
  const userId = profile?.uid;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pickAndUploadPhoto = useCallback(async () => {
    if (!userId) {
      setError('Não foi possível identificar o usuário atual.');
      return;
    }

    setError(null);
    setProgress(0);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      setUploading(true);
      const photoURL = await uploadProfilePhoto(
        userId,
        result.assets[0],
        setProgress
      );
      await updateProfilePhoto(photoURL);
    } catch (caughtError) {
      setError(getUploadErrorMessage(caughtError));
    } finally {
      setUploading(false);
    }
  }, [updateProfilePhoto, userId]);

  return { uploading, progress, error, pickAndUploadPhoto };
}
