export interface Selfie {
  id: string;
  url: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface UserGallery {
  userSelfies: Selfie[];
  aiImages: Selfie[];
  total: number;
  hasMore: boolean;
}