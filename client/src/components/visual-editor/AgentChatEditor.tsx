import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  Code, 
  Eye, 
  Settings,
  Wand2,
  Save,
  Download,
  Upload,
  Image,
  Type,
  Layout
} from 'lucide-react';
import { ReplitStyleEditor } from './ReplitStyleEditor';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  agentId?: string;
  agentName?: string;
  timestamp: Date;
  hasPreview?: boolean;
  previewContent?: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'active' | 'busy' | 'offline';
  expertise: string[];
}

const agents: Agent[] = [
  {
    id: 'aria',
    name: 'Aria',
    role: 'UX Designer AI',
    status: 'active',
    expertise: ['Design', 'UI/UX', 'Visual Editor', 'Components']
  },
  {
    id: 'zara',
    name: 'Zara',
    role: 'Dev AI',
    status: 'active',
    expertise: ['Development', 'Code', 'API', 'Technical']
  },
  {
    id: 'rachel',
    name: 'Rachel',
    role: 'Voice AI',
    status: 'active',
    expertise: ['Copywriting', 'Content', 'Voice', 'Marketing']
  }
];

export function AgentChatEditor() {
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'editor'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send to agent with conversation history
      const conversationHistory = messages.map(msg => ({
        type: msg.type,
        content: msg.content
      }));

      const response = await apiRequest('POST', '/api/admin/agent-chat-bypass', {
        agentId: selectedAgent.id,
        message: inputMessage,
        conversationHistory,
        context: {
          currentEditorContent: editorContent,
          requestType: 'visual-editor-chat'
        }
      });

      const data = await response.json();

      if (data.success) {
        const agentMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: data.message,
          agentId: selectedAgent.id,
          agentName: selectedAgent.name,
          timestamp: new Date(),
          hasPreview: data.message.includes('```') || data.message.includes('component') || data.message.includes('design'),
          previewContent: extractPreviewContent(data.message)
        };

        setMessages(prev => [...prev, agentMessage]);

        // If agent provided code or design changes, offer to apply them
        if (agentMessage.hasPreview && agentMessage.previewContent) {
          toast({
            title: `${selectedAgent.name} has suggestions`,
            description: 'Check the editor preview and apply changes if you like them.',
          });
        }
      } else {
        throw new Error(data.error || 'Failed to get agent response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Chat Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractPreviewContent = (message: string): string | undefined => {
    // Extract code blocks or HTML content from agent message
    const codeBlockMatch = message.match(/```(?:html|jsx|tsx)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1];
    }

    // Look for HTML-like content
    const htmlMatch = message.match(/<[^>]+>[\s\S]*<\/[^>]+>/);
    if (htmlMatch) {
      return htmlMatch[0];
    }

    return undefined;
  };

  const applyAgentSuggestion = (previewContent: string) => {
    setEditorContent(previewContent);
    
    // Also try to inject changes into live preview if available
    try {
      const visualEditorComponent = document.querySelector('.visual-editor-iframe');
      if (visualEditorComponent) {
        // Signal to the visual editor to apply changes
        const event = new CustomEvent('applyAgentChanges', { 
          detail: { content: previewContent } 
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.log('Live preview update attempted');
    }
    
    setActiveTab('editor');
    toast({
      title: 'Changes Applied',
      description: 'Agent suggestions applied to editor and live preview.',
    });
  };

  const quickActions = [
    {
      label: 'Design Landing Page',
      prompt: 'Create a luxury editorial landing page for SSELFIE Studio with Times New Roman typography and minimal design',
      icon: <Type className="w-4 h-4" />
    },
    {
      label: 'Redesign Workspace',
      prompt: 'Redesign the workspace section with luxury editorial styling, better layout, and improved user flow',
      icon: <Layout className="w-4 h-4" />
    },
    {
      label: 'Enhance Navigation',
      prompt: 'Improve the navigation design with better typography, spacing, and luxury brand feel',
      icon: <Settings className="w-4 h-4" />
    },
    {
      label: 'Add Image Gallery',
      prompt: 'Add a beautiful image gallery section that showcases AI-generated photos in a grid layout',
      icon: <Image className="w-4 h-4" />
    },
    {
      label: 'Create Pricing Cards',
      prompt: 'Design elegant pricing cards for FREE and €47/month plans with luxury styling',
      icon: <Wand2 className="w-4 h-4" />
    },
    {
      label: 'Optimize Mobile',
      prompt: 'Review the current platform and suggest improvements for mobile responsiveness and visual hierarchy',
      icon: <Code className="w-4 h-4" />
    }
  ];

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Chat Panel */}
      <div className="w-96 bg-white border-r flex flex-col">
        {/* Agent Selector */}
        <div className="p-4 border-b">
          <h3 className="font-medium mb-3">Active Agents</h3>
          <div className="space-y-2">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedAgent.id === agent.id
                    ? 'bg-black text-white border-black'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{agent.name}</div>
                    <div className={`text-xs ${selectedAgent.id === agent.id ? 'text-gray-200' : 'text-gray-500'}`}>
                      {agent.role}
                    </div>
                  </div>
                  <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                    {agent.status}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b">
          <h4 className="font-medium text-sm mb-2">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(action.prompt)}
                className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border text-left flex items-center space-x-1"
              >
                {action.icon}
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Start chatting with {selectedAgent.name}!</p>
                <p className="text-xs text-gray-400 mt-1">Ask for design help, code changes, or content updates.</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-black text-white' : 'bg-gray-100'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-full ${
                    message.type === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {message.hasPreview && message.previewContent && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyAgentSuggestion(message.previewContent!)}
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Apply to Editor
                      </Button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">
                    {selectedAgent.name} is thinking...
                  </p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask ${selectedAgent.name} for help...`}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="font-medium">Visual Editor</h2>
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'chat' ? 'bg-black text-white' : 'bg-gray-100'
                }`}
              >
                Chat Focus
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'editor' ? 'bg-black text-white' : 'bg-gray-100'
                }`}
              >
                Editor Focus
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Visual Editor */}
        <div className="flex-1">
          <ReplitStyleEditor
            initialContent={editorContent}
            onContentChange={setEditorContent}
            onSave={(content) => {
              console.log('Saving content:', content);
              toast({
                title: 'Content Saved',
                description: 'Your changes have been saved successfully.',
              });
            }}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}