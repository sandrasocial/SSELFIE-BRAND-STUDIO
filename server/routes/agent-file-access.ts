/**
 * ENHANCED AGENT FILE ACCESS SYSTEM
 * Enables Sandra's agents to read and browse the entire codebase
 */

import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

/**
 * ADMIN AUTHENTICATION CHECK
 * For agent file access - check both user auth and admin token
 */
const isAdmin = (req: any, res: any, next: any) => {
  try {
    // Check for admin token from agent system (header or body)
    const adminToken = req.headers['x-admin-token'] || req.body.adminToken;
    if (adminToken === 'sandra-admin-2025') {
      return next();
    }
    
    // Fallback to user authentication for direct access
    if (!req.user || req.user.claims?.email !== 'ssa@ssasocial.com') {
      console.log('🔍 AGENT FILE ACCESS AUTH:', {
        hasUser: !!req.user,
        email: req.user?.claims?.email,
        hasAdminToken: !!adminToken,
        userAgent: req.headers['user-agent']
      });
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Authentication check failed:', error);
    res.status(500).json({ error: 'Authentication check failed' });
  }
};

/**
 * BROWSE DIRECTORY STRUCTURE
 * Allows agents to explore the codebase structure
 */
router.post('/browse-directory', isAdmin, async (req, res) => {
  try {
    const { agentId, dirPath = '.' } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID required' });
    }
    
    // Security: Only allow browsing within project directory
    const allowedDirs = [
      'server',
      'client', 
      'shared',
      'public',
      'assets',
      'attached_assets',
      'data',
      'logs',
      'temp_training',
      'api',
      '.'
    ];
    
    const normalizedPath = path.normalize(dirPath);
    const isAllowed = allowedDirs.some(allowed => 
      normalizedPath === allowed || 
      normalizedPath.startsWith(allowed + '/') ||
      normalizedPath === '.'
    );
    
    if (!isAllowed) {
      return res.status(403).json({ 
        error: `Agent ${agentId} denied access to ${dirPath} - outside allowed directories`
      });
    }
    
    const fullPath = path.join(process.cwd(), normalizedPath);
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    
    const structure = await Promise.all(entries.map(async (entry) => {
      const entryPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        return {
          name: entry.name,
          type: 'directory',
          path: entryPath
        };
      } else {
        const stats = await fs.stat(path.join(fullPath, entry.name));
        return {
          name: entry.name,
          type: 'file',
          path: entryPath,
          size: stats.size,
          extension: path.extname(entry.name),
          lastModified: stats.mtime
        };
      }
    }));
    
    console.log(`📁 Agent ${agentId} browsed directory: ${dirPath}`);
    
    res.json({
      success: true,
      agentId,
      currentPath: dirPath,
      entries: structure.sort((a, b) => {
        // Directories first, then files
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
    });
    
  } catch (error) {
    console.error(`❌ Directory browse error for agent ${req.body.agentId}:`, error);
    res.status(500).json({
      error: 'Failed to browse directory',
      details: error.message
    });
  }
});

/**
 * READ FILE CONTENT
 * Allows agents to read any file in the codebase
 */
router.post('/read-file', isAdmin, async (req, res) => {
  try {
    const { agentId, filePath } = req.body;
    
    if (!agentId || !filePath) {
      return res.status(400).json({ error: 'Agent ID and file path required' });
    }
    
    // Security: Only allow reading within project directory
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..') || normalizedPath.startsWith('/')) {
      return res.status(403).json({ 
        error: `Agent ${agentId} denied access to ${filePath} - invalid path`
      });
    }
    
    const fullPath = path.join(process.cwd(), normalizedPath);
    
    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return res.status(404).json({
        error: `File not found: ${filePath}`
      });
    }
    
    // Read file content
    const content = await fs.readFile(fullPath, 'utf-8');
    const stats = await fs.stat(fullPath);
    
    console.log(`📄 Agent ${agentId} read file: ${filePath} (${content.length} chars)`);
    
    res.json({
      success: true,
      agentId,
      filePath,
      content,
      fileInfo: {
        size: stats.size,
        lastModified: stats.mtime,
        extension: path.extname(filePath)
      }
    });
    
  } catch (error) {
    console.error(`❌ File read error for agent ${req.body.agentId}:`, error);
    res.status(500).json({
      error: 'Failed to read file',
      details: error.message,
      filePath: req.body.filePath
    });
  }
});

/**
 * SEARCH FILES
 * Allows agents to search for files by name or content
 */
router.post('/search-files', isAdmin, async (req, res) => {
  try {
    const { agentId, query, searchContent = false, directory = '.' } = req.body;
    
    if (!agentId || !query) {
      return res.status(400).json({ error: 'Agent ID and search query required' });
    }
    
    const searchResults = [];
    
    const searchInDirectory = async (dirPath: string) => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          const relativePath = path.relative(process.cwd(), fullPath);
          
          // Skip node_modules and hidden files
          if (entry.name.startsWith('.') || entry.name === 'node_modules') {
            continue;
          }
          
          if (entry.isDirectory()) {
            await searchInDirectory(fullPath);
          } else if (entry.isFile()) {
            // Search by filename
            if (entry.name.toLowerCase().includes(query.toLowerCase())) {
              searchResults.push({
                type: 'filename',
                path: relativePath,
                name: entry.name,
                match: entry.name
              });
            }
            
            // Search by content if requested
            if (searchContent && entry.name.match(/\.(ts|tsx|js|jsx|json|md|txt)$/)) {
              try {
                const content = await fs.readFile(fullPath, 'utf-8');
                if (content.toLowerCase().includes(query.toLowerCase())) {
                  searchResults.push({
                    type: 'content',
                    path: relativePath,
                    name: entry.name,
                    match: `Contains "${query}"`
                  });
                }
              } catch {
                // Skip files that can't be read
              }
            }
          }
        }
      } catch {
        // Skip directories that can't be read
      }
    };
    
    const searchPath = path.join(process.cwd(), directory);
    await searchInDirectory(searchPath);
    
    console.log(`🔍 Agent ${agentId} searched for "${query}" - found ${searchResults.length} results`);
    
    res.json({
      success: true,
      agentId,
      query,
      searchContent,
      results: searchResults.slice(0, 50) // Limit results
    });
    
  } catch (error) {
    console.error(`❌ File search error for agent ${req.body.agentId}:`, error);
    res.status(500).json({
      error: 'Failed to search files',
      details: error.message
    });
  }
});

/**
 * GET PROJECT OVERVIEW
 * Provides agents with a high-level view of the codebase structure
 */
router.get('/project-overview/:agentId', isAdmin, async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const overview = {
      projectName: 'SSELFIE Studio',
      architecture: 'Individual model dual-tier system',
      mainDirectories: [],
      keyFiles: [],
      recentChanges: []
    };
    
    // Get main directories
    const rootEntries = await fs.readdir(process.cwd(), { withFileTypes: true });
    overview.mainDirectories = rootEntries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name);
    
    // Get key configuration files
    const keyFileNames = [
      'package.json',
      'vite.config.ts', 
      'tailwind.config.ts',
      'drizzle.config.ts',
      'replit.md'
    ];
    
    for (const fileName of keyFileNames) {
      try {
        const stats = await fs.stat(path.join(process.cwd(), fileName));
        overview.keyFiles.push({
          name: fileName,
          size: stats.size,
          lastModified: stats.mtime
        });
      } catch {
        // File doesn't exist
      }
    }
    
    console.log(`📋 Agent ${agentId} requested project overview`);
    
    res.json({
      success: true,
      agentId,
      overview
    });
    
  } catch (error) {
    console.error(`❌ Project overview error for agent ${req.params.agentId}:`, error);
    res.status(500).json({
      error: 'Failed to get project overview',
      details: error.message
    });
  }
});

/**
 * WRITE FILE CONTENT
 * Allows agents to create or modify files in the codebase
 */
router.post('/write-file', isAdmin, async (req, res) => {
  try {
    const { agentId, filePath, content } = req.body;
    
    if (!agentId || !filePath || content === undefined) {
      return res.status(400).json({ error: 'Agent ID, file path, and content required' });
    }
    
    // Security: Only allow writing within project directory
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..') || normalizedPath.startsWith('/')) {
      return res.status(403).json({ 
        error: `Agent ${agentId} denied write access to ${filePath} - invalid path`
      });
    }
    
    // Additional security: restrict write access to certain directories
    const allowedWriteDirs = [
      'client/src',
      'server',
      'shared',
      'temp_training',
      'data'
    ];
    
    const isWriteAllowed = allowedWriteDirs.some(allowed => 
      normalizedPath.startsWith(allowed + '/') || normalizedPath === allowed
    );
    
    if (!isWriteAllowed) {
      return res.status(403).json({
        error: `Agent ${agentId} denied write access to ${filePath} - restricted directory`
      });
    }
    
    const fullPath = path.join(process.cwd(), normalizedPath);
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error('Failed to create directory:', error);
    }
    
    // Write file content
    await fs.writeFile(fullPath, content, 'utf-8');
    const stats = await fs.stat(fullPath);
    
    console.log(`✏️ Agent ${agentId} wrote file: ${filePath} (${content.length} chars)`);
    
    res.json({
      success: true,
      agentId,
      filePath,
      bytesWritten: content.length,
      fileInfo: {
        size: stats.size,
        lastModified: stats.mtime,
        extension: path.extname(filePath)
      }
    });
    
  } catch (error) {
    console.error(`❌ File write error for agent ${req.body.agentId}:`, error);
    res.status(500).json({
      error: 'Failed to write file',
      details: error.message,
      filePath: req.body.filePath
    });
  }
});

export default router;