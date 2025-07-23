import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit3 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface OpenTab {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  isDirty: boolean;
  language: string;
}

interface MultiTabEditorProps {
  selectedAgent: string;
  onFileChange?: (filePath: string, content: string) => void;
}

export function MultiTabEditor({ selectedAgent, onFileChange }: MultiTabEditorProps) {
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [isSaving, setIsSaving] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Open a new file in a tab
  const openFileInTab = async (filePath: string) => {
    // Check if file is already open
    const existingTab = openTabs.find(tab => tab.filePath === filePath);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/admin/agent/read-file', {
        agentId: selectedAgent,
        filePath,
        adminToken: 'sandra-admin-2025'
      });

      if (response.ok) {
        const data = await response.json();
        const fileName = filePath.split('/').pop() || filePath;
        const extension = fileName.split('.').pop() || '';
        
        const newTab: OpenTab = {
          id: `tab-${Date.now()}`,
          filePath,
          fileName,
          content: data.content || '',
          isDirty: false,
          language: getLanguageFromExtension(extension)
        };

        setOpenTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to open file: ${filePath}`,
        variant: 'destructive'
      });
    }
  };

  // Close a tab
  const closeTab = (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (tab?.isDirty) {
      if (!confirm(`File ${tab.fileName} has unsaved changes. Close anyway?`)) {
        return;
      }
    }

    setOpenTabs(prev => prev.filter(t => t.id !== tabId));
    
    // Switch to another tab if closing active tab
    if (activeTabId === tabId) {
      const remainingTabs = openTabs.filter(t => t.id !== tabId);
      setActiveTabId(remainingTabs.length > 0 ? remainingTabs[0].id : '');
    }
  };

  // Save file content
  const saveFile = async (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (!tab) return;

    setIsSaving(prev => new Set(prev).add(tabId));

    try {
      const response = await apiRequest('POST', '/api/admin/agent/write-file', {
        agentId: selectedAgent,
        filePath: tab.filePath,
        content: tab.content,
        adminToken: 'sandra-admin-2025'
      });

      if (response.ok) {
        setOpenTabs(prev => prev.map(t => 
          t.id === tabId ? { ...t, isDirty: false } : t
        ));
        
        toast({
          title: 'File Saved',
          description: `${tab.fileName} saved successfully`,
        });

        // Notify parent of file change
        onFileChange?.(tab.filePath, tab.content);
      }
    } catch (error) {
      toast({
        title: 'Save Error',
        description: `Failed to save ${tab.fileName}`,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(prev => {
        const newSet = new Set(prev);
        newSet.delete(tabId);
        return newSet;
      });
    }
  };

  // Update file content
  const updateContent = (tabId: string, newContent: string) => {
    setOpenTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, content: newContent, isDirty: tab.content !== newContent }
        : tab
    ));
  };

  // Get language from file extension
  const getLanguageFromExtension = (ext: string): string => {
    const langMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'tsx',
      'js': 'javascript',
      'jsx': 'jsx',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'txt': 'text'
    };
    return langMap[ext.toLowerCase()] || 'text';
  };

  // Listen for file open events from file tree
  useEffect(() => {
    const handleFileOpen = (event: any) => {
      const { filePath, content } = event.detail;
      
      // Check if file is already open
      const existingTab = openTabs.find(tab => tab.filePath === filePath);
      if (existingTab) {
        setActiveTabId(existingTab.id);
        return;
      }

      // Create new tab with provided content
      const fileName = filePath.split('/').pop() || filePath;
      const extension = fileName.split('.').pop() || '';
      
      const newTab: OpenTab = {
        id: `tab-${Date.now()}`,
        filePath,
        fileName,
        content: content || '',
        isDirty: false,
        language: getLanguageFromExtension(extension)
      };

      setOpenTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    };

    window.addEventListener('openFileInEditor', handleFileOpen);
    
    // Also expose direct function for backwards compatibility
    (window as any).openFileInMultiTabEditor = openFileInTab;
    
    return () => {
      window.removeEventListener('openFileInEditor', handleFileOpen);
      delete (window as any).openFileInMultiTabEditor;
    };
  }, [selectedAgent, openTabs]);

  if (openTabs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 border border-gray-200 bg-gray-50">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Edit3 className="w-6 h-6 text-gray-600" />
          </div>
          <div className="text-sm font-medium mb-2">Multi-Tab Editor Ready</div>
          <div className="text-xs space-y-1">
            <div>Click files in the <strong>Files tab</strong> to open them here</div>
            <div className="text-gray-400">• Multiple files • Syntax highlighting • Auto-save</div>
          </div>
        </div>
      </div>
    );
  }

  const activeTab = openTabs.find(tab => tab.id === activeTabId);

  return (
    <div className="h-full flex flex-col border border-gray-200">
      {/* Tab Headers */}
      <div className="flex items-center bg-gray-50 border-b border-gray-200 overflow-x-auto">
        {openTabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center px-3 py-2 border-r border-gray-200 cursor-pointer min-w-0 ${
              activeTabId === tab.id 
                ? 'bg-white border-b-2 border-b-black' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span className="text-sm truncate max-w-32">{tab.fileName}</span>
            {tab.isDirty && (
              <div className="w-1.5 h-1.5 bg-black rounded-full ml-2 flex-shrink-0"></div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0 text-gray-400 hover:text-black"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              ×
            </Button>
          </div>
        ))}
      </div>

      {/* Editor Content */}
      {activeTab && (
        <div className="flex-1 flex flex-col">
          {/* File Info Bar */}
          <div className="px-3 py-2 bg-white border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {activeTab.language}
              </Badge>
              <span className="text-xs text-gray-600">{activeTab.filePath}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveFile(activeTab.id)}
                disabled={!activeTab.isDirty || isSaving.has(activeTab.id)}
                className="border-black text-black hover:bg-black hover:text-white"
              >
                {isSaving.has(activeTab.id) ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1">
            <Textarea
              value={activeTab.content}
              onChange={(e) => updateContent(activeTab.id, e.target.value)}
              className="h-full resize-none border-0 rounded-none font-mono text-sm"
              placeholder="Edit your code here..."
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}