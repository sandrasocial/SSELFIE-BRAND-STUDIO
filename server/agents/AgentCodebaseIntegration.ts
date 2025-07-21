import fs from 'fs/promises';
import path from 'path';

export class AgentCodebaseIntegration {
  static async writeFile(filePath: string, content: string) {
    try {
      // Ensure directory exists
      const fullPath = path.resolve(filePath);
      const dir = path.dirname(fullPath);
      
      // Create directory if it doesn't exist
      await fs.mkdir(dir, { recursive: true });
      
      // Write the file
      await fs.writeFile(fullPath, content, 'utf8');
      
      console.log(`✅ AGENT FILE OPERATION SUCCESS: ${filePath}`);
      console.log(`📄 File content length: ${content.length} characters`);
      
      return {
        success: true,
        filePath: filePath,
        fullPath: fullPath
      };
    } catch (error) {
      console.error(`❌ AGENT FILE OPERATION FAILED: ${filePath}`, error);
      throw error;
    }
  }
  
  static async readFile(filePath: string) {
    try {
      const fullPath = path.resolve(filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      return content;
    } catch (error) {
      console.error(`❌ Failed to read file: ${filePath}`, error);
      throw error;
    }
  }
  
  static async appendToFile(filePath: string, content: string) {
    try {
      const fullPath = path.resolve(filePath);
      await fs.appendFile(fullPath, content, 'utf8');
      console.log(`✅ Appended to file: ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to append to file: ${filePath}`, error);
      throw error;
    }
  }
}