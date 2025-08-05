/**
 * DATABASE COMPATIBILITY FIX
 * Handles schema differences between agent_name (database) and agentName (code)
 */

export class DatabaseCompatibilityHelper {
  /**
   * Convert database field names to code field names
   */
  static dbToCode(dbRecord: any): any {
    if (!dbRecord) return dbRecord;
    
    const codeRecord = { ...dbRecord };
    
    // Convert snake_case to camelCase for common fields
    if (dbRecord.agent_name !== undefined) {
      codeRecord.agentName = dbRecord.agent_name;
      delete codeRecord.agent_name;
    }
    
    if (dbRecord.user_id !== undefined) {
      codeRecord.userId = dbRecord.user_id;
      delete codeRecord.user_id;
    }
    
    if (dbRecord.conversation_id !== undefined) {
      codeRecord.conversationId = dbRecord.conversation_id;
      delete codeRecord.conversation_id;
    }
    
    if (dbRecord.learning_type !== undefined) {
      codeRecord.learningType = dbRecord.learning_type;
      delete codeRecord.learning_type;
    }
    
    if (dbRecord.capability_type !== undefined) {
      codeRecord.capabilityType = dbRecord.capability_type;
      delete codeRecord.capability_type;
    }
    
    if (dbRecord.last_seen !== undefined) {
      codeRecord.lastSeen = dbRecord.last_seen;
      delete codeRecord.last_seen;
    }
    
    if (dbRecord.created_at !== undefined) {
      codeRecord.createdAt = dbRecord.created_at;
      delete codeRecord.created_at;
    }
    
    if (dbRecord.updated_at !== undefined) {
      codeRecord.updatedAt = dbRecord.updated_at;
      delete codeRecord.updated_at;
    }
    
    return codeRecord;
  }
  
  /**
   * Convert code field names to database field names
   */
  static codeToDb(codeRecord: any): any {
    if (!codeRecord) return codeRecord;
    
    const dbRecord = { ...codeRecord };
    
    // Convert camelCase to snake_case for database operations
    if (codeRecord.agentName !== undefined) {
      dbRecord.agent_name = codeRecord.agentName;
      delete dbRecord.agentName;
    }
    
    if (codeRecord.userId !== undefined) {
      dbRecord.user_id = codeRecord.userId;
      delete dbRecord.userId;
    }
    
    if (codeRecord.conversationId !== undefined) {
      dbRecord.conversation_id = codeRecord.conversationId;
      delete dbRecord.conversationId;
    }
    
    if (codeRecord.learningType !== undefined) {
      dbRecord.learning_type = codeRecord.learningType;
      delete dbRecord.learningType;
    }
    
    if (codeRecord.capabilityType !== undefined) {
      dbRecord.capability_type = codeRecord.capabilityType;
      delete dbRecord.capabilityType;
    }
    
    if (codeRecord.lastSeen !== undefined) {
      dbRecord.last_seen = codeRecord.lastSeen;
      delete dbRecord.lastSeen;
    }
    
    if (codeRecord.createdAt !== undefined) {
      dbRecord.created_at = codeRecord.createdAt;
      delete dbRecord.createdAt;
    }
    
    if (codeRecord.updatedAt !== undefined) {
      dbRecord.updated_at = codeRecord.updatedAt;
      delete dbRecord.updatedAt;
    }
    
    return dbRecord;
  }
}