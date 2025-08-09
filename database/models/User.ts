import { pool } from '../config';

export interface User {
  id: string;
  email: string;
  username: string;
  created_at: Date;
  updated_at: Date;
  preferences?: Record<string, any>;
}

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (email, username, preferences)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user.email, user.username, user.preferences]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<User>): Promise<User> {
    const setClause = Object.keys(updates)
      .map((key, i) => `${key} = $${i + 2}`)
      .join(', ');
    
    const result = await pool.query(
      `UPDATE users 
       SET ${setClause}, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, ...Object.values(updates)]
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return !!result.rows[0];
  }
}