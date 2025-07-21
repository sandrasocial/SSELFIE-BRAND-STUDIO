import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap,
  Play,
  Pause,
  Square,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Copy,
  GitBranch,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  Users,
  Target,
  ArrowRight,
  ArrowDown,
  MoreHorizontal,
  Code,
  Database,
  Globe,
  Shield,
  Mail,
  MessageSquare,
  FileText,
  Upload,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  description: string;
  config: Record<string, any>;
  duration?: number;
  error?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | 'archived';
  trigger: string;
  steps: WorkflowStep[];
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  successRate: number;
  averageDuration: number;
  category: string;
  tags: string[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedSetupTime: string;
  steps: Partial<WorkflowStep>[];
  popularity: number;
}

interface WorkflowAutomationProps {
  onCreateWorkflow: (template?: WorkflowTemplate) => void;
  onEditWorkflow: (workflowId: string) => void;
  onRunWorkflow: (workflowId: string) => void;
  onPauseWorkflow: (workflowId: string) => void;
  onDeleteWorkflow: (workflowId: string) => void;
  onDuplicateWorkflow: (workflowId: string) => void;
}

export const WorkflowAutomation: React.FC<WorkflowAutomationProps> = ({
  onCreateWorkflow,
  onEditWorkflow,
  onRunWorkflow,
  onPauseWorkflow,
  onDeleteWorkflow,
  onDuplicateWorkflow
}) => {
  const [activeTab, setActiveTab] = useState('workflows');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Mock workflows data
  const [workflows] = useState<Workflow[]>([
    {
      id: 'wf-1',
      name: 'Deploy on Push',
      description: 'Automatically deploy to staging when code is pushed to main branch',
      status: 'active',
      trigger: 'Git Push',
      steps: [
        {
          id: 'step-1',
          name: 'Code Quality Check',
          type: 'action',
          status: 'completed',
          description: 'Run linting and type checking',
          config: { linter: 'eslint', typescript: true }
        },
        {
          id: 'step-2',
          name: 'Run Tests',
          type: 'action',
          status: 'completed',
          description: 'Execute test suite',
          config: { testCommand: 'npm test', coverage: true }
        },
        {
          id: 'step-3',
          name: 'Build Application',
          type: 'action',
          status: 'running',
          description: 'Create production build',
          config: { buildCommand: 'npm run build' }
        },
        {
          id: 'step-4',
          name: 'Deploy to Staging',
          type: 'action',
          status: 'pending',
          description: 'Deploy to staging environment',
          config: { environment: 'staging', platform: 'vercel' }
        }
      ],
      lastRun: new Date('2025-01-21T10:30:00'),
      nextRun: undefined,
      runCount: 47,
      successRate: 96.2,
      averageDuration: 180,
      category: 'Deployment',
      tags: ['ci/cd', 'testing', 'deployment']
    },
    {
      id: 'wf-2',
      name: 'Weekly Reports',
      description: 'Generate and send weekly analytics reports to stakeholders',
      status: 'active',
      trigger: 'Schedule',
      steps: [
        {
          id: 'step-1',
          name: 'Collect Analytics',
          type: 'action',
          status: 'completed',
          description: 'Gather data from various sources',
          config: { sources: ['google-analytics', 'database', 'api'] }
        },
        {
          id: 'step-2',
          name: 'Generate Report',
          type: 'action',
          status: 'completed',
          description: 'Create formatted report',
          config: { format: 'pdf', template: 'weekly-summary' }
        },
        {
          id: 'step-3',
          name: 'Send Email',
          type: 'action',
          status: 'completed',
          description: 'Email report to recipients',
          config: { recipients: ['team@company.com'], subject: 'Weekly Analytics Report' }
        }
      ],
      lastRun: new Date('2025-01-20T09:00:00'),
      nextRun: new Date('2025-01-27T09:00:00'),
      runCount: 12,
      successRate: 100,
      averageDuration: 45,
      category: 'Reporting',
      tags: ['analytics', 'reporting', 'scheduled']
    },
    {
      id: 'wf-3',
      name: 'Security Scan',
      description: 'Daily security vulnerability scanning and alerts',
      status: 'paused',
      trigger: 'Schedule',
      steps: [
        {
          id: 'step-1',
          name: 'Dependency Scan',
          type: 'action',
          status: 'completed',
          description: 'Scan for vulnerable dependencies',
          config: { tool: 'npm-audit', severity: 'moderate' }
        },
        {
          id: 'step-2',
          name: 'Code Scan',
          type: 'action',
          status: 'failed',
          description: 'Static code analysis for security issues',
          config: { tool: 'sonarqube', rules: 'security' },
          error: 'API rate limit exceeded'
        },
        {
          id: 'step-3',
          name: 'Alert Team',
          type: 'condition',
          status: 'skipped',
          description: 'Send alerts if issues found',
          config: { condition: 'issues > 0', channel: 'slack' }
        }
      ],
      lastRun: new Date('2025-01-20T02:00:00'),
      nextRun: new Date('2025-01-22T02:00:00'),
      runCount: 89,
      successRate: 87.6,
      averageDuration: 120,
      category: 'Security',
      tags: ['security', 'scanning', 'alerts']
    }
  ]);

  const [workflowTemplates] = useState<WorkflowTemplate[]>([
    {
      id: 'template-1',
      name: 'CI/CD Pipeline',
      description: 'Complete continuous integration and deployment workflow',
      category: 'Deployment',
      complexity: 'medium',
      estimatedSetupTime: '15 minutes',
      steps: [
        { name: 'Code Quality Check', type: 'action', description: 'Lint and type check' },
        { name: 'Run Tests', type: 'action', description: 'Execute test suite' },
        { name: 'Build', type: 'action', description: 'Create production build' },
        { name: 'Deploy', type: 'action', description: 'Deploy to environment' }
      ],
      popularity: 95
    },
    {
      id: 'template-2',
      name: 'Code Review Automation',
      description: 'Automated code review and quality checks for pull requests',
      category: 'Quality',
      complexity: 'simple',
      estimatedSetupTime: '5 minutes',
      steps: [
        { name: 'PR Created', type: 'trigger', description: 'Triggered on new PR' },
        { name: 'Run Linter', type: 'action', description: 'Check code style' },
        { name: 'Security Scan', type: 'action', description: 'Scan for vulnerabilities' },
        { name: 'Post Results', type: 'action', description: 'Comment on PR' }
      ],
      popularity: 87
    },
    {
      id: 'template-3',
      name: 'Backup & Archive',
      description: 'Automated backup of important data and files',
      category: 'Maintenance',
      complexity: 'simple',
      estimatedSetupTime: '10 minutes',
      steps: [
        { name: 'Collect Files', type: 'action', description: 'Gather files to backup' },
        { name: 'Compress', type: 'action', description: 'Create compressed archive' },
        { name: 'Upload', type: 'action', description: 'Store in cloud storage' },
        { name: 'Cleanup', type: 'action', description: 'Remove old backups' }
      ],
      popularity: 72
    },
    {
      id: 'template-4',
      name: 'Performance Monitoring',
      description: 'Monitor application performance and send alerts',
      category: 'Monitoring',
      complexity: 'complex',
      estimatedSetupTime: '30 minutes',
      steps: [
        { name: 'Collect Metrics', type: 'action', description: 'Gather performance data' },
        { name: 'Analyze Trends', type: 'action', description: 'Detect performance issues' },
        { name: 'Check Thresholds', type: 'condition', description: 'Compare against limits' },
        { name: 'Send Alerts', type: 'action', description: 'Notify team of issues' }
      ],
      popularity: 83
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'draft': return <Edit3 className="w-4 h-4 text-gray-500" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'trigger': return <Zap className="w-3 h-3 text-purple-500" />;
      case 'action': return <Play className="w-3 h-3 text-blue-500" />;
      case 'condition': return <GitBranch className="w-3 h-3 text-orange-500" />;
      case 'delay': return <Clock className="w-3 h-3 text-gray-500" />;
      default: return <Settings className="w-3 h-3 text-gray-500" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'complex': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleRunWorkflow = (workflowId: string) => {
    onRunWorkflow(workflowId);
    toast({
      title: 'Workflow Started',
      description: 'The workflow is now running...',
    });
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesCategory = selectedCategory === 'all' || workflow.category.toLowerCase() === selectedCategory;
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredTemplates = workflowTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category.toLowerCase() === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Workflow Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Workflow Automation
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => onCreateWorkflow()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create
              </Button>
              <Button
                size="sm"
                variant="outline"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex items-center space-x-3">
            <select
              className="border rounded px-3 py-2 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="deployment">Deployment</option>
              <option value="quality">Quality</option>
              <option value="security">Security</option>
              <option value="reporting">Reporting</option>
              <option value="monitoring">Monitoring</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full bg-gray-100 rounded-md p-1">
          <TabsTrigger value="workflows" className="flex-1 text-xs">My Workflows</TabsTrigger>
          <TabsTrigger value="templates" className="flex-1 text-xs">Templates</TabsTrigger>
          <TabsTrigger value="runs" className="flex-1 text-xs">Recent Runs</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 text-xs">Analytics</TabsTrigger>
        </TabsList>

        {/* My Workflows Tab */}
        <TabsContent value="workflows" className="flex-1 mt-4">
          <div className="space-y-3">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      {getStatusIcon(workflow.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm">{workflow.name}</h4>
                          <Badge className={`text-xs ${
                            workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                            workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {workflow.status}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {workflow.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{workflow.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                          <span className="flex items-center">
                            <Target className="w-3 h-3 mr-1" />
                            {workflow.successRate}% success
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {workflow.averageDuration}s avg
                          </span>
                          <span className="flex items-center">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            {workflow.runCount} runs
                          </span>
                          {workflow.lastRun && (
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {workflow.lastRun.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {workflow.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {workflow.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => handleRunWorkflow(workflow.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Run
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditWorkflow(workflow.id)}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDuplicateWorkflow(workflow.id)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Workflow Steps Progress */}
                  <div className="border-t pt-3">
                    <div className="flex items-center space-x-2">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                            step.status === 'completed' ? 'bg-green-100 text-green-800' :
                            step.status === 'running' ? 'bg-blue-100 text-blue-800' :
                            step.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {getStatusIcon(step.status)}
                            <span>{step.name}</span>
                          </div>
                          {index < workflow.steps.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-gray-400 mx-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="flex-1 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <Badge className={`text-xs ${getComplexityColor(template.complexity)}`}>
                          {template.complexity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {template.estimatedSetupTime}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {template.popularity}% popularity
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onCreateWorkflow(template)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Use Template
                    </Button>
                  </div>

                  {/* Template Steps Preview */}
                  <div className="border-t pt-3">
                    <div className="space-y-2">
                      {template.steps.slice(0, 3).map((step, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          {getStepIcon(step.type || 'action')}
                          <span className="flex-1">{step.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {step.type}
                          </Badge>
                        </div>
                      ))}
                      {template.steps.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{template.steps.length - 3} more steps
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recent Runs Tab */}
        <TabsContent value="runs" className="flex-1 mt-4">
          <div className="space-y-3">
            {workflows.slice(0, 5).map((workflow) => (
              <Card key={`run-${workflow.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon('completed')}
                      <div>
                        <div className="font-medium text-sm">{workflow.name}</div>
                        <div className="text-xs text-gray-600">
                          {workflow.lastRun?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">Success</div>
                      <div className="text-xs text-gray-500">{workflow.averageDuration}s</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="flex-1 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Workflow Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">94.6%</div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">148</div>
                    <div className="text-xs text-gray-600">Total Runs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">127s</div>
                    <div className="text-xs text-gray-600">Avg Duration</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">8</div>
                    <div className="text-xs text-gray-600">Active Workflows</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Most Used Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflows.map((workflow, index) => (
                    <div key={workflow.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <span className="text-sm">{workflow.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={(workflow.runCount / 50) * 100} className="w-16 h-2" />
                        <span className="text-xs text-gray-500">{workflow.runCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};