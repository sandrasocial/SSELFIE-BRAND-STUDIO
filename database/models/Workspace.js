// Workspace model for project organization
const { pool } = require('../config');

class Workspace {
  // Create new workspace
  static async create(workspaceData) {
    const { user_id, name, description, color = '#6366f1', is_default = false } = workspaceData;
    
    const query = `
      INSERT INTO workspaces (user_id, name, description, color, is_default)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [user_id, name, description, color, is_default]);
    return result.rows[0];
  }

  // Get user's workspaces
  static async getUserWorkspaces(userId) {
    const query = `
      SELECT w.*, 
             COUNT(p.id) as project_count
      FROM workspaces w
      LEFT JOIN projects p ON w.id = p.workspace_id AND p.is_archived = false
      WHERE w.user_id = $1 AND w.is_archived = false
      GROUP BY w.id
      ORDER BY w.is_default DESC, w.created_at ASC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Get workspace with projects
  static async getWithProjects(workspaceId, userId) {
    const workspaceQuery = `
      SELECT * FROM workspaces 
      WHERE id = $1 AND user_id = $2 AND is_archived = false
    `;
    
    const projectsQuery = `
      SELECT p.*, 
             COUNT(ic.id) as collection_count
      FROM projects p
      LEFT JOIN image_collections ic ON p.id = ic.project_id
      WHERE p.workspace_id = $1 AND p.user_id = $2 AND p.is_archived = false
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    
    const [workspaceResult, projectsResult] = await Promise.all([
      pool.query(workspaceQuery, [workspaceId, userId]),
      pool.query(projectsQuery, [workspaceId, userId])
    ]);
    
    if (workspaceResult.rows.length === 0) return null;
    
    return {
      ...workspaceResult.rows[0],
      projects: projectsResult.rows
    };
  }

  // Update workspace
  static async update(workspaceId, userId, updateData) {
    const { name, description, color } = updateData;
    
    const query = `
      UPDATE workspaces 
      SET name = $3, 
          description = $4, 
          color = $5, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [workspaceId, userId, name, description, color]);
    return result.rows[0];
  }

  // Set as default workspace
  static async setDefault(workspaceId, userId) {
    // First, unset all default workspaces for user
    await pool.query(
      'UPDATE workspaces SET is_default = false WHERE user_id = $1',
      [userId]
    );
    
    // Then set the selected one as default
    const query = `
      UPDATE workspaces 
      SET is_default = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [workspaceId, userId]);
    return result.rows[0];
  }

  // Archive workspace (soft delete)
  static async archive(workspaceId, userId) {
    const query = `
      UPDATE workspaces 
      SET is_archived = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2 AND is_default = false
      RETURNING *
    `;
    
    const result = await pool.query(query, [workspaceId, userId]);
    return result.rows[0];
  }

  // Get or create default workspace for user
  static async getOrCreateDefault(userId) {
    // Check if user has a default workspace
    let query = `
      SELECT * FROM workspaces 
      WHERE user_id = $1 AND is_default = true AND is_archived = false
    `;
    
    let result = await pool.query(query, [userId]);
    
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    
    // Create default workspace if none exists
    return await this.create({
      user_id: userId,
      name: 'My Workspace',
      description: 'Default workspace for your SSELFIE projects',
      is_default: true
    });
  }

  // Find by ID
  static async findById(workspaceId, userId) {
    const query = `
      SELECT * FROM workspaces 
      WHERE id = $1 AND user_id = $2 AND is_archived = false
    `;
    
    const result = await pool.query(query, [workspaceId, userId]);
    return result.rows[0];
  }
}

module.exports = Workspace;