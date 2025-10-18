export interface FeedLayoutSlot {
  position: number;
  imageId: number | string | null;
}

export interface FeedLayoutRecord {
  userId: string;
  layout: FeedLayoutSlot[];
  updatedAt: Date;
}

export interface SaveFeedLayoutRequest {
  layout: FeedLayoutSlot[];
}

export interface GetFeedLayoutResponse {
  layout: FeedLayoutSlot[];
  updatedAt: string;
}

