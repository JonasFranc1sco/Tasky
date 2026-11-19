import { useAuth } from '@/hooks/auth-context';
import { uploadProfilePhoto } from '@/services/profile-photo-service';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

export function useProfilePhoto() {
  const { profile, updateProfilePhoto } = useAuth();
  const userId = profile?.uid;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAndUploadPhoto = useCallback(async () => {
    if (!userId) {
      setError('Não foi possível identificar o usuário atual.');
      return;
    }

    setError(null);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      setUploading(true);
      const photoURL = await uploadProfilePhoto(userId, result.assets[0]);
      await updateProfilePhoto(photoURL);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível atualizar a foto de perfil.'
      );
    } finally {
      setUploading(false);
    }
  }, [updateProfilePhoto, userId]);

  return { uploading, error, pickAndUploadPhoto };
}
