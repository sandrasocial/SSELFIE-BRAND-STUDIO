import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Upload,
  Download,
  RefreshCw,
  Plus,
  Minus,
  Clock,
  User,
  Tag,
  Eye,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  History,
  Settings,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GitCommit {
  id: string;
  hash: string;
  message: string;
  author: string;
  date: Date;
  branch: string;
  files: string[];
  additions: number;
  deletions: number;
  status: 'committed' | 'pending' | 'failed';
}

interface GitBranch {
  name: string;
  isActive: boolean;
  lastCommit: string;
  ahead: number;
  behind: number;
  protected: boolean;
}

interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  staged: boolean;
}

const SAMPLE_BRANCHES: GitBranch[] = [
  {
    name: 'main',
    isActive: false,
    lastCommit: 'feat: Category 5 debugging features complete',
    ahead: 0,
    behind: 3,
    protected: true
  },
  {
    name: 'feature/category-6-git',
    isActive: true,
    lastCommit: 'wip: Git integration components',
    ahead: 2,
    behind: 0,
    protected: false
  },
  {
    name: 'enhancement/visual-editor',
    isActive: false,
    lastCommit: 'feat: Enhanced input and code intelligence',
    ahead: 1,
    behind: 1,
    protected: false
  }
];

const SAMPLE_COMMITS: GitCommit[] = [
  {
    id: '1',
    hash: 'a1b2c3d',
    message: 'feat: Category 5 debugging features complete',
    author: 'Sandra',
    date: new Date(),
    branch: 'feature/category-6-git',
    files: ['DebugConsole.tsx', 'TestRunner.tsx', 'PerformanceMonitor.tsx'],
    additions: 847,
    deletions: 23,
    status: 'committed'
  },
  {
    id: '2',
    hash: 'e4f5g6h',
    message: 'feat: Workspace intelligence and file management',
    author: 'Sandra',
    date: new Date(Date.now() - 3600000),
    branch: 'feature/category-6-git',
    files: ['FileManagement.tsx', 'WorkspaceIntelligence.tsx', 'ProjectOrganization.tsx'],
    additions: 692,
    deletions: 15,
    status: 'committed'
  },
  {
    id: '3',
    hash: 'i7j8k9l',
    message: 'feat: Code intelligence and syntax features',
    author: 'Sandra',
    date: new Date(Date.now() - 7200000),
    branch: 'enhancement/visual-editor',
    files: ['CodeIntelligence.tsx', 'SyntaxHighlighter.tsx', 'CodeFormatter.tsx'],
    additions: 543,
    deletions: 8,
    status: 'committed'
  }
];

const SAMPLE_CHANGES: FileChange[] = [
  {
    path: 'client/src/components/visual-editor/GitIntegration.tsx',
    status: 'added',
    additions: 234,
    deletions: 0,
    staged: false
  },
  {
    path: 'client/src/components/visual-editor/OptimizedVisualEditor.tsx',
    status: 'modified',
    additions: 45,
    deletions: 12,
    staged: true
  },
  {
    path: 'replit.md',
    status: 'modified',
    additions: 23,
    deletions: 3,
    staged: true
  }
];

interface GitIntegrationProps {
  onCommit?: (message: string, files: string[]) => void;
  onPush?: () => void;
  onPull?: () => void;
  onCreateBranch?: (name: string) => void;
  onSwitchBranch?: (branch: string) => void;
}

export function GitIntegration({
  onCommit,
  onPush,
  onPull,
  onCreateBranch,
  onSwitchBranch
}: GitIntegrationProps) {
  const [branches, setBranches] = useState<GitBranch[]>(SAMPLE_BRANCHES);
  const [commits, setCommits] = useState<GitCommit[]>(SAMPLE_COMMITS);
  const [changes, setChanges] = useState<FileChange[]>(SAMPLE_CHANGES);
  const [commitMessage, setCommitMessage] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const activeBranch = branches.find(b => b.isActive);
  const stagedChanges = changes.filter(c => c.staged);
  const unstagedChanges = changes.filter(c => !c.staged);

  // Get status color and icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added': return <Plus className="w-4 h-4 text-green-500" />;
      case 'modified': return <GitCommit className="w-4 h-4 text-blue-500" />;
      case 'deleted': return <Minus className="w-4 h-4 text-red-500" />;
      case 'renamed': return <GitBranch className="w-4 h-4 text-purple-500" />;
      default: return <GitCommit className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'added': return 'bg-green-100 text-green-800';
      case 'modified': return 'bg-blue-100 text-blue-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      case 'renamed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Stage/unstage file
  const toggleFileStaging = (filePath: string) => {
    setChanges(prev => prev.map(change => 
      change.path === filePath 
        ? { ...change, staged: !change.staged }
        : change
    ));
  };

  // Stage all files
  const stageAllFiles = () => {
    setChanges(prev => prev.map(change => ({ ...change, staged: true })));
    toast({
      title: 'All Files Staged',
      description: 'All changes have been staged for commit',
    });
  };

  // Create commit
  const createCommit = () => {
    if (!commitMessage.trim()) {
      toast({
        title: 'Commit Message Required',
        description: 'Please enter a commit message',
        variant: 'destructive'
      });
      return;
    }

    if (stagedChanges.length === 0) {
      toast({
        title: 'No Staged Changes',
        description: 'Please stage files before committing',
        variant: 'destructive'
      });
      return;
    }

    const newCommit: GitCommit = {
      id: Date.now().toString(),
      hash: Math.random().toString(36).substring(2, 9),
      message: commitMessage,
      author: 'Sandra',
      date: new Date(),
      branch: activeBranch?.name || 'main',
      files: stagedChanges.map(c => c.path),
      additions: stagedChanges.reduce((sum, c) => sum + c.additions, 0),
      deletions: stagedChanges.reduce((sum, c) => sum + c.deletions, 0),
      status: 'committed'
    };

    setCommits(prev => [newCommit, ...prev]);
    setChanges(prev => prev.filter(c => !c.staged));
    setCommitMessage('');
    onCommit?.(commitMessage, stagedChanges.map(c => c.path));

    toast({
      title: 'Commit Created',
      description: `${stagedChanges.length} files committed successfully`,
    });
  };

  // Create new branch
  const createBranch = () => {
    if (!newBranchName.trim()) return;

    const newBranch: GitBranch = {
      name: newBranchName,
      isActive: false,
      lastCommit: 'Initial branch creation',
      ahead: 0,
      behind: 0,
      protected: false
    };

    setBranches(prev => [...prev, newBranch]);
    setNewBranchName('');
    onCreateBranch?.(newBranchName);

    toast({
      title: 'Branch Created',
      description: `Branch "${newBranchName}" created successfully`,
    });
  };

  // Switch branch
  const switchBranch = (branchName: string) => {
    setBranches(prev => prev.map(branch => ({
      ...branch,
      isActive: branch.name === branchName
    })));
    
    onSwitchBranch?.(branchName);

    toast({
      title: 'Branch Switched',
      description: `Switched to branch "${branchName}"`,
    });
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <GitBranch className="w-5 h-5 mr-2" />
              Git Integration
            </CardTitle>
            <Badge variant="secondary" className="text-xs bg-black text-white">
              Category 6
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activeBranch?.name}</div>
              <div className="text-xs text-gray-600">Current Branch</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stagedChanges.length}</div>
              <div className="text-xs text-gray-600">Staged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{unstagedChanges.length}</div>
              <div className="text-xs text-gray-600">Modified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{commits.length}</div>
              <div className="text-xs text-gray-600">Commits</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Changes */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center">
                <GitCommit className="w-4 h-4 mr-2" />
                Changes
              </CardTitle>
              <Button variant="outline" size="sm" onClick={stageAllFiles}>
                Stage All
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            {/* Staged Changes */}
            {stagedChanges.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-green-600 mb-2">Staged Changes ({stagedChanges.length})</h4>
                <div className="space-y-2">
                  {stagedChanges.map((change) => (
                    <div
                      key={change.path}
                      className="p-2 border rounded-lg bg-green-50 cursor-pointer"
                      onClick={() => toggleFileStaging(change.path)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(change.status)}
                          <span className="text-xs font-medium truncate">{change.path.split('/').pop()}</span>
                        </div>
                        <Badge variant="secondary" className={`text-xs ${getStatusColor(change.status)}`}>
                          {change.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        +{change.additions} -{change.deletions}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unstaged Changes */}
            {unstagedChanges.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-orange-600 mb-2">Unstaged Changes ({unstagedChanges.length})</h4>
                <div className="space-y-2">
                  {unstagedChanges.map((change) => (
                    <div
                      key={change.path}
                      className="p-2 border rounded-lg bg-orange-50 cursor-pointer"
                      onClick={() => toggleFileStaging(change.path)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(change.status)}
                          <span className="text-xs font-medium truncate">{change.path.split('/').pop()}</span>
                        </div>
                        <Badge variant="secondary" className={`text-xs ${getStatusColor(change.status)}`}>
                          {change.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        +{change.additions} -{change.deletions}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commit Section */}
            <div className="pt-3 border-t">
              <div className="space-y-2">
                <Textarea
                  placeholder="Commit message..."
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="text-xs"
                  rows={3}
                />
                <Button 
                  onClick={createCommit}
                  disabled={!commitMessage.trim() || stagedChanges.length === 0}
                  className="w-full"
                >
                  <GitCommit className="w-4 h-4 mr-1" />
                  Commit ({stagedChanges.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branches */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <GitBranch className="w-4 h-4 mr-2" />
              Branches
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto space-y-2">
            {branches.map((branch) => (
              <div
                key={branch.name}
                className={`p-3 border rounded-lg cursor-pointer ${
                  branch.isActive ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => !branch.isActive && switchBranch(branch.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <GitBranch className={`w-4 h-4 ${branch.isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${branch.isActive ? 'text-blue-700' : ''}`}>
                      {branch.name}
                    </span>
                    {branch.isActive && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        current
                      </Badge>
                    )}
                    {branch.protected && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
                        protected
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 mb-2 truncate">
                  {branch.lastCommit}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex space-x-2">
                    {branch.ahead > 0 && (
                      <span className="text-green-600">↑{branch.ahead}</span>
                    )}
                    {branch.behind > 0 && (
                      <span className="text-red-600">↓{branch.behind}</span>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" className="p-1">
                      <Eye className="w-3 h-3" />
                    </Button>
                    {!branch.protected && !branch.isActive && (
                      <Button variant="ghost" size="sm" className="p-1">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Create Branch */}
            <div className="pt-2 border-t">
              <div className="flex space-x-2">
                <Input
                  placeholder="New branch name"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="text-xs"
                />
                <Button variant="outline" size="sm" onClick={createBranch}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commit History */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center">
                <History className="w-4 h-4 mr-2" />
                Commit History
              </CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto space-y-2">
            {commits.map((commit) => (
              <div key={commit.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <code className="text-xs bg-gray-100 px-1 rounded">{commit.hash}</code>
                      <Badge variant="secondary" className="text-xs">
                        {commit.branch}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium mb-1">{commit.message}</div>
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{commit.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{commit.date.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="p-1">
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-600">
                  {commit.files.length} files • +{commit.additions} -{commit.deletions}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={onPull}>
                <Download className="w-4 h-4 mr-1" />
                Pull
              </Button>
              <Button variant="outline" size="sm" onClick={onPush}>
                <Upload className="w-4 h-4 mr-1" />
                Push
              </Button>
              <Button variant="outline" size="sm">
                <GitMerge className="w-4 h-4 mr-1" />
                Merge
              </Button>
              <Button variant="outline" size="sm">
                <GitPullRequest className="w-4 h-4 mr-1" />
                Pull Request
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                GitHub
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}