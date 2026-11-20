import { storage } from '@/config/firebase';
import type { ImagePickerAsset } from 'expo-image-picker';
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type StorageReference,
} from 'firebase/storage';
import { Platform } from 'react-native';

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 60_000;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

type UploadProgressHandler = (progress: number) => void;

function uploadImage(
  photoRef: StorageReference,
  blob: Blob,
  contentType: string,
  onProgress?: UploadProgressHandler
): Promise<void> {
  const task = uploadBytesResumable(photoRef, blob, { contentType });

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          'O envio demorou mais de 60 segundos. Verifique sua conexão e a configuração do Firebase Storage.'
        )
      );
      task.cancel();
    }, UPLOAD_TIMEOUT_MS);

    task.on(
      'state_changed',
      (snapshot) => {
        const progress =
          snapshot.totalBytes === 0
            ? 0
            : Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(progress);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
      () => {
        clearTimeout(timeoutId);
        onProgress?.(100);
        resolve();
      }
    );
  });
}

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
  asset: ImagePickerAsset,
  onProgress?: UploadProgressHandler
): Promise<string> {
  const contentType = (
    asset.mimeType ??
    (Platform.OS === 'web' ? asset.file?.type : undefined) ??
    'image/jpeg'
  ).toLowerCase();
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
    await uploadImage(photoRef, blob, contentType, onProgress);
    return await getDownloadURL(photoRef);
  } finally {
    (blob as Blob & { close?: () => void }).close?.();
  }
}
