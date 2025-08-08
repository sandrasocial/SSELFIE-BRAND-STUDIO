import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FolderTree, 
  Package,
  GitBranch,
  Target,
  Layers,
  Map,
  Boxes,
  Network,
  Workflow,
  Settings,
  Plus,
  Search,
  Filter,
  Archive,
  BookOpen,
  FileText,
  Code,
  Database,
  Globe,
  Cog,
  Users,
  Lock,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectStructure {
  id: string;
  name: string;
  type: 'component' | 'feature' | 'service' | 'utility' | 'config' | 'test';
  path: string;
  dependencies: string[];
  dependents: string[];
  complexity: 'low' | 'medium' | 'high';
  status: 'active' | 'deprecated' | 'planned' | 'refactoring';
  lastModified: Date;
  owner?: string;
  description?: string;
  tags: string[];
}

interface WorkspaceIntelligence {
  projectHealth: number;
  codeComplexity: number;
  dependencyScore: number;
  organizationScore: number;
  suggestions: string[];
  hotspots: string[];
  opportunities: string[];
}

const SAMPLE_PROJECT_STRUCTURE: ProjectStructure[] = [
  {
    id: 'visual-editor',
    name: 'Visual Editor System',
    type: 'feature',
    path: '/client/src/components/visual-editor',
    dependencies: ['ui-components', 'agent-system', 'file-management'],
    dependents: ['admin-dashboard', 'workspace-interface'],
    complexity: 'high',
    status: 'active',
    lastModified: new Date(),
    owner: 'Elena',
    description: 'Complete visual editor with agent integration and code intelligence',
    tags: ['core', 'editor', 'agents', 'category-3']
  },
  {
    id: 'agent-system',
    name: 'AI Agent Coordination',
    type: 'service',
    path: '/server/agents',
    dependencies: ['database', 'authentication'],
    dependents: ['visual-editor', 'admin-dashboard', 'workflow-system'],
    complexity: 'high',
    status: 'active',
    lastModified: new Date(),
    owner: 'Elena',
    description: '11 specialized AI agents with workflow coordination',
    tags: ['core', 'ai', 'coordination', 'elena']
  },
  {
    id: 'code-intelligence',
    name: 'Code Intelligence Features',
    type: 'component',
    path: '/client/src/components/visual-editor/CodeIntelligence.tsx',
    dependencies: ['syntax-highlighter', 'code-formatter'],
    dependents: ['visual-editor', 'file-editor'],
    complexity: 'medium',
    status: 'active',
    lastModified: new Date(),
    description: 'Category 3: Auto-completion, error detection, syntax highlighting',
    tags: ['category-3', 'code', 'intelligence', 'replit-parity']
  },
  {
    id: 'conversation-threading',
    name: 'Conversation Threading',
    type: 'feature',
    path: '/client/src/components/visual-editor/ConversationThread.tsx',
    dependencies: ['database', 'agent-system'],
    dependents: ['visual-editor', 'agent-chat'],
    complexity: 'medium',
    status: 'active',
    lastModified: new Date(),
    description: 'Category 1: Complete conversation management and threading',
    tags: ['category-1', 'threading', 'conversations', 'replit-parity']
  },
  {
    id: 'enhanced-input',
    name: 'Enhanced Input System',
    type: 'component',
    path: '/client/src/components/visual-editor/EnhancedInput.tsx',
    dependencies: ['draft-manager', 'history-manager'],
    dependents: ['visual-editor', 'agent-chat'],
    complexity: 'medium',
    status: 'active',
    lastModified: new Date(),
    description: 'Category 2: Rich input with auto-completion and history',
    tags: ['category-2', 'input', 'enhancement', 'replit-parity']
  }
];

const SAMPLE_WORKSPACE_INTELLIGENCE: WorkspaceIntelligence = {
  projectHealth: 87,
  codeComplexity: 72,
  dependencyScore: 91,
  organizationScore: 85,
  suggestions: [
    'Consider refactoring OptimizedVisualEditor.tsx (2800+ lines)',
    'Extract common UI patterns into reusable components',
    'Implement automated testing for Category 3 features',
    'Add TypeScript strict mode for enhanced type safety'
  ],
  hotspots: [
    'OptimizedVisualEditor.tsx - High complexity, frequent changes',
    'agent-personalities.ts - Large file, multiple responsibilities',
    'CodeIntelligence.tsx - New feature, needs monitoring'
  ],
  opportunities: [
    'Category 4 implementation ready - File management & workspace intelligence',
    'Performance optimization for large file handling',
    'Enhanced error handling across agent communication',
    'Automated code formatting and validation pipeline'
  ]
};

interface ProjectOrganizationProps {
  onStructureUpdate?: (structure: ProjectStructure[]) => void;
  onNavigateToFile?: (path: string) => void;
}

export function ProjectOrganization({
  onStructureUpdate,
  onNavigateToFile
}: ProjectOrganizationProps) {
  const [structure, setStructure] = useState<ProjectStructure[]>(SAMPLE_PROJECT_STRUCTURE);
  const [intelligence, setIntelligence] = useState<WorkspaceIntelligence>(SAMPLE_WORKSPACE_INTELLIGENCE);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'component' | 'feature' | 'service'>('all');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { toast } = useToast();

  // Filter structure items
  const filteredStructure = structure.filter(item => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterType !== 'all' && item.type !== filterType) {
      return false;
    }
    return true;
  });

  // Get complexity color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'deprecated': return 'bg-gray-100 text-gray-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'refactoring': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'component': return Code;
      case 'feature': return Package;
      case 'service': return Database;
      case 'utility': return Cog;
      case 'config': return Settings;
      case 'test': return Shield;
      default: return FileText;
    }
  };

  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);
    const item = structure.find(s => s.id === itemId);
    if (item) {
      onNavigateToFile?.(item.path);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <FolderTree className="w-5 h-5 mr-2" />
              Project Organization
            </CardTitle>
            <Badge variant="secondary" className="text-xs bg-black text-white">
              Category 4
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{intelligence.projectHealth}%</div>
              <div className="text-xs text-gray-600">Project Health</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{intelligence.codeComplexity}%</div>
              <div className="text-xs text-gray-600">Code Complexity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{intelligence.dependencyScore}%</div>
              <div className="text-xs text-gray-600">Dependencies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{intelligence.organizationScore}%</div>
              <div className="text-xs text-gray-600">Organization</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search project structure..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-sm border rounded px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="component">Components</option>
              <option value="feature">Features</option>
              <option value="service">Services</option>
            </select>

            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Project Structure */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Layers className="w-4 h-4 mr-2" />
              Project Structure
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {filteredStructure.map((item) => {
                const IconComponent = getTypeIcon(item.type);
                const isSelected = selectedItem === item.id;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemSelect(item.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        <IconComponent className="w-4 h-4 mt-0.5 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium truncate">{item.name}</span>
                            <Badge variant="secondary" className={`text-xs ${getComplexityColor(item.complexity)}`}>
                              {item.complexity}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {item.description}
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                              {item.status}
                            </Badge>
                            {item.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dependencies */}
                    {item.dependencies.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Depends on:</span>{' '}
                          {item.dependencies.slice(0, 3).join(', ')}
                          {item.dependencies.length > 3 && ` +${item.dependencies.length - 3} more`}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Workspace Intelligence */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Workspace Intelligence
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {/* Suggestions */}
            <div>
              <h6 className="text-xs font-medium text-gray-600 mb-2">AI Suggestions</h6>
              <div className="space-y-2">
                {intelligence.suggestions.map((suggestion, index) => (
                  <div key={index} className="p-2 bg-blue-50 rounded text-xs text-blue-800">
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>

            {/* Hotspots */}
            <div>
              <h6 className="text-xs font-medium text-gray-600 mb-2">Attention Needed</h6>
              <div className="space-y-2">
                {intelligence.hotspots.map((hotspot, index) => (
                  <div key={index} className="p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                    {hotspot}
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div>
              <h6 className="text-xs font-medium text-gray-600 mb-2">Opportunities</h6>
              <div className="space-y-2">
                {intelligence.opportunities.map((opportunity, index) => (
                  <div key={index} className="p-2 bg-green-50 rounded text-xs text-green-800">
                    {opportunity}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <Archive className="w-3 h-3 mr-1" />
                  Archive
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Docs
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Analytics
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Config
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}