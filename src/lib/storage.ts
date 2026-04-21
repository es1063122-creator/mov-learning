import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './firebase';

function buildStoragePath(type: 'videos' | 'thumbnails', fileName: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const ts = now.getTime();
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${type}/${yyyy}/${mm}/${ts}_${safe}`;
}

export interface UploadProgress {
  percent: number;
  bytesTransferred: number;
  totalBytes: number;
}

/**
 * Firebase Storage에 영상 파일 업로드
 * onProgress 콜백으로 진행률 수신
 * 완료 후 { url, storagePath } 반환
 */
export function uploadVideoFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string; storagePath: string }> {
  return new Promise((resolve, reject) => {
    const storagePath = buildStoragePath('videos', file.name);
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          onProgress({
            percent: Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            ),
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
          });
        }
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ url, storagePath });
      }
    );
  });
}

/**
 * Firebase Storage에 썸네일 이미지 업로드
 */
export function uploadThumbnailFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string; storagePath: string }> {
  return new Promise((resolve, reject) => {
    const storagePath = buildStoragePath('thumbnails', file.name);
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          onProgress({
            percent: Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            ),
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
          });
        }
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ url, storagePath });
      }
    );
  });
}

/**
 * Firebase Storage에서 파일 삭제
 */
export async function deleteStorageFile(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
