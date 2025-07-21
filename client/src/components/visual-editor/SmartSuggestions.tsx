import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Lightbulb, 
  Wand2, 
  Target, 
  Zap, 
  Brain,
  Code,
  Palette,
  Settings,
  Search,
  Clock,
  TrendingUp,
  Star,
  ArrowRight,
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SmartSuggestion {
  id: string;
  type: 'quick_action' | 'context_aware' | 'workflow' | 'code_completion' | 'optimization' | 'template';
  title: string;
  description: string;
  confidence: number;
  category: string;
  action: string;
  icon: React.ReactNode;
  shortcut?: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  relevanceScore: number;
  usage?: number;
}

interface SmartSuggestionsProps {
  agentId: string;
  agentName: string;
  conversationHistory: Array<{
    type: 'user' | 'agent';
    content: string;
    timestamp: Date;
  }>;
  currentInput: string;
  projectContext?: {
    files: string[];
    currentFile?: string;
    recentActions: string[];
    codebase: string[];
  };
  onSuggestionSelect: (suggestion: SmartSuggestion) => void;
  onInputChange: (value: string) => void;
  isVisible?: boolean;
}

export function SmartSuggestions({
  agentId,
  agentName,
  conversationHistory,
  currentInput,
  projectContext,
  onSuggestionSelect,
  onInputChange,
  isVisible = true
}: SmartSuggestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  // Generate context-aware suggestions based on conversation and project state
  const suggestions = useMemo(() => {
    const baseSuggestions: SmartSuggestion[] = [];

    // Context-aware suggestions based on agent type and recent conversation
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    const recentUserMessages = conversationHistory.filter(m => m.type === 'user').slice(-3);
    
    // Agent-specific suggestions
    if (agentId === 'aria') {
      baseSuggestions.push(
        {
          id: 'aria-luxury-component',
          type: 'quick_action',
          title: 'Create Luxury Component',
          description: 'Design a new component with Times New Roman typography and editorial styling',
          confidence: 0.9,
          category: 'Design',
          action: 'Create a luxury component with Times New Roman headlines, clean spacing, and editorial magazine layout style.',
          icon: <Palette className="w-4 h-4" />,
          tags: ['luxury', 'component', 'typography'],
          priority: 'high',
          relevanceScore: 0.95,
          usage: 12
        },
        {
          id: 'aria-layout-optimization',
          type: 'optimization',
          title: 'Optimize Page Layout',
          description: 'Analyze and improve current page layout for better visual hierarchy',
          confidence: 0.85,
          category: 'Design',
          action: 'Review the current page layout and suggest improvements for visual hierarchy, spacing, and editorial design principles.',
          icon: <Target className="w-4 h-4" />,
          tags: ['layout', 'hierarchy', 'optimization'],
          priority: 'medium',
          relevanceScore: 0.8,
          usage: 8
        }
      );
    }

    if (agentId === 'zara') {
      baseSuggestions.push(
        {
          id: 'zara-performance-audit',
          type: 'optimization',
          title: 'Performance Audit',
          description: 'Analyze application performance and suggest optimizations',
          confidence: 0.9,
          category: 'Performance',
          action: 'Run a comprehensive performance audit of the current application and provide specific optimization recommendations.',
          icon: <TrendingUp className="w-4 h-4" />,
          tags: ['performance', 'audit', 'optimization'],
          priority: 'high',
          relevanceScore: 0.9,
          usage: 15
        },
        {
          id: 'zara-code-review',
          type: 'quick_action',
          title: 'Code Review',
          description: 'Review recent code changes for best practices and improvements',
          confidence: 0.85,
          category: 'Development',
          action: 'Review the latest code changes and provide feedback on best practices, potential improvements, and code quality.',
          icon: <Code className="w-4 h-4" />,
          tags: ['code', 'review', 'quality'],
          priority: 'medium',
          relevanceScore: 0.75,
          usage: 10
        }
      );
    }

    if (agentId === 'elena') {
      baseSuggestions.push(
        {
          id: 'elena-workflow-optimization',
          type: 'workflow',
          title: 'Create Multi-Agent Workflow',
          description: 'Design and execute a coordinated workflow with multiple agents',
          confidence: 0.95,
          category: 'Coordination',
          action: 'Create a strategic workflow that coordinates multiple agents to accomplish a complex task efficiently.',
          icon: <Wand2 className="w-4 h-4" />,
          tags: ['workflow', 'coordination', 'strategy'],
          priority: 'high',
          relevanceScore: 0.98,
          usage: 20
        },
        {
          id: 'elena-project-analysis',
          type: 'context_aware',
          title: 'Strategic Project Analysis',
          description: 'Analyze current project status and provide strategic recommendations',
          confidence: 0.9,
          category: 'Strategy',
          action: 'Provide a comprehensive analysis of the current project status and strategic recommendations for next steps.',
          icon: <Brain className="w-4 h-4" />,
          tags: ['analysis', 'strategy', 'project'],
          priority: 'high',
          relevanceScore: 0.9,
          usage: 18
        }
      );
    }

    // Context-aware suggestions based on current input
    if (currentInput.length > 0) {
      if (currentInput.toLowerCase().includes('fix') || currentInput.toLowerCase().includes('error')) {
        baseSuggestions.push({
          id: 'debug-assistance',
          type: 'context_aware',
          title: 'Debug and Fix Issues',
          description: 'Comprehensive debugging assistance for the reported issue',
          confidence: 0.85,
          category: 'Debugging',
          action: `Help debug and fix the issue: "${currentInput.slice(0, 50)}..."`,
          icon: <Settings className="w-4 h-4" />,
          tags: ['debug', 'fix', 'error'],
          priority: 'high',
          relevanceScore: 0.9,
          usage: 5
        });
      }

      if (currentInput.toLowerCase().includes('create') || currentInput.toLowerCase().includes('build')) {
        baseSuggestions.push({
          id: 'creation-assistance',
          type: 'context_aware',
          title: 'Creation Assistance',
          description: 'Help create or build the requested feature',
          confidence: 0.8,
          category: 'Development',
          action: `Assist with creating: "${currentInput.slice(0, 50)}..."`,
          icon: <Sparkles className="w-4 h-4" />,
          tags: ['create', 'build', 'feature'],
          priority: 'high',
          relevanceScore: 0.85,
          usage: 3
        });
      }

      if (currentInput.toLowerCase().includes('optimize') || currentInput.toLowerCase().includes('improve')) {
        baseSuggestions.push({
          id: 'optimization-assistance',
          type: 'optimization',
          title: 'Optimization Assistance',
          description: 'Help optimize or improve the specified area',
          confidence: 0.8,
          category: 'Optimization',
          action: `Provide optimization assistance for: "${currentInput.slice(0, 50)}..."`,
          icon: <Zap className="w-4 h-4" />,
          tags: ['optimize', 'improve', 'enhancement'],
          priority: 'medium',
          relevanceScore: 0.8,
          usage: 4
        });
      }
    }

    // Recent context suggestions
    if (lastMessage && lastMessage.type === 'agent' && lastMessage.content.length > 100) {
      baseSuggestions.push({
        id: 'follow-up-question',
        type: 'context_aware',
        title: 'Ask Follow-up Question',
        description: 'Ask a clarifying question about the previous response',
        confidence: 0.7,
        category: 'Conversation',
        action: 'Can you provide more details about the previous response?',
        icon: <ArrowRight className="w-4 h-4" />,
        tags: ['follow-up', 'clarification'],
        priority: 'low',
        relevanceScore: 0.6,
        usage: 2
      });
    }

    // Project-specific suggestions based on current file
    if (projectContext?.currentFile) {
      const fileExtension = projectContext.currentFile.split('.').pop();
      if (fileExtension === 'tsx' || fileExtension === 'jsx') {
        baseSuggestions.push({
          id: 'component-enhancement',
          type: 'code_completion',
          title: 'Enhance React Component',
          description: 'Suggest improvements for the current React component',
          confidence: 0.8,
          category: 'Development',
          action: `Analyze and enhance the React component in ${projectContext.currentFile}`,
          icon: <Code className="w-4 h-4" />,
          tags: ['react', 'component', 'enhancement'],
          priority: 'medium',
          relevanceScore: 0.75,
          usage: 6
        });
      }
    }

    // Quick templates based on agent
    const templateSuggestions = [
      {
        id: 'quick-bug-report',
        type: 'template' as const,
        title: 'Bug Report Template',
        description: 'Structured bug report format',
        confidence: 0.7,
        category: 'Templates',
        action: 'I found a bug: [describe the issue]\nSteps to reproduce: [list steps]\nExpected behavior: [describe expected]\nActual behavior: [describe actual]',
        icon: <Settings className="w-4 h-4" />,
        tags: ['template', 'bug', 'report'],
        priority: 'low' as const,
        relevanceScore: 0.5,
        usage: 1
      },
      {
        id: 'feature-request',
        type: 'template' as const,
        title: 'Feature Request Template',
        description: 'Structured feature request format',
        confidence: 0.7,
        category: 'Templates',
        action: 'Feature Request: [feature name]\nDescription: [detailed description]\nBenefit: [why this feature is needed]\nPriority: [high/medium/low]',
        icon: <Lightbulb className="w-4 h-4" />,
        tags: ['template', 'feature', 'request'],
        priority: 'low' as const,
        relevanceScore: 0.5,
        usage: 1
      }
    ];

    return [...baseSuggestions, ...templateSuggestions].sort((a, b) => {
      // Sort by priority, then relevance score, then usage
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return (b.usage || 0) - (a.usage || 0);
    });
  }, [agentId, conversationHistory, currentInput, projectContext]);

  // Filter suggestions based on category and search
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => {
      const matchesCategory = selectedCategory === 'all' || suggestion.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = !searchTerm || 
        suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suggestion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [suggestions, selectedCategory, searchTerm]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(suggestions.map(s => s.category))];
    return cats;
  }, [suggestions]);

  const handleSuggestionClick = (suggestion: SmartSuggestion) => {
    onInputChange(suggestion.action);
    onSuggestionSelect(suggestion);
    
    toast({
      title: 'Suggestion Applied',
      description: `Applied: ${suggestion.title}`
    });
  };

  if (!isVisible || filteredSuggestions.length === 0) return null;

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <h4 className="font-medium text-sm">Smart Suggestions</h4>
            <Badge variant="outline" className="text-xs">
              {filteredSuggestions.length}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs"
          >
            <Filter className="w-3 h-3 mr-1" />
            {showAdvanced ? 'Simple' : 'Advanced'}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">Search Suggestions</label>
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search suggestions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 text-xs h-8"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-1">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs h-6"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggestions List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredSuggestions.slice(0, showAdvanced ? 20 : 6).map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`p-1 rounded ${
                    suggestion.priority === 'high' ? 'bg-green-100 text-green-600' :
                    suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {suggestion.icon}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-sm truncate">{suggestion.title}</h5>
                    
                    <div className="flex items-center gap-1">
                      {suggestion.confidence > 0.8 && (
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      )}
                      
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          suggestion.priority === 'high' ? 'border-green-300 text-green-700' :
                          suggestion.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-gray-300 text-gray-700'
                        }`}
                      >
                        {suggestion.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {suggestion.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {suggestion.usage && suggestion.usage > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {suggestion.usage}
                        </span>
                      )}
                      
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredSuggestions.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <div className="text-sm">No suggestions found</div>
              <div className="text-xs">Try adjusting your search or category filter</div>
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredSuggestions.length > 6 && !showAdvanced && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(true)}
              className="text-xs"
            >
              Show {filteredSuggestions.length - 6} more suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}