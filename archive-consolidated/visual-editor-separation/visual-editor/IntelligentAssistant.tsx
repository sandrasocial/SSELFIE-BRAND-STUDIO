import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain,
  Lightbulb,
  MessageSquare,
  Zap,
  Target,
  BookOpen,
  Search,
  Cpu,
  Settings,
  HelpCircle,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Code,
  FileText,
  GitBranch,
  Eye,
  Send,
  ThumbsUp,
  ThumbsDown,
  Star,
  Clock,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Suggestion {
  id: string;
  type: 'optimization' | 'fix' | 'enhancement' | 'learning';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  impact: string;
  effort: string;
  category: string;
  actionable: boolean;
  automated: boolean;
}

interface ContextualHelp {
  id: string;
  trigger: string;
  title: string;
  content: string;
  type: 'tip' | 'warning' | 'info' | 'tutorial';
  relevance: number;
}

interface LearningResource {
  id: string;
  title: string;
  type: 'tutorial' | 'documentation' | 'example' | 'best-practice';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
  url?: string;
}

interface IntelligentAssistantProps {
  onApplySuggestion: (suggestionId: string) => void;
  onFeedback: (suggestionId: string, rating: 'positive' | 'negative') => void;
  onCustomQuery: (query: string) => void;
  onRequestTutorial: (topic: string) => void;
}

export const IntelligentAssistant: React.FC<IntelligentAssistantProps> = ({
  onApplySuggestion,
  onFeedback,
  onCustomQuery,
  onRequestTutorial
}) => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [queryInput, setQueryInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Mock suggestions data
  const [suggestions] = useState<Suggestion[]>([
    {
      id: 'opt-1',
      type: 'optimization',
      title: 'Optimize Component Re-renders',
      description: 'Use React.memo() for 3 components that re-render unnecessarily, potentially improving performance by 15%',
      priority: 'medium',
      confidence: 87,
      impact: 'Medium performance improvement',
      effort: '15 minutes',
      category: 'Performance',
      actionable: true,
      automated: true
    },
    {
      id: 'fix-1',
      type: 'fix',
      title: 'Fix Accessibility Issues',
      description: 'Add missing ARIA labels to 7 interactive elements to improve screen reader compatibility',
      priority: 'high',
      confidence: 95,
      impact: 'Improved accessibility compliance',
      effort: '30 minutes',
      category: 'Accessibility',
      actionable: true,
      automated: false
    },
    {
      id: 'enh-1',
      type: 'enhancement',
      title: 'Add Error Boundaries',
      description: 'Implement error boundaries in key components to improve error handling and user experience',
      priority: 'medium',
      confidence: 78,
      impact: 'Better error handling',
      effort: '45 minutes',
      category: 'Reliability',
      actionable: true,
      automated: false
    },
    {
      id: 'learn-1',
      type: 'learning',
      title: 'TypeScript Best Practices',
      description: 'Learn about advanced TypeScript patterns being used in your codebase for better type safety',
      priority: 'low',
      confidence: 92,
      impact: 'Improved code quality',
      effort: '2 hours',
      category: 'Education',
      actionable: false,
      automated: false
    }
  ]);

  const [contextualHelp] = useState<ContextualHelp[]>([
    {
      id: 'help-1',
      trigger: 'react-performance',
      title: 'React Performance Optimization',
      content: 'Use React DevTools Profiler to identify performance bottlenecks. Consider useMemo and useCallback for expensive computations.',
      type: 'tip',
      relevance: 85
    },
    {
      id: 'help-2',
      trigger: 'typescript-types',
      title: 'TypeScript Type Safety',
      content: 'Avoid using "any" type. Use union types, interfaces, and generic constraints for better type safety.',
      type: 'warning',
      relevance: 92
    },
    {
      id: 'help-3',
      trigger: 'testing-best-practices',
      title: 'Testing Strategy',
      content: 'Follow the testing pyramid: Unit tests (70%), Integration tests (20%), E2E tests (10%).',
      type: 'info',
      relevance: 78
    }
  ]);

  const [learningResources] = useState<LearningResource[]>([
    {
      id: 'tut-1',
      title: 'Advanced React Patterns',
      type: 'tutorial',
      difficulty: 'advanced',
      estimatedTime: '2 hours',
      tags: ['react', 'patterns', 'hooks', 'performance'],
      url: '#'
    },
    {
      id: 'doc-1',
      title: 'TypeScript Handbook',
      type: 'documentation',
      difficulty: 'intermediate',
      estimatedTime: '3 hours',
      tags: ['typescript', 'types', 'interfaces', 'generics']
    },
    {
      id: 'ex-1',
      title: 'Component Testing Examples',
      type: 'example',
      difficulty: 'beginner',
      estimatedTime: '1 hour',
      tags: ['testing', 'jest', 'react-testing-library']
    }
  ]);

  const handleApplySuggestion = (suggestionId: string) => {
    setIsProcessing(true);
    onApplySuggestion(suggestionId);
    
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: 'Suggestion Applied',
        description: 'The optimization has been implemented successfully',
      });
    }, 2000);
  };

  const handleCustomQuery = () => {
    if (!queryInput.trim()) return;
    
    setIsProcessing(true);
    onCustomQuery(queryInput);
    
    setTimeout(() => {
      setIsProcessing(false);
      setQueryInput('');
      toast({
        title: 'Query Processed',
        description: 'AI assistant has analyzed your request',
      });
    }, 1500);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'fix': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'enhancement': return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'learning': return <BookOpen className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getHelpTypeIcon = (type: string) => {
    switch (type) {
      case 'tip': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'tutorial': return <BookOpen className="w-4 h-4 text-green-500" />;
      default: return <HelpCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'advanced': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* AI Assistant Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Intelligent Assistant
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                AI-Powered
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRequestTutorial('assistant-features')}
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Smart Query Input */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Ask me anything about your code, performance, or best practices..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomQuery()}
                className="pr-10"
              />
              <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <Button
              onClick={handleCustomQuery}
              disabled={!queryInput.trim() || isProcessing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <Cpu className="w-4 h-4 animate-pulse" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assistant Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full bg-gray-100 rounded-md p-1">
          <TabsTrigger value="suggestions" className="flex-1 text-xs">Smart Suggestions</TabsTrigger>
          <TabsTrigger value="help" className="flex-1 text-xs">Contextual Help</TabsTrigger>
          <TabsTrigger value="learning" className="flex-1 text-xs">Learning Hub</TabsTrigger>
          <TabsTrigger value="insights" className="flex-1 text-xs">Code Insights</TabsTrigger>
        </TabsList>

        {/* Smart Suggestions Tab */}
        <TabsContent value="suggestions" className="flex-1 mt-4">
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      {getTypeIcon(suggestion.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm">{suggestion.title}</h4>
                          <Badge className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority}
                          </Badge>
                          {suggestion.automated && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Auto-fix
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Target className="w-3 h-3 mr-1" />
                            {suggestion.impact}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {suggestion.effort}
                          </span>
                          <span className="flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {suggestion.confidence}% confidence
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs mt-2">
                          {suggestion.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {suggestion.actionable && (
                        <Button
                          size="sm"
                          onClick={() => handleApplySuggestion(suggestion.id)}
                          disabled={isProcessing}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {suggestion.automated ? 'Auto-fix' : 'Apply'}
                        </Button>
                      )}
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onFeedback(suggestion.id, 'positive')}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onFeedback(suggestion.id, 'negative')}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contextual Help Tab */}
        <TabsContent value="help" className="flex-1 mt-4">
          <div className="space-y-3">
            {contextualHelp.map((help) => (
              <Card key={help.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {getHelpTypeIcon(help.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{help.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {help.relevance}% relevant
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              help.type === 'warning' ? 'bg-red-100 text-red-800' :
                              help.type === 'tip' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {help.type}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{help.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Learning Hub Tab */}
        <TabsContent value="learning" className="flex-1 mt-4">
          <div className="space-y-3">
            {learningResources.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-4 h-4 text-green-500" />
                      <div>
                        <h4 className="font-medium text-sm">{resource.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {resource.type}
                          </Badge>
                          <span className={`text-xs ${getDifficultyColor(resource.difficulty)}`}>
                            {resource.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">
                            {resource.estimatedTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onRequestTutorial(resource.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Code Insights Tab */}
        <TabsContent value="insights" className="flex-1 mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Code Analysis Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Recent Patterns Detected</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <Code className="w-3 h-3 text-blue-500" />
                          <span className="text-sm">React Hook Usage</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          15 instances
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-3 h-3 text-green-500" />
                          <span className="text-sm">TypeScript Interfaces</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          23 interfaces
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <GitBranch className="w-3 h-3 text-purple-500" />
                          <span className="text-sm">Complex Components</span>
                        </div>
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          3 need review
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Quality Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Code Complexity</span>
                        <span className="font-medium text-green-600">Good</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Type Coverage</span>
                        <span className="font-medium text-blue-600">92%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Component Reusability</span>
                        <span className="font-medium text-purple-600">High</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Performance Score</span>
                        <span className="font-medium text-green-600">87/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Smart Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 border rounded">
                    <Sparkles className="w-4 h-4 mt-0.5 text-purple-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Extract Custom Hook</div>
                      <div className="text-xs text-gray-600 mt-1">
                        The useFileManager logic in 3 components could be extracted into a reusable custom hook
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Apply
                    </Button>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded">
                    <Target className="w-4 h-4 mt-0.5 text-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Optimize Bundle</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Dynamic imports could reduce initial bundle size by ~200KB
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Analyze
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};