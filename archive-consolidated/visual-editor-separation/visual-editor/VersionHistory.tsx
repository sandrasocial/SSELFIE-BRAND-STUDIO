import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  History,
  RotateCcw,
  GitCommit,
  Tag,
  Calendar,
  Clock,
  User,
  FileText,
  Eye,
  Download,
  Upload,
  Diff,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Star,
  Archive,
  Save,
  Undo2,
  Redo2,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Version {
  id: string;
  version: string;
  name: string;
  description: string;
  author: string;
  timestamp: Date;
  type: 'major' | 'minor' | 'patch' | 'hotfix';
  status: 'current' | 'stable' | 'deprecated' | 'archived';
  changes: FileChange[];
  size: number;
  downloads: number;
  tags: string[];
}

interface FileChange {
  path: string;
  action: 'added' | 'modified' | 'deleted' | 'renamed';
  lines: { added: number; removed: number };
  preview?: string;
}

interface Snapshot {
  id: string;
  name: string;
  description: string;
  timestamp: Date;
  author: string;
  fileCount: number;
  size: string;
  type: 'auto' | 'manual' | 'milestone';
  restorable: boolean;
}

const SAMPLE_VERSIONS: Version[] = [
  {
    id: '1',
    version: '2.1.0',
    name: 'Category 6: Version Control & Collaboration',
    description: 'Complete git integration, collaboration tools, and version history management',
    author: 'Sandra',
    timestamp: new Date(),
    type: 'minor',
    status: 'current',
    changes: [
      {
        path: 'client/src/components/visual-editor/GitIntegration.tsx',
        action: 'added',
        lines: { added: 450, removed: 0 },
        preview: 'Complete git integration with branch management...'
      },
      {
        path: 'client/src/components/visual-editor/CollaborationHub.tsx',
        action: 'added',
        lines: { added: 380, removed: 0 },
        preview: 'Team collaboration with real-time chat...'
      }
    ],
    size: 1.2,
    downloads: 0,
    tags: ['collaboration', 'git', 'version-control']
  },
  {
    id: '2',
    version: '2.0.5',
    name: 'Category 5: Debugging & Testing Features',
    description: 'Advanced debugging console, test runner, and performance monitoring',
    author: 'Sandra',
    timestamp: new Date(Date.now() - 3600000),
    type: 'minor',
    status: 'stable',
    changes: [
      {
        path: 'client/src/components/visual-editor/DebugConsole.tsx',
        action: 'added',
        lines: { added: 420, removed: 0 }
      },
      {
        path: 'client/src/components/visual-editor/TestRunner.tsx',
        action: 'added',
        lines: { added: 365, removed: 0 }
      },
      {
        path: 'client/src/components/visual-editor/PerformanceMonitor.tsx',
        action: 'added',
        lines: { added: 340, removed: 0 }
      }
    ],
    size: 1.1,
    downloads: 24,
    tags: ['debugging', 'testing', 'performance']
  },
  {
    id: '3',
    version: '2.0.0',
    name: 'Categories 1-4: Core Replit Parity',
    description: 'Complete conversation threading, enhanced input, code intelligence, and workspace features',
    author: 'Sandra',
    timestamp: new Date(Date.now() - 7200000),
    type: 'major',
    status: 'stable',
    changes: [
      {
        path: 'client/src/components/visual-editor/ConversationThread.tsx',
        action: 'added',
        lines: { added: 280, removed: 0 }
      },
      {
        path: 'client/src/components/visual-editor/EnhancedInput.tsx',
        action: 'added',
        lines: { added: 245, removed: 0 }
      },
      {
        path: 'client/src/components/visual-editor/CodeIntelligence.tsx',
        action: 'added',
        lines: { added: 320, removed: 0 }
      }
    ],
    size: 2.4,
    downloads: 156,
    tags: ['core', 'replit-parity', 'major-release']
  }
];

const SAMPLE_SNAPSHOTS: Snapshot[] = [
  {
    id: '1',
    name: 'Pre-Category 6 Stable',
    description: 'Stable state before implementing version control features',
    timestamp: new Date(Date.now() - 1800000),
    author: 'Auto-backup',
    fileCount: 127,
    size: '2.8 MB',
    type: 'auto',
    restorable: true
  },
  {
    id: '2',
    name: 'Category 5 Complete',
    description: 'Milestone: All debugging and testing features implemented',
    timestamp: new Date(Date.now() - 5400000),
    author: 'Sandra',
    fileCount: 124,
    size: '2.6 MB',
    type: 'milestone',
    restorable: true
  },
  {
    id: '3',
    name: 'Visual Editor Enhancement',
    description: 'Major visual editor improvements with multi-tab support',
    timestamp: new Date(Date.now() - 10800000),
    author: 'Sandra',
    fileCount: 118,
    size: '2.4 MB',
    type: 'manual',
    restorable: true
  }
];

interface VersionHistoryProps {
  onRevert?: (versionId: string) => void;
  onCreateSnapshot?: (name: string, description: string) => void;
  onRestoreSnapshot?: (snapshotId: string) => void;
  onCompareVersions?: (version1: string, version2: string) => void;
}

export function VersionHistory({
  onRevert,
  onCreateSnapshot,
  onRestoreSnapshot,
  onCompareVersions
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>(SAMPLE_VERSIONS);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(SAMPLE_SNAPSHOTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());
  const [snapshotName, setSnapshotName] = useState('');
  const [snapshotDescription, setSnapshotDescription] = useState('');
  const { toast } = useToast();

  // Filter versions
  const filteredVersions = versions.filter(version =>
    version.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    version.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    version.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get status color and icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'stable': return <Star className="w-4 h-4 text-blue-500" />;
      case 'deprecated': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'archived': return <Archive className="w-4 h-4 text-gray-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800';
      case 'stable': return 'bg-blue-100 text-blue-800';
      case 'deprecated': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-red-100 text-red-800';
      case 'minor': return 'bg-blue-100 text-blue-800';
      case 'patch': return 'bg-green-100 text-green-800';
      case 'hotfix': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Toggle version selection for comparison
  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(versionId)) {
        newSet.delete(versionId);
      } else if (newSet.size < 2) {
        newSet.add(versionId);
      }
      return newSet;
    });
  };

  // Compare selected versions
  const compareVersions = () => {
    if (selectedVersions.size === 2) {
      const [version1, version2] = Array.from(selectedVersions);
      onCompareVersions?.(version1, version2);
      toast({
        title: 'Comparing Versions',
        description: `Comparing ${versions.find(v => v.id === version1)?.version} with ${versions.find(v => v.id === version2)?.version}`,
      });
    }
  };

  // Create snapshot
  const createSnapshot = () => {
    if (!snapshotName.trim()) return;

    const snapshot: Snapshot = {
      id: Date.now().toString(),
      name: snapshotName,
      description: snapshotDescription,
      timestamp: new Date(),
      author: 'Sandra',
      fileCount: 127,
      size: '2.9 MB',
      type: 'manual',
      restorable: true
    };

    setSnapshots(prev => [snapshot, ...prev]);
    setSnapshotName('');
    setSnapshotDescription('');
    onCreateSnapshot?.(snapshotName, snapshotDescription);

    toast({
      title: 'Snapshot Created',
      description: `Snapshot "${snapshotName}" created successfully`,
    });
  };

  // Revert to version
  const revertToVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      onRevert?.(versionId);
      toast({
        title: 'Version Reverted',
        description: `Reverted to ${version.version}`,
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <History className="w-5 h-5 mr-2" />
              Version History
            </CardTitle>
            <Badge variant="secondary" className="text-xs bg-black text-white">
              Category 6
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{versions[0].version}</div>
              <div className="text-xs text-gray-600">Current</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{versions.length}</div>
              <div className="text-xs text-gray-600">Versions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{snapshots.length}</div>
              <div className="text-xs text-gray-600">Snapshots</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {versions.reduce((sum, v) => sum + v.downloads, 0)}
              </div>
              <div className="text-xs text-gray-600">Downloads</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search versions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              {selectedVersions.size === 2 && (
                <Button variant="outline" onClick={compareVersions}>
                  <Diff className="w-4 h-4 mr-1" />
                  Compare Selected
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-1" />
                Import
              </Button>
              <Button size="sm">
                <Save className="w-4 h-4 mr-1" />
                Create Snapshot
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Version Timeline */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <GitCommit className="w-4 h-4 mr-2" />
              Version Timeline ({filteredVersions.length})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            {filteredVersions.map((version) => (
              <div
                key={version.id}
                className={`p-4 border rounded-lg ${
                  selectedVersions.has(version.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedVersions.has(version.id)}
                        onChange={() => toggleVersionSelection(version.id)}
                        className="rounded"
                      />
                      <code className="text-sm font-bold bg-gray-100 px-2 py-1 rounded">
                        {version.version}
                      </code>
                      <Badge variant="secondary" className={`text-xs ${getTypeColor(version.type)}`}>
                        {version.type}
                      </Badge>
                      <Badge variant="secondary" className={`text-xs ${getStatusColor(version.status)}`}>
                        {version.status}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium text-sm mb-1">{version.name}</h4>
                    <p className="text-xs text-gray-600 mb-3">{version.description}</p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{version.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{version.timestamp.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>{version.changes.length} files</span>
                      </div>
                      <div>{version.size} MB</div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {version.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* File Changes */}
                    <div className="space-y-1">
                      {version.changes.slice(0, 3).map((change, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className={`text-xs ${
                              change.action === 'added' ? 'bg-green-100 text-green-800' :
                              change.action === 'modified' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {change.action}
                            </Badge>
                            <span className="truncate">{change.path.split('/').pop()}</span>
                          </div>
                          <span className="text-gray-500">
                            +{change.lines.added} -{change.lines.removed}
                          </span>
                        </div>
                      ))}
                      {version.changes.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{version.changes.length - 3} more files...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    {getStatusIcon(version.status)}
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="w-3 h-3" />
                      </Button>
                      {version.status !== 'current' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revertToVersion(version.id)}
                          className="text-xs"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Snapshots */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Snapshots
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto space-y-2">
            {/* Create Snapshot */}
            <div className="space-y-2 pb-3 border-b">
              <Input
                placeholder="Snapshot name"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                className="text-xs"
              />
              <Input
                placeholder="Description (optional)"
                value={snapshotDescription}
                onChange={(e) => setSnapshotDescription(e.target.value)}
                className="text-xs"
              />
              <Button onClick={createSnapshot} className="w-full text-xs">
                <Save className="w-3 h-3 mr-1" />
                Create Snapshot
              </Button>
            </div>

            {/* Snapshot List */}
            {snapshots.map((snapshot) => (
              <div key={snapshot.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">{snapshot.name}</span>
                      <Badge variant="secondary" className={`text-xs ${
                        snapshot.type === 'milestone' ? 'bg-purple-100 text-purple-800' :
                        snapshot.type === 'auto' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {snapshot.type}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2">
                      {snapshot.description}
                    </div>

                    <div className="text-xs text-gray-500">
                      {snapshot.author} • {snapshot.timestamp.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {snapshot.fileCount} files • {snapshot.size}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestoreSnapshot?.(snapshot.id)}
                      disabled={!snapshot.restorable}
                      className="text-xs"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}