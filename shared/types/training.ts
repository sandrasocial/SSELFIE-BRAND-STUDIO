/**
 * Training System Types for Maya-Only Architecture
 * Model training, LoRA weights, and training pipeline types
 */

import { MayaImage } from './images.js';

// === Core Training Types ===

export interface TrainingSession {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: TrainingStatus;
  type: TrainingType;
  config: TrainingConfig;
  dataset: TrainingDataset;
  model: TrainingModel;
  progress: TrainingProgress;
  results?: TrainingResults;
  error?: TrainingError;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletionTime?: Date;
}

export type TrainingStatus = 
  | 'preparing'      // Preparing dataset and configuration
  | 'queued'        // Waiting in training queue
  | 'starting'      // Initializing training process
  | 'training'      // Active training
  | 'validating'    // Running validation
  | 'processing'    // Post-processing results
  | 'completed'     // Successfully completed
  | 'failed'        // Training failed
  | 'cancelled'     // Manually cancelled
  | 'paused';       // Temporarily paused

export type TrainingType = 
  | 'initial'       // First-time user training
  | 'retrain'       // Full model retraining
  | 'fine_tune'     // Fine-tuning existing model
  | 'style_adapt'   // Style adaptation training
  | 'concept_learn'; // Learning new concepts

// === Training Configuration ===

export interface TrainingConfig {
  modelType: ModelType;
  baseModel: string;
  resolution: ImageResolution;
  batchSize: number;
  learningRate: number;
  epochs: number;
  steps: number;
  validationSplit: number;
  augmentation: AugmentationConfig;
  optimizer: OptimizerConfig;
  scheduler: SchedulerConfig;
  lora?: LoRAConfig;
  parameters: TrainingParameters;
}

export type ModelType = 
  | 'flux-standard'
  | 'flux-lora'
  | 'flux-packaged'
  | 'sdxl-lora'
  | 'sd15-lora';

export type ImageResolution = 
  | '512x512'
  | '768x768' 
  | '1024x1024'
  | '1024x1536'
  | '1536x1024';

export interface AugmentationConfig {
  enabled: boolean;
  rotation: boolean;
  flipping: boolean;
  colorJitter: boolean;
  brightness: [number, number];
  contrast: [number, number];
  saturation: [number, number];
  cropScale: [number, number];
}

export interface OptimizerConfig {
  type: 'adam' | 'adamw' | 'sgd' | 'adafactor';
  beta1: number;
  beta2: number;
  weightDecay: number;
  eps: number;
}

export interface SchedulerConfig {
  type: 'cosine' | 'linear' | 'polynomial' | 'constant';
  warmupSteps: number;
  numCycles?: number;
  power?: number;
}

export interface LoRAConfig {
  rank: number;
  alpha: number;
  dropout: number;
  targetModules: string[];
  initLora?: boolean;
}

export interface TrainingParameters {
  triggerWord: string;
  classWord: string;
  instancePrompt: string;
  classPrompt?: string;
  priorPreservation: boolean;
  gradientAccumulation: number;
  mixedPrecision: boolean;
  memoryEfficient: boolean;
  customParameters?: Record<string, unknown>;
}

// === Training Dataset ===

export interface TrainingDataset {
  id: string;
  name: string;
  images: TrainingImage[];
  validation?: TrainingImage[];
  statistics: DatasetStatistics;
  preprocessing: PreprocessingConfig;
  quality: DatasetQuality;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingImage extends MayaImage {
  trainingData: {
    caption?: string;
    tags: string[];
    weight: number; // Importance weight for training
    category: string;
    pose?: PoseAnnotation;
    face?: FaceAnnotation;
    quality: QualityAssessment;
    preprocessing: PreprocessingResult;
  };
}

export interface PoseAnnotation {
  keypoints: Keypoint[];
  pose: string; // 'frontal', 'profile', 'three-quarter', etc.
  confidence: number;
}

export interface FaceAnnotation {
  boundingBox: BoundingBox;
  landmarks: FaceLandmark[];
  angle: FaceAngle;
  expression: string;
  confidence: number;
}

export interface Keypoint {
  x: number;
  y: number;
  confidence: number;
  label: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceLandmark {
  x: number;
  y: number;
  label: string;
}

export interface FaceAngle {
  pitch: number;
  yaw: number;
  roll: number;
}

export interface QualityAssessment {
  overall: number; // 0-1 score
  sharpness: number;
  lighting: number;
  composition: number;
  faceQuality?: number;
  issues: string[];
  recommended: boolean;
}

export interface PreprocessingResult {
  cropped: boolean;
  resized: boolean;
  normalized: boolean;
  augmented?: string[];
  originalSize: { width: number; height: number };
  processedSize: { width: number; height: number };
}

export interface DatasetStatistics {
  totalImages: number;
  validImages: number;
  rejectedImages: number;
  averageQuality: number;
  distribution: {
    poses: Record<string, number>;
    expressions: Record<string, number>;
    lighting: Record<string, number>;
    categories: Record<string, number>;
  };
  diversity: DiversityMetrics;
}

export interface DiversityMetrics {
  poseVariance: number;
  lightingVariance: number;
  compositionVariance: number;
  colorVariance: number;
  score: number; // Overall diversity score 0-1
}

export interface PreprocessingConfig {
  autoResize: boolean;
  targetResolution: ImageResolution;
  faceCrop: boolean;
  centerCrop: boolean;
  smartCrop: boolean;
  deduplication: boolean;
  qualityFiltering: boolean;
  minQualityScore: number;
}

export interface DatasetQuality {
  overall: QualityLevel;
  issues: QualityIssue[];
  recommendations: string[];
  readyForTraining: boolean;
  estimatedPerformance: number; // Expected model quality 0-1
}

export type QualityLevel = 'poor' | 'fair' | 'good' | 'excellent';

export interface QualityIssue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedImages: string[];
  solution?: string;
}

// === Training Model ===

export interface TrainingModel {
  id: string;
  name: string;
  type: ModelType;
  baseModel: string;
  version: string;
  architecture: ModelArchitecture;
  weights: ModelWeights;
  metadata: ModelMetadata;
  performance: ModelPerformance;
  deployment: ModelDeployment;
}

export interface ModelArchitecture {
  layers: number;
  parameters: number;
  inputSize: [number, number];
  outputChannels: number;
  features: string[];
}

export interface ModelWeights {
  mainWeights: WeightFile;
  loraWeights?: WeightFile;
  textEncoder?: WeightFile;
  vae?: WeightFile;
  totalSize: number;
  checksum: string;
}

export interface WeightFile {
  filename: string;
  url: string;
  size: number;
  format: 'safetensors' | 'ckpt' | 'bin';
  checksum: string;
  uploadedAt: Date;
}

export interface ModelMetadata {
  triggerWord: string;
  classWord: string;
  trainingImages: number;
  trainingSteps: number;
  learningRate: number;
  trainedAt: Date;
  trainingDuration: number; // minutes
  tags: string[];
  description?: string;
}

export interface ModelPerformance {
  validation: ValidationMetrics;
  benchmarks: BenchmarkResult[];
  qualityScores: QualityScores;
  generationSpeed: number; // images per minute
  memoryUsage: number; // GB
}

export interface ValidationMetrics {
  loss: number;
  accuracy: number;
  fid: number; // Fréchet Inception Distance
  is: number;  // Inception Score
  lpips: number; // Learned Perceptual Image Patch Similarity
}

export interface BenchmarkResult {
  testName: string;
  score: number;
  description: string;
  runAt: Date;
}

export interface QualityScores {
  photorealism: number;
  identity: number;
  diversity: number;
  aesthetic: number;
  overall: number;
}

export interface ModelDeployment {
  status: 'pending' | 'deploying' | 'active' | 'inactive' | 'failed';
  endpoint?: string;
  replicas: number;
  resources: ResourceAllocation;
  health: HealthStatus;
  deployedAt?: Date;
}

export interface ResourceAllocation {
  cpu: string;
  memory: string;
  gpu?: string;
  storage: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  uptime: number; // percentage
  responseTime: number; // ms
}

// === Training Progress ===

export interface TrainingProgress {
  currentStep: number;
  totalSteps: number;
  currentEpoch: number;
  totalEpochs: number;
  percentage: number;
  timeElapsed: number; // seconds
  timeRemaining: number; // seconds
  currentLoss: number;
  averageLoss: number;
  learningRate: number;
  throughput: number; // samples per second
  memoryUsage: number; // percentage
  gpuUtilization: number; // percentage
  phases: TrainingPhase[];
  logs: TrainingLog[];
}

export interface TrainingPhase {
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration: number;
  actualDuration?: number;
}

export interface TrainingLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  metrics?: Record<string, number>;
}

// === Training Results ===

export interface TrainingResults {
  model: TrainingModel;
  performance: ModelPerformance;
  sampleImages: string[]; // Generated sample image URLs
  comparison: ComparisonResults;
  recommendations: string[];
  nextSteps: string[];
  artifacts: TrainingArtifact[];
}

export interface ComparisonResults {
  beforeAfter: BeforeAfterComparison[];
  benchmarkComparison: BenchmarkComparison;
  qualityImprovement: QualityImprovement;
}

export interface BeforeAfterComparison {
  prompt: string;
  beforeImage: string;
  afterImage: string;
  improvementScore: number;
  notes?: string;
}

export interface BenchmarkComparison {
  previousModel?: string;
  currentModel: string;
  improvements: Record<string, number>;
  regressions: Record<string, number>;
}

export interface QualityImprovement {
  photorealism: number;
  identity: number;
  diversity: number;
  overall: number;
}

export interface TrainingArtifact {
  type: 'checkpoint' | 'log' | 'config' | 'sample' | 'weight';
  filename: string;
  url: string;
  size: number;
  description?: string;
  createdAt: Date;
}

// === Training Error Handling ===

export interface TrainingError {
  code: TrainingErrorCode;
  message: string;
  details?: Record<string, unknown>;
  phase?: string;
  step?: number;
  recoverable: boolean;
  suggestions: string[];
  timestamp: Date;
}

export type TrainingErrorCode =
  | 'INSUFFICIENT_DATA'
  | 'POOR_DATA_QUALITY'
  | 'INVALID_CONFIG'
  | 'RESOURCE_EXHAUSTED'
  | 'GPU_OUT_OF_MEMORY'
  | 'DISK_SPACE_FULL'
  | 'NETWORK_ERROR'
  | 'MODEL_CORRUPTION'
  | 'VALIDATION_FAILED'
  | 'TIMEOUT'
  | 'USER_CANCELLED'
  | 'SYSTEM_ERROR';

// === API Types ===

export interface StartTrainingRequest {
  name: string;
  description?: string;
  type: TrainingType;
  config: Partial<TrainingConfig>;
  datasetId: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface StartTrainingResponse {
  sessionId: string;
  estimatedDuration: number;
  queuePosition: number;
  estimatedStartTime: Date;
}

export interface TrainingStatusResponse {
  session: TrainingSession;
  progress: TrainingProgress;
  logs: TrainingLog[];
  nextUpdate?: Date;
}

export interface CancelTrainingRequest {
  sessionId: string;
  reason?: string;
}

export interface RetrainModelRequest {
  previousSessionId?: string;
  datasetId: string;
  config?: Partial<TrainingConfig>;
  keepWeights?: boolean;
}

// === Hook Types ===

export interface UseTrainingReturn {
  session: TrainingSession | null;
  progress: TrainingProgress | null;
  isLoading: boolean;
  error: TrainingError | null;
  startTraining: (request: StartTrainingRequest) => Promise<StartTrainingResponse>;
  cancelTraining: () => Promise<void>;
  retrain: (request: RetrainModelRequest) => Promise<StartTrainingResponse>;
  refreshStatus: () => Promise<void>;
}

export interface UseTrainingHistoryReturn {
  sessions: TrainingSession[];
  isLoading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  deleteSession: (id: string) => Promise<void>;
}

export interface UseDatasetReturn {
  dataset: TrainingDataset | null;
  isLoading: boolean;
  error: string | null;
  uploadImages: (files: File[]) => Promise<void>;
  removeImages: (imageIds: string[]) => Promise<void>;
  updateImageAnnotation: (imageId: string, annotation: Partial<TrainingImage['trainingData']>) => Promise<void>;
  processDataset: () => Promise<void>;
  validateDataset: () => Promise<DatasetQuality>;
}

// === Training Queue ===

export interface TrainingQueue {
  position: number;
  estimatedWaitTime: number; // minutes
  queueLength: number;
  averageTrainingTime: number; // minutes
  capacity: QueueCapacity;
}

export interface QueueCapacity {
  total: number;
  available: number;
  inUse: number;
  reserved: number;
}

// === Training Analytics ===

export interface TrainingAnalytics {
  userId: string;
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  totalTrainingTime: number; // minutes
  averageTrainingTime: number;
  bestModelPerformance: ModelPerformance;
  trainingHistory: TrainingHistoryEntry[];
  resourceUsage: ResourceUsageStats;
}

export interface TrainingHistoryEntry {
  sessionId: string;
  date: Date;
  duration: number;
  performance: number;
  status: TrainingStatus;
}

export interface ResourceUsageStats {
  totalGpuHours: number;
  totalComputeUnits: number;
  storageUsed: number; // GB
  costEstimate: number;
  period: {
    start: Date;
    end: Date;
  };
}