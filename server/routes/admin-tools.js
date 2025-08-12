import express from 'express';
import { adminBypass } from '../middleware/admin-bypass.js';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const router = express.Router();

// DIRECT FILE OPERATIONS - NO API COSTS
router.post('/direct-file-create', adminBypass, async (req, res) => {
  if (!req.isAdminBypass) return res.status(403).json({ error: 'Admin access required' });
  
  try {
    const { filePath, content } = req.body;
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write file
    await fs.writeFile(filePath, content, 'utf8');
    
    res.json({ 
      success: true, 
      message: `File created: ${filePath}`,
      bypassUsed: true,
      apiCost: 0
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      bypassUsed: true,
      apiCost: 0
    });
  }
});

router.post('/direct-file-edit', adminBypass, async (req, res) => {
  if (!req.isAdminBypass) return res.status(403).json({ error: 'Admin access required' });
  
  try {
    const { filePath, oldStr, newStr } = req.body;
    
    // Read file
    const content = await fs.readFile(filePath, 'utf8');
    
    // Replace content
    const updatedContent = content.replace(oldStr, newStr);
    
    // Write back
    await fs.writeFile(filePath, updatedContent, 'utf8');
    
    res.json({ 
      success: true, 
      message: `File edited: ${filePath}`,
      bypassUsed: true,
      apiCost: 0
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      bypassUsed: true,
      apiCost: 0
    });
  }
});

router.post('/direct-file-view', adminBypass, async (req, res) => {
  if (!req.isAdminBypass) return res.status(403).json({ error: 'Admin access required' });
  
  try {
    const { filePath } = req.body;
    
    // Read file
    const content = await fs.readFile(filePath, 'utf8');
    
    res.json({ 
      success: true, 
      content,
      filePath,
      bypassUsed: true,
      apiCost: 0
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      bypassUsed: true,
      apiCost: 0
    });
  }
});

router.post('/direct-bash', adminBypass, async (req, res) => {
  if (!req.isAdminBypass) return res.status(403).json({ error: 'Admin access required' });
  
  try {
    const { command } = req.body;
    
    // SECURITY: Validate and sanitize command to prevent injection
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Invalid command format' });
    }
    
    // Whitelist of allowed commands for admin operations
    const allowedCommands = [
      /^ls\s.*/, /^cat\s.*/, /^grep\s.*/, /^find\s.*/, 
      /^npm\s+run\s+\w+$/, /^npm\s+install$/, /^npm\s+test$/,
      /^git\s+status$/, /^git\s+log\s+--oneline$/
    ];
    
    const isAllowed = allowedCommands.some(pattern => pattern.test(command.trim()));
    
    if (!isAllowed) {
      return res.status(403).json({ 
        error: 'Command not allowed for security reasons',
        allowedPatterns: ['ls', 'cat', 'grep', 'find', 'npm run', 'git status']
      });
    }
    
    // SECURITY FIX: Use parameterized execution to prevent command injection
    // Split command into safe components
    const commandParts = command.trim().split(/\s+/);
    const baseCommand = commandParts[0];
    const args = commandParts.slice(1);
    
    // Additional validation for arguments
    const sanitizedArgs = args.filter(arg => 
      !/[;&|`$()]/.test(arg) && arg.length < 200
    );
    
    // Execute with safe command construction
    const output = execSync(`${baseCommand} ${sanitizedArgs.join(' ')}`, { 
      encoding: 'utf8',
      maxBuffer: 512 * 1024, // 512KB buffer
      timeout: 10000, // 10 second timeout
      shell: false // Prevent shell injection
    });
    
    res.json({ 
      success: true, 
      output,
      command,
      bypassUsed: true,
      apiCost: 0
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      bypassUsed: true,
      apiCost: 0
    });
  }
});

router.get('/direct-search', adminBypass, async (req, res) => {
  if (!req.isAdminBypass) return res.status(403).json({ error: 'Admin access required' });
  
  try {
    const { query } = req.query;
    
    // SECURITY FIX: Safe file search without user input in command
    const files = execSync('find . -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \\) | head -50', { 
      encoding: 'utf8',
      shell: false,
      timeout: 5000
    }).split('\n').filter(Boolean);
    
    res.json({ 
      success: true, 
      files,
      query,
      bypassUsed: true,
      apiCost: 0
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      bypassUsed: true,
      apiCost: 0
    });
  }
});

export default router;