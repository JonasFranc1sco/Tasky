import { storage } from '@/config/firebase';
import type { ImagePickerAsset } from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Platform } from 'react-native';

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function readNativeImage(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.responseType = 'blob';
    request.onload = () => {
      if (request.response) {
        resolve(request.response as Blob);
      } else {
        reject(new Error('Não foi possível ler a imagem selecionada.'));
      }
    };
    request.onerror = () =>
      reject(new Error('Não foi possível ler a imagem selecionada.'));
    request.open('GET', uri, true);
    request.send(null);
  });
}

export async function uploadProfilePhoto(
  uid: string,
  asset: ImagePickerAsset
): Promise<string> {
  const contentType = asset.mimeType?.toLowerCase() || 'image/jpeg';
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new Error('Escolha uma imagem JPG, PNG ou WEBP.');
  }

  if (asset.fileSize && asset.fileSize > MAX_PHOTO_SIZE) {
    throw new Error('A imagem deve ter no máximo 5 MB.');
  }

  const blob =
    Platform.OS === 'web' ? asset.file : await readNativeImage(asset.uri);

  if (!blob) {
    throw new Error('Não foi possível acessar o arquivo selecionado.');
  }

  if (blob.size > MAX_PHOTO_SIZE) {
    (blob as Blob & { close?: () => void }).close?.();
    throw new Error('A imagem deve ter no máximo 5 MB.');
  }

  try {
    const photoRef = ref(storage, `profilePhotos/${uid}/avatar`);
    const uploaded = await uploadBytes(photoRef, blob, { contentType });
    return await getDownloadURL(uploaded.ref);
  } finally {
    (blob as Blob & { close?: () => void }).close?.();
  }
}
