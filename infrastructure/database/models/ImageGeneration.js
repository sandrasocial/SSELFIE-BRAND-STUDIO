// Image generation model with monthly limit tracking
const { pool } = require('../config');

class ImageGeneration {
  // Create new image generation record
  static async create(generationData) {
    const { 
      user_id, 
      prompt, 
      ai_model, 
      model_settings = {},
      generation_month = new Date()
    } = generationData;

    const query = `
      INSERT INTO image_generations (user_id, prompt, ai_model, model_settings, generation_month, status)
      VALUES ($1, $2, $3, $4, DATE_TRUNC('month', $5), 'generating')
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      user_id, 
      prompt, 
      ai_model, 
      JSON.stringify(model_settings),
      generation_month
    ]);
    
    return result.rows[0];
  }

  // Update generation with completed image
  static async complete(generationId, imageData) {
    const { image_url, thumbnail_url, generation_time_ms } = imageData;
    
    const query = `
      UPDATE image_generations 
      SET image_url = $2, 
          thumbnail_url = $3, 
          generation_time_ms = $4,
          status = 'completed'
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [generationId, image_url, thumbnail_url, generation_time_ms]);
    return result.rows[0];
  }

  // Mark generation as failed
  static async markFailed(generationId, error = null) {
    const query = `
      UPDATE image_generations 
      SET status = 'failed'
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [generationId]);
    return result.rows[0];
  }

  // Get user's generations for current month
  static async getUserMonthlyGenerations(userId, month = new Date()) {
    const query = `
      SELECT * FROM image_generations 
      WHERE user_id = $1 
        AND generation_month = DATE_TRUNC('month', $2)
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId, month]);
    return result.rows;
  }

  // Get user's recent generations
  static async getUserRecentGenerations(userId, limit = 20) {
    const query = `
      SELECT * FROM image_generations 
      WHERE user_id = $1 AND status = 'completed'
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  // Get generation by ID
  static async findById(generationId) {
    const query = 'SELECT * FROM image_generations WHERE id = $1';
    const result = await pool.query(query, [generationId]);
    return result.rows[0];
  }

  // Get monthly usage stats
  static async getMonthlyStats(userId, month = new Date()) {
    const query = `
      SELECT 
        COUNT(*) as total_generations,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_generations,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_generations,
        AVG(generation_time_ms) as avg_generation_time
      FROM image_generations 
      WHERE user_id = $1 
        AND generation_month = DATE_TRUNC('month', $2)
    `;
    
    const result = await pool.query(query, [userId, month]);
    return result.rows[0];
  }

  // Check if user has reached monthly limit
  static async checkMonthlyLimit(userId, month = new Date()) {
    const query = `
      SELECT COUNT(*) as count
      FROM image_generations 
      WHERE user_id = $1 
        AND generation_month = DATE_TRUNC('month', $2)
    `;
    
    const result = await pool.query(query, [userId, month]);
    const currentCount = parseInt(result.rows[0].count);
    
    return {
      hasReachedLimit: currentCount >= 100,
      currentCount,
      limit: 100,
      remaining: Math.max(0, 100 - currentCount)
    };
  }
}

module.exports = ImageGeneration;