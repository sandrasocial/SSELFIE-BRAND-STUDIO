import { pool } from '../config';

export interface ImageGeneration {
  id: string;
  user_id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_url?: string;
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, any>;
}

export class ImageGenerationModel {
  static async create(data: Omit<ImageGeneration, 'id' | 'created_at' | 'updated_at'>): Promise<ImageGeneration> {
    const result = await pool.query(
      `INSERT INTO image_generations (user_id, prompt, status, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.user_id, data.prompt, data.status, data.metadata]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<ImageGeneration | null> {
    const result = await pool.query(
      'SELECT * FROM image_generations WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string): Promise<ImageGeneration[]> {
    const result = await pool.query(
      'SELECT * FROM image_generations WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async updateStatus(id: string, status: ImageGeneration['status'], resultUrl?: string): Promise<ImageGeneration> {
    const result = await pool.query(
      `UPDATE image_generations 
       SET status = $2, result_url = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, status, resultUrl]
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM image_generations WHERE id = $1 RETURNING id',
      [id]
    );
    return !!result.rows[0];
  }
}