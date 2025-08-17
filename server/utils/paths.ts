import path from 'path';

// Environment variables are loaded by the main app

export const paths = {
  // Base path for model storage (default to 'models' if not set)
  modelBase: process.env.MODEL_BASE_PATH || 'models',
  
  // Get the full model path for a user
  getUserModelPath: (userId: string, suffix = 'selfie-lora') => 
    path.join(process.env.MODEL_BASE_PATH || 'models', `${userId}-${suffix}`),
  
  // Get the training data path for a user
  getTrainingDataPath: (userId: string) => 
    path.join(process.env.MODEL_BASE_PATH || 'models', userId, 'training-data'),
  
  // Get the validation data path for a user
  getValidationPath: (userId: string) => 
    path.join(process.env.MODEL_BASE_PATH || 'models', userId, 'validation'),
  
  // Get the model checkpoint path for a user
  getCheckpointPath: (userId: string) => 
    path.join(process.env.MODEL_BASE_PATH || 'models', userId, 'checkpoints'),
    
  // Get temporary upload path
  getTempUploadPath: () => 
    path.join(process.env.TEMP_PATH || 'tmp', 'uploads'),
};

// Utility functions to ensure paths are absolute when needed
export const getAbsolutePath = (relativePath: string): string => path.resolve(relativePath);

export default paths;