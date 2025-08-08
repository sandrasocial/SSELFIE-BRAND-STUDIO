import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Folder, 
  File, 
  FileText,
  Image,
  Code,
  Database,
  Archive,
  Search,
  Filter,
  Plus,
  FolderPlus,
  Upload,
  Download,
  Copy,
  Move,
  Trash2,
  Star,
  Clock,
  Tag,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Eye,
  Edit,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: Date;
  path: string;
  extension?: string;
  isStarred?: boolean;
  tags?: string[];
  preview?: string;
  language?: string;
}

interface FileManagerProps {
  onFileSelect?: (file: FileItem) => void;
  onFolderSelect?: (folder: FileItem) => void;
  onFileCreate?: (path: string, content: string) => void;
  onFileDelete?: (path: string) => void;
  onFileMove?: (fromPath: string, toPath: string) => void;
  showPreview?: boolean;
  allowMultiSelect?: boolean;
}

const SAMPLE_FILES: FileItem[] = [
  {
    id: '1',
    name: 'components',
    type: 'folder',
    modified: new Date(),
    path: '/client/src/components',
    tags: ['react', 'ui']
  },
  {
    id: '2',
    name: 'OptimizedVisualEditor.tsx',
    type: 'file',
    size: 45600,
    modified: new Date(),
    path: '/client/src/components/visual-editor/OptimizedVisualEditor.tsx',
    extension: 'tsx',
    language: 'typescript',
    isStarred: true,
    tags: ['react', 'editor', 'main'],
    preview: 'import React, { useState, useRef, useEffect } from \'react\';\nimport { Button } from \'@/components/ui/button\';\n...'
  },
  {
    id: '3',
    name: 'CodeIntelligence.tsx',
    type: 'file',
    size: 12800,
    modified: new Date(),
    path: '/client/src/components/visual-editor/CodeIntelligence.tsx',
    extension: 'tsx',
    language: 'typescript',
    tags: ['react', 'code', 'intelligence'],
    preview: 'import React, { useState, useCallback, useRef } from \'react\';\nimport { Button } from \'@/components/ui/button\';\n...'
  },
  {
    id: '4',
    name: 'package.json',
    type: 'file',
    size: 2400,
    modified: new Date(),
    path: '/package.json',
    extension: 'json',
    language: 'json',
    tags: ['config', 'dependencies'],
    preview: '{\n  "name": "rest-express",\n  "version": "1.0.0",\n  "type": "module"\n...'
  },
  {
    id: '5',
    name: 'server',
    type: 'folder',
    modified: new Date(),
    path: '/server',
    tags: ['backend', 'api']
  }
];

const FILE_TYPE_ICONS = {
  'tsx': Code,
  'ts': Code,
  'js': Code,
  'jsx': Code,
  'css': FileText,
  'html': FileText,
  'json': Database,
  'md': FileText,
  'txt': FileText,
  'png': Image,
  'jpg': Image,
  'jpeg': Image,
  'gif': Image,
  'svg': Image,
  'zip': Archive,
  'folder': Folder
};

const FILE_TYPE_COLORS = {
  'tsx': 'bg-blue-100 text-blue-800',
  'ts': 'bg-blue-100 text-blue-800',
  'js': 'bg-yellow-100 text-yellow-800',
  'jsx': 'bg-yellow-100 text-yellow-800',
  'css': 'bg-purple-100 text-purple-800',
  'html': 'bg-orange-100 text-orange-800',
  'json': 'bg-green-100 text-green-800',
  'md': 'bg-gray-100 text-gray-800',
  'png': 'bg-pink-100 text-pink-800',
  'jpg': 'bg-pink-100 text-pink-800',
  'folder': 'bg-indigo-100 text-indigo-800'
};

export function FileManagement({
  onFileSelect,
  onFolderSelect,
  onFileCreate,
  onFileDelete,
  onFileMove,
  showPreview = true,
  allowMultiSelect = false
}: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>(SAMPLE_FILES);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterType, setFilterType] = useState<'all' | 'files' | 'folders' | 'starred'>('all');
  const [currentPath, setCurrentPath] = useState('/');
  const { toast } = useToast();

  // Filter and sort files
  const filteredFiles = files
    .filter(file => {
      // Search filter
      if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Type filter
      switch (filterType) {
        case 'files':
          return file.type === 'file';
        case 'folders':
          return file.type === 'folder';
        case 'starred':
          return file.isStarred;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'modified':
          comparison = a.modified.getTime() - b.modified.getTime();
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handle file selection
  const handleFileSelect = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    if (allowMultiSelect) {
      setSelectedFiles(prev => 
        prev.includes(fileId) 
          ? prev.filter(id => id !== fileId)
          : [...prev, fileId]
      );
    } else {
      setSelectedFiles([fileId]);
    }

    if (file.type === 'file') {
      onFileSelect?.(file);
    } else {
      onFolderSelect?.(file);
    }
  };

  // Toggle file starred status
  const toggleStar = (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, isStarred: !file.isStarred }
        : file
    ));
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Format modified date
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Get file icon
  const getFileIcon = (file: FileItem) => {
    const IconComponent = FILE_TYPE_ICONS[file.extension as keyof typeof FILE_TYPE_ICONS] || 
                         (file.type === 'folder' ? Folder : FileText);
    return IconComponent;
  };

  // Get file color
  const getFileColor = (file: FileItem) => {
    return FILE_TYPE_COLORS[file.extension as keyof typeof FILE_TYPE_COLORS] || 
           FILE_TYPE_COLORS[file.type as keyof typeof FILE_TYPE_COLORS] || 
           'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Folder className="w-5 h-5 mr-2" />
            File Management
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            Category 4
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="files">Files</option>
                <option value="folders">Folders</option>
                <option value="starred">Starred</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="name">Name</option>
                <option value="modified">Modified</option>
                <option value="size">Size</option>
                <option value="type">Type</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
              </Button>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-1"
              >
                <List className="w-3 h-3" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-1"
              >
                <Grid className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'list' ? (
            <div className="space-y-1">
              {filteredFiles.map((file) => {
                const IconComponent = getFileIcon(file);
                const isSelected = selectedFiles.includes(file.id);
                
                return (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file.id)}
                    className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-3 text-gray-500" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium truncate">{file.name}</span>
                        {file.extension && (
                          <Badge variant="secondary" className={`text-xs ${getFileColor(file)}`}>
                            {file.extension}
                          </Badge>
                        )}
                        {file.isStarred && (
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                        <span>{formatDate(file.modified)}</span>
                        {file.size && <span>{formatFileSize(file.size)}</span>}
                        {file.tags && (
                          <div className="flex space-x-1">
                            {file.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs px-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => toggleStar(file.id, e)}
                        className="p-1"
                      >
                        <Star className={`w-3 h-3 ${file.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredFiles.map((file) => {
                const IconComponent = getFileIcon(file);
                const isSelected = selectedFiles.includes(file.id);
                
                return (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <IconComponent className="w-8 h-8 text-gray-500" />
                      <div className="w-full">
                        <div className="text-sm font-medium truncate">{file.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {file.type === 'file' ? formatFileSize(file.size) : 'Folder'}
                        </div>
                      </div>
                      {file.isStarred && (
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selection Summary */}
        {selectedFiles.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg border-t">
            <div className="flex items-center justify-between text-sm">
              <span>{selectedFiles.length} item{selectedFiles.length > 1 ? 's' : ''} selected</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm">
                  <Move className="w-3 h-3 mr-1" />
                  Move
                </Button>
                <Button variant="outline" size="sm" className="text-red-600">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}