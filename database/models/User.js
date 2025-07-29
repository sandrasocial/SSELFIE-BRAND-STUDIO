// User model with AI preferences and usage tracking
const { pool } = require('../config');

class User {
  // Create new user
  static async create(userData) {
    const { email, username, password_hash, first_name, last_name } = userData;
    
    const query = `
      INSERT INTO users (email, username, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, username, first_name, last_name, preferred_ai_model, created_at
    `;
    
    const result = await pool.query(query, [email, username, password_hash, first_name, last_name]);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Get user with current month usage
  static async findWithUsage(userId) {
    const query = `
      SELECT u.*, 
             COALESCE(mu.generations_count, 0) as current_month_usage
      FROM users u
      LEFT JOIN monthly_usage mu ON u.id = mu.user_id 
        AND mu.month_year = DATE_TRUNC('month', CURRENT_DATE)
      WHERE u.id = $1 AND u.is_active = true
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Update AI model preferences
  static async updateAIPreferences(userId, modelSettings) {
    const { preferred_ai_model, model_settings } = modelSettings;
    
    const query = `
      UPDATE users 
      SET preferred_ai_model = $2, 
          model_settings = $3, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING preferred_ai_model, model_settings
    `;
    
    const result = await pool.query(query, [userId, preferred_ai_model, JSON.stringify(model_settings)]);
    return result.rows[0];
  }

  // Check if user can generate more images this month
  static async canGenerateImage(userId) {
    const query = `
      SELECT COALESCE(generations_count, 0) as count
      FROM monthly_usage 
      WHERE user_id = $1 AND month_year = DATE_TRUNC('month', CURRENT_DATE)
    `;
    
    const result = await pool.query(query, [userId]);
    const currentUsage = result.rows[0]?.count || 0;
    
    return {
      canGenerate: currentUsage < 100,
      currentUsage,
      limit: 100,
      remaining: Math.max(0, 100 - currentUsage)
    };
  }
}

module.exports = User;