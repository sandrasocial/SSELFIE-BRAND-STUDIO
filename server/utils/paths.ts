// Path utilities for serverless environment
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const paths = {
  root: path.resolve(__dirname, '../..'),
  server: path.resolve(__dirname, '..'),
  shared: path.resolve(__dirname, '../../shared'),
  public: path.resolve(__dirname, '../../public'),
  
  /**
   * Get the path for a user's trained model
   * @param userId - The user's ID
   * @returns Path string for the user's model (in serverless, this is typically an S3 URL or identifier)
   */
  getUserModelPath(userId: string): string {
    // In serverless environment, model paths are typically S3 URLs or Replicate version IDs
    // This returns a logical path identifier that can be used to look up the actual model
    return `models/user-${userId}`;
  },
};

export default paths;
