import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  RotateCcw, 
  Wand2, 
  Sparkles, 
  RefreshCw,
  Zap,
  Brain,
  Target,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

interface RegenerationOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

interface MessageRegenerationProps {
  messageId: string;
  agentId: string;
  agentName: string;
  originalContent: string;
  conversationHistory: Array<{
    type: 'user' | 'agent';
    content: string;
    timestamp: Date;
  }>;
  onRegenerate: (newContent: string, regenerationType: string) => void;
  onShowAlternatives: (alternatives: string[]) => void;
  isLoading?: boolean;
}

const regenerationOptions: RegenerationOption[] = [
  {
    id: 'improve',
    label: 'Improve Response',
    description: 'Make the response clearer and more helpful',
    icon: <Sparkles className="w-4 h-4" />,
    prompt: 'Improve this response to be clearer, more detailed, and more helpful while maintaining the same core information.',
    temperature: 0.7
  },
  {
    id: 'shorter',
    label: 'Make Shorter',
    description: 'Create a more concise version',
    icon: <Target className="w-4 h-4" />,
    prompt: 'Create a shorter, more concise version of this response while keeping all essential information.',
    temperature: 0.5
  },
  {
    id: 'detailed',
    label: 'More Detailed',
    description: 'Expand with additional details and examples',
    icon: <Brain className="w-4 h-4" />,
    prompt: 'Expand this response with more details, examples, and comprehensive explanations.',
    temperature: 0.8
  },
  {
    id: 'technical',
    label: 'More Technical',
    description: 'Focus on technical implementation details',
    icon: <Settings className="w-4 h-4" />,
    prompt: 'Rewrite this response with more technical details, code examples, and implementation specifics.',
    temperature: 0.6
  },
  {
    id: 'creative',
    label: 'Different Approach',
    description: 'Try a completely different approach',
    icon: <Wand2 className="w-4 h-4" />,
    prompt: 'Provide an alternative approach or solution to the same problem, thinking from a different angle.',
    temperature: 0.9
  },
  {
    id: 'multiple',
    label: 'Multiple Options',
    description: 'Generate 3 different variations',
    icon: <RefreshCw className="w-4 h-4" />,
    prompt: 'Generate 3 different variations of this response, each with a different style or approach.',
    temperature: 0.8,
    maxTokens: 1500
  }
];

export function MessageRegeneration({
  messageId,
  agentId,
  agentName,
  originalContent,
  conversationHistory,
  onRegenerate,
  onShowAlternatives,
  isLoading = false
}: MessageRegenerationProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [regeneratingWith, setRegeneratingWith] = useState<string | null>(null);
  const { toast } = useToast();

  // Regenerate message mutation
  const regenerateMutation = useMutation({
    mutationFn: async ({ option, customPrompt }: { option: RegenerationOption; customPrompt?: string }) => {
      const response = await fetch('/api/admin/agents/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          messageId,
          originalContent,
          conversationHistory: conversationHistory.slice(-10), // Last 10 messages for context
          regenerationType: option.id,
          regenerationPrompt: customPrompt || option.prompt,
          temperature: option.temperature || 0.7,
          maxTokens: option.maxTokens || 1000,
          adminToken: 'sandra-admin-2025'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate message');
      }

      return response.json();
    },
    onSuccess: (data, { option }) => {
      setRegeneratingWith(null);
      setShowOptions(false);

      if (option.id === 'multiple' && data.alternatives) {
        onShowAlternatives(data.alternatives);
        toast({
          title: 'Multiple Options Generated',
          description: `Generated ${data.alternatives.length} alternative responses`
        });
      } else {
        onRegenerate(data.content, option.label);
        toast({
          title: 'Message Regenerated',
          description: `Response regenerated with "${option.label}" style`
        });
      }
    },
    onError: (error) => {
      setRegeneratingWith(null);
      toast({
        title: 'Regeneration Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleRegenerate = (option: RegenerationOption) => {
    setRegeneratingWith(option.id);
    regenerateMutation.mutate({ option });
  };

  const handleQuickRegenerate = () => {
    const defaultOption = regenerationOptions.find(opt => opt.id === 'improve')!;
    handleRegenerate(defaultOption);
  };

  return (
    <div className="relative">
      {/* Quick Regenerate Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleQuickRegenerate}
          disabled={isLoading || regenerateMutation.isPending}
          className="h-6 w-6 p-0 hover:bg-gray-100"
          title="Regenerate response"
        >
          {regeneratingWith === 'improve' ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <RotateCcw className="w-3 h-3" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOptions(!showOptions)}
          disabled={isLoading || regenerateMutation.isPending}
          className="h-6 px-2 text-xs hover:bg-gray-100"
        >
          <Zap className="w-3 h-3 mr-1" />
          Options
          {showOptions ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </Button>
      </div>

      {/* Regeneration Options */}
      {showOptions && (
        <Card className="absolute top-8 left-0 z-50 w-80 shadow-lg border border-gray-200">
          <CardContent className="p-4">
            <div className="mb-3">
              <h4 className="font-medium text-sm mb-1">Regeneration Options</h4>
              <p className="text-xs text-gray-600">Choose how to regenerate this {agentName} response</p>
            </div>
            
            <div className="space-y-2">
              {regenerationOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3 hover:bg-gray-50"
                  onClick={() => handleRegenerate(option)}
                  disabled={regenerateMutation.isPending}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      {regeneratingWith === option.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      ) : (
                        <div className="text-gray-500">{option.icon}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{option.label}</span>
                        {option.id === 'multiple' && (
                          <Badge variant="secondary" className="text-xs">3x</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{option.description}</p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOptions(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}