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
    
    // Execute command
    const output = execSync(command, { 
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 // 1MB buffer
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
    
    // Simple file search
    const searchCommand = `find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | head -50`;
    const files = execSync(searchCommand, { encoding: 'utf8' }).split('\n').filter(Boolean);
    
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