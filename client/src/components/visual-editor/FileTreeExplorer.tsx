import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';

interface FileTreeEntry {
  name: string;
  type: 'file' | 'directory';
  path: string;
  size?: number;
  extension?: string;
  children?: FileTreeEntry[];
  isExpanded?: boolean;
}

interface FileTreeExplorerProps {
  onFileSelect: (filePath: string, content: string) => void;
  selectedAgent: string;
}

export function FileTreeExplorer({ onFileSelect, selectedAgent }: FileTreeExplorerProps) {
  const [fileTree, setFileTree] = useState<FileTreeEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['client', 'server', 'shared']));

  // Load initial directory structure
  useEffect(() => {
    loadDirectory('.');
  }, []);

  // Add refresh function for external use
  const refreshFileTree = () => {
    loadDirectory('.');
    // Re-expand currently expanded directories
    expandedDirs.forEach(dirPath => {
      if (dirPath !== '.') {
        loadDirectory(dirPath);
      }
    });
  };

  // Expose refresh function globally for agent file operations
  useEffect(() => {
    (window as any).refreshFileTree = refreshFileTree;
    return () => {
      delete (window as any).refreshFileTree;
    };
  }, [expandedDirs]);

  const loadDirectory = async (dirPath: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/admin/agent/browse-directory', {
        agentId: selectedAgent,
        dirPath: dirPath === '.' ? '.' : dirPath,
        adminToken: 'sandra-admin-2025'
      });

      if (response.ok) {
        const data = await response.json();
        if (dirPath === '.') {
          // Root directory - set initial tree
          setFileTree(data.entries || []);
        } else {
          // Nested directory - update tree
          updateTreeWithChildren(dirPath, data.entries || []);
        }
      }
    } catch (error) {
      console.error('Failed to load directory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTreeWithChildren = (dirPath: string, children: FileTreeEntry[]) => {
    setFileTree(prevTree => updateTreeRecursively(prevTree, dirPath, children));
  };

  const updateTreeRecursively = (tree: FileTreeEntry[], targetPath: string, children: FileTreeEntry[]): FileTreeEntry[] => {
    return tree.map(entry => {
      if (entry.type === 'directory' && entry.path === targetPath) {
        return { ...entry, children, isExpanded: true };
      } else if (entry.children) {
        return { ...entry, children: updateTreeRecursively(entry.children, targetPath, children) };
      }
      return entry;
    });
  };

  const toggleDirectory = async (dirPath: string) => {
    if (expandedDirs.has(dirPath)) {
      // Collapse
      setExpandedDirs(prev => {
        const newSet = new Set(prev);
        newSet.delete(dirPath);
        return newSet;
      });
    } else {
      // Expand and load if needed
      setExpandedDirs(prev => new Set([...prev, dirPath]));
      await loadDirectory(dirPath);
    }
  };

  const handleFileClick = async (filePath: string) => {
    if (filePath.match(/\.(ts|tsx|js|jsx|css|md|json|txt|html)$/)) {
      try {
        // Check if multi-tab editor is available and use it
        if ((window as any).openFileInMultiTabEditor) {
          (window as any).openFileInMultiTabEditor(filePath);
          return;
        }

        // Fallback to original behavior
        const response = await apiRequest('POST', '/api/admin/agent/read-file', {
          agentId: selectedAgent,
          filePath: filePath,
          adminToken: 'sandra-admin-2025'
        });

        if (response.ok) {
          const data = await response.json();
          onFileSelect(filePath, data.content || '');
        }
      } catch (error) {
        console.error('Failed to read file:', error);
      }
    }
  };

  const renderTreeEntry = (entry: FileTreeEntry, level: number = 0) => {
    const isExpanded = expandedDirs.has(entry.path);
    const paddingLeft = level * 16;
    
    const matchesSearch = !searchTerm || 
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.path.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch && entry.type === 'file') return null;

    return (
      <div key={entry.path}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer text-sm ${
            entry.type === 'directory' ? 'font-medium' : ''
          }`}
          style={{ paddingLeft: paddingLeft + 8 }}
          onClick={() => {
            if (entry.type === 'directory') {
              toggleDirectory(entry.path);
            } else {
              handleFileClick(entry.path);
            }
          }}
        >
          {entry.type === 'directory' && (
            <span className="mr-1 text-gray-600 w-4 text-center">
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          {entry.type === 'file' && (
            <span className="mr-1 text-gray-600 w-4 text-center">
              📄
            </span>
          )}
          <span className="truncate">{entry.name}</span>
          {entry.type === 'file' && entry.size && (
            <span className="ml-auto text-xs text-gray-500">
              {formatFileSize(entry.size)}
            </span>
          )}
        </div>

        {/* Render children if directory is expanded */}
        {entry.type === 'directory' && isExpanded && entry.children && (
          <div>
            {entry.children.map(child => renderTreeEntry(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredTree = searchTerm 
    ? fileTree.filter(entry => 
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.type === 'directory')
    : fileTree;

  return (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <div className="p-3 border-b border-gray-200">
        <Input
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-sm border-black focus:border-black"
        />
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto max-h-full">
        {isLoading && (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading...
          </div>
        )}
        
        {!isLoading && filteredTree.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500">
            No files found
          </div>
        )}

        {!isLoading && filteredTree.map(entry => renderTreeEntry(entry))}
      </div>
    </div>
  );
}