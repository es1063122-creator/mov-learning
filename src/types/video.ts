export type VideoItem = {
  id: string;
  title: string;
  description: string;
  category?: string;
  videoUrl: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateVideoData = Omit<VideoItem, 'id'>;
