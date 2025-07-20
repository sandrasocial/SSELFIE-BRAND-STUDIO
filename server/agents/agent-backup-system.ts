/**
 * AGENT BACKUP SYSTEM
 * Automatic file backup creation before any agent modifications
 * Provides rollback capabilities for all agent file operations
 */

import fs from 'fs';
import path from 'path';

export class AgentBackupSystem {
  private static backupDir = 'agent-backups';
  
  /**
   * Creates a backup of a file before agent modification
   */
  static async createBackup(filePath: string, agentId: string): Promise<string> {
    try {
      // Ensure backup directory exists
      const backupPath = path.join(this.backupDir, agentId);
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }
      
      // Read original file
      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
      }
      
      const originalContent = fs.readFileSync(filePath, 'utf8');
      
      // Create backup filename with timestamp
      const fileName = path.basename(filePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `${fileName}.backup.${timestamp}`;
      const fullBackupPath = path.join(backupPath, backupFileName);
      
      // Write backup file
      fs.writeFileSync(fullBackupPath, originalContent);
      
      // Create backup metadata
      const metadataPath = `${fullBackupPath}.meta`;
      const metadata = {
        originalPath: filePath,
        backupTime: new Date().toISOString(),
        agentId: agentId,
        fileSize: originalContent.length,
        checksum: this.createChecksum(originalContent)
      };
      
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      
      console.log(`✅ Backup created: ${fullBackupPath}`);
      return fullBackupPath;
      
    } catch (error) {
      console.error(`❌ Backup creation failed for ${filePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Lists all backups for a specific file
   */
  static listBackups(filePath: string): string[] {
    try {
      const fileName = path.basename(filePath);
      const backups: string[] = [];
      
      if (!fs.existsSync(this.backupDir)) {
        return backups;
      }
      
      // Search through all agent backup directories
      const agentDirs = fs.readdirSync(this.backupDir);
      
      for (const agentDir of agentDirs) {
        const agentBackupPath = path.join(this.backupDir, agentDir);
        if (fs.statSync(agentBackupPath).isDirectory()) {
          const files = fs.readdirSync(agentBackupPath);
          const matchingBackups = files
            .filter(file => file.startsWith(fileName + '.backup.'))
            .map(file => path.join(agentBackupPath, file));
          
          backups.push(...matchingBackups);
        }
      }
      
      return backups.sort().reverse(); // Most recent first
    } catch (error) {
      console.error(`Error listing backups for ${filePath}:`, error);
      return [];
    }
  }
  
  /**
   * Restores a file from backup
   */
  static async restoreFromBackup(backupPath: string): Promise<void> {
    try {
      const metadataPath = `${backupPath}.meta`;
      
      if (!fs.existsSync(metadataPath)) {
        throw new Error(`Backup metadata not found: ${metadataPath}`);
      }
      
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      const backupContent = fs.readFileSync(backupPath, 'utf8');
      
      // Verify backup integrity
      const currentChecksum = this.createChecksum(backupContent);
      if (currentChecksum !== metadata.checksum) {
        throw new Error('Backup file appears to be corrupted');
      }
      
      // Restore the file
      fs.writeFileSync(metadata.originalPath, backupContent);
      
      console.log(`✅ File restored from backup: ${metadata.originalPath}`);
      
    } catch (error) {
      console.error(`❌ Restore failed:`, error);
      throw error;
    }
  }
  
  /**
   * Cleans up old backups (keeps last 5 per file per agent)
   */
  static cleanupOldBackups(): void {
    try {
      if (!fs.existsSync(this.backupDir)) {
        return;
      }
      
      const agentDirs = fs.readdirSync(this.backupDir);
      
      for (const agentDir of agentDirs) {
        const agentBackupPath = path.join(this.backupDir, agentDir);
        if (fs.statSync(agentBackupPath).isDirectory()) {
          const files = fs.readdirSync(agentBackupPath);
          
          // Group backups by original filename
          const backupGroups: { [key: string]: string[] } = {};
          
          for (const file of files) {
            if (file.includes('.backup.') && !file.endsWith('.meta')) {
              const originalName = file.split('.backup.')[0];
              if (!backupGroups[originalName]) {
                backupGroups[originalName] = [];
              }
              backupGroups[originalName].push(path.join(agentBackupPath, file));
            }
          }
          
          // Keep only the 5 most recent backups per file
          for (const [originalName, backups] of Object.entries(backupGroups)) {
            if (backups.length > 5) {
              const sortedBackups = backups.sort().reverse();
              const toDelete = sortedBackups.slice(5);
              
              for (const backupPath of toDelete) {
                fs.unlinkSync(backupPath);
                const metaPath = `${backupPath}.meta`;
                if (fs.existsSync(metaPath)) {
                  fs.unlinkSync(metaPath);
                }
                console.log(`🗑️ Cleaned up old backup: ${backupPath}`);
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Backup cleanup failed:', error);
    }
  }
  
  /**
   * Simple checksum for backup verification
   */
  private static createChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
  
  /**
   * Gets backup statistics
   */
  static getBackupStats(): { totalBackups: number; agentStats: { [key: string]: number } } {
    try {
      let totalBackups = 0;
      const agentStats: { [key: string]: number } = {};
      
      if (!fs.existsSync(this.backupDir)) {
        return { totalBackups: 0, agentStats: {} };
      }
      
      const agentDirs = fs.readdirSync(this.backupDir);
      
      for (const agentDir of agentDirs) {
        const agentBackupPath = path.join(this.backupDir, agentDir);
        if (fs.statSync(agentBackupPath).isDirectory()) {
          const files = fs.readdirSync(agentBackupPath);
          const backupCount = files.filter(file => file.includes('.backup.') && !file.endsWith('.meta')).length;
          
          agentStats[agentDir] = backupCount;
          totalBackups += backupCount;
        }
      }
      
      return { totalBackups, agentStats };
      
    } catch (error) {
      console.error('Error getting backup stats:', error);
      return { totalBackups: 0, agentStats: {} };
    }
  }
}