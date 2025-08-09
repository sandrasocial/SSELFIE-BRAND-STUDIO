import { pool } from '../config';

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export class WorkspaceModel {
  static async create(workspace: Omit<Workspace, 'id' | 'created_at' | 'updated_at'>): Promise<Workspace> {
    const result = await pool.query(
      `INSERT INTO workspaces (user_id, name, description, settings)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [workspace.user_id, workspace.name, workspace.description, workspace.settings]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<Workspace | null> {
    const result = await pool.query(
      'SELECT * FROM workspaces WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string): Promise<Workspace[]> {
    const result = await pool.query(
      'SELECT * FROM workspaces WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async update(id: string, updates: Partial<Workspace>): Promise<Workspace> {
    const setClause = Object.keys(updates)
      .map((key, i) => `${key} = $${i + 2}`)
      .join(', ');
    
    const result = await pool.query(
      `UPDATE workspaces 
       SET ${setClause}, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, ...Object.values(updates)]
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM workspaces WHERE id = $1 RETURNING id',
      [id]
    );
    return !!result.rows[0];
  }
}