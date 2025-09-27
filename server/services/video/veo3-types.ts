export interface VeoVideoScene {
  sceneId: string;
  audio?: string;
  duration?: number;
  prompt?: string;
}

export interface VeoVideoInput {
  scenes: VeoVideoScene[];
  userId: string;
  title?: string;
  loraModel?: string;
}

export interface VeoVideoResult {
  jobId: string;
  scenes: {
    sceneId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    url?: string;
    error?: string;
  }[];
  done: boolean;
  metadata?: {
    progressPercent: number;
    estimatedTime: number;
  };
  error?: string;
}

export interface VeoStatusResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  result?: VeoVideoResult;
}