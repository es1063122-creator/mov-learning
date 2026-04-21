import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { VideoItem, CreateVideoData } from '@/types/video';

const VIDEOS_COLLECTION = 'videos';

function toVideoItem(id: string, data: Record<string, unknown>): VideoItem {
  return {
    id,
    title: (data.title as string) ?? '',
    description: (data.description as string) ?? '',
    category: (data.category as string) ?? '',
    videoUrl: (data.videoUrl as string) ?? '',
    storagePath: (data.storagePath as string) ?? '',
    fileName: (data.fileName as string) ?? '',
    fileSize: (data.fileSize as number) ?? 0,
    contentType: (data.contentType as string) ?? '',
    thumbnailUrl: (data.thumbnailUrl as string) ?? '',
    isPublished: (data.isPublished as boolean) ?? false,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string) ?? '',
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt as string) ?? '',
  };
}

/** 영상 등록 */
export async function createVideo(data: CreateVideoData): Promise<string> {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, VIDEOS_COLLECTION), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

/** 공개된 영상 목록 조회 (최신순) */
export async function getPublishedVideos(): Promise<VideoItem[]> {
  const q = query(
    collection(db, VIDEOS_COLLECTION),
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toVideoItem(d.id, d.data()));
}

/** 전체 영상 목록 조회 - 관리자용 (최신순) */
export async function getAllVideos(): Promise<VideoItem[]> {
  const q = query(
    collection(db, VIDEOS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toVideoItem(d.id, d.data()));
}

/** 단일 영상 조회 */
export async function getVideoById(id: string): Promise<VideoItem | null> {
  const docRef = doc(db, VIDEOS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return toVideoItem(snapshot.id, snapshot.data());
}

/** 공개여부 변경 */
export async function updateVideoPublish(
  id: string,
  isPublished: boolean
): Promise<void> {
  const docRef = doc(db, VIDEOS_COLLECTION, id);
  await updateDoc(docRef, { isPublished, updatedAt: Timestamp.now() });
}

/** Firestore 문서 삭제 */
export async function deleteVideoDoc(id: string): Promise<void> {
  const docRef = doc(db, VIDEOS_COLLECTION, id);
  await deleteDoc(docRef);
}
