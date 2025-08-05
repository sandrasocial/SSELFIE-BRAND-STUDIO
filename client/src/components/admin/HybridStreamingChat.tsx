import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Zap, Cloud, HardDrive, CheckCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    processingType?: 'local' | 'hybrid' | 'selective_cloud' | 'cached_pattern';
    tokensUsed?: number;
    tokensSaved?: number;
    processingTime?: number;
  };
}

interface StreamingData {
  type: 'agent_start' | 'text_delta' | 'completion' | 'error' | 'code_generation';
  content?: string;
  agentName?: string;
  message?: string;
  processingType?: string;
  tokensUsed?: number;
  tokensSaved?: number;
  error?: string;
  filePath?: string;
}

const AGENT_PERSONALITIES = {
  elena: { name: 'Elena', role: 'AI Agent Director & CEO', color: 'bg-purple-100 text-purple-800' },
  aria: { name: 'Aria', role: 'Brand Strategist', color: 'bg-blue-100 text-blue-800' },
  zara: { name: 'Zara', role: 'Technical Lead', color: 'bg-green-100 text-green-800' },
  maya: { name: 'Maya', role: 'AI Photographer', color: 'bg-pink-100 text-pink-800' },
  victoria: { name: 'Victoria', role: 'Website Builder', color: 'bg-indigo-100 text-indigo-800' },
  rachel: { name: 'Rachel', role: 'Content Creator', color: 'bg-yellow-100 text-yellow-800' },
  ava: { name: 'Ava', role: 'Automation Specialist', color: 'bg-teal-100 text-teal-800' },
  quinn: { name: 'Quinn', role: 'Analytics Expert', color: 'bg-orange-100 text-orange-800' },
  olga: { name: 'Olga', role: 'System Administrator', color: 'bg-red-100 text-red-800' }
};

export function HybridStreamingChat() {
  const [selectedAgent, setSelectedAgent] = useState<string>('maya');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [currentMetadata, setCurrentMetadata] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const getProcessingIcon = (type: string) => {
    switch (type) {
      case 'local': return <HardDrive className="h-4 w-4 text-green-500" />;
      case 'cached_pattern': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'selective_cloud': return <Cloud className="h-4 w-4 text-blue-500" />;
      case 'hybrid': return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default: return <Loader2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isStreaming) return;

    const userMessage: Message = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsStreaming(true);
    setStreamingContent('');
    setCurrentMetadata({});

    try {
      const response = await fetch('/api/consulting-agents/consulting-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sandra-admin-2025',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          agentId: selectedAgent,
          message: userMessage.content,
          conversationId: `hybrid-chat-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if it's a streaming response
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                // Finalize streaming
                if (streamingContent.trim()) {
                  const assistantMessage: Message = {
                    role: 'assistant',
                    content: streamingContent,
                    timestamp: new Date(),
                    metadata: currentMetadata
                  };
                  setMessages(prev => [...prev, assistantMessage]);
                }
                setIsStreaming(false);
                setStreamingContent('');
                return;
              }

              try {
                const parsed: StreamingData = JSON.parse(data);
                
                switch (parsed.type) {
                  case 'agent_start':
                    setStreamingContent(`${parsed.agentName} is ${parsed.message || 'processing your request'}...`);
                    break;
                  
                  case 'text_delta':
                    setStreamingContent(prev => prev + (parsed.content || ''));
                    break;
                  
                  case 'completion':
                    setCurrentMetadata({
                      processingType: parsed.processingType,
                      tokensUsed: parsed.tokensUsed || 0,
                      tokensSaved: parsed.tokensSaved || 0
                    });
                    break;
                    
                  case 'code_generation':
                    setStreamingContent(prev => prev + `\n\n✅ **File Created**: \`${parsed.filePath}\``);
                    break;
                  
                  case 'error':
                    setStreamingContent(prev => prev + `\n\n❌ **Error**: ${parsed.error}`);
                    break;
                }
              } catch (e) {
                console.warn('Failed to parse streaming data:', data);
              }
            }
          }
        }
      } else {
        // Handle regular JSON response
        const data = await response.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response || 'No response received',
          timestamp: new Date(),
          metadata: {
            processingType: data.processingType,
            tokensUsed: data.tokensUsed || 0,
            tokensSaved: data.tokensSaved || 0,
            processingTime: data.processingTime
          }
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Agent Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Hybrid Intelligence Streaming Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {Object.entries(AGENT_PERSONALITIES).map(([id, agent]) => (
              <Button
                key={id}
                variant={selectedAgent === id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedAgent(id)}
                className="text-xs"
              >
                {agent.name}
              </Button>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Selected: <Badge className={AGENT_PERSONALITIES[selectedAgent as keyof typeof AGENT_PERSONALITIES]?.color}>
              {AGENT_PERSONALITIES[selectedAgent as keyof typeof AGENT_PERSONALITIES]?.name} - {AGENT_PERSONALITIES[selectedAgent as keyof typeof AGENT_PERSONALITIES]?.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="h-96">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="h-80 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm">{msg.content}</div>
                {msg.metadata && (
                  <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                    {getProcessingIcon(msg.metadata.processingType || '')}
                    <span>{msg.metadata.processingType}</span>
                    {msg.metadata.tokensUsed !== undefined && (
                      <span>• {msg.metadata.tokensUsed} tokens</span>
                    )}
                    {msg.metadata.tokensSaved !== undefined && msg.metadata.tokensSaved > 0 && (
                      <span className="text-green-600">• Saved {msg.metadata.tokensSaved}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Streaming Content */}
          {isStreaming && streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-900">
                <div className="text-sm">{streamingContent}</div>
                <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Streaming...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${AGENT_PERSONALITIES[selectedAgent as keyof typeof AGENT_PERSONALITIES]?.name} anything...`}
              rows={3}
              disabled={isStreaming}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isStreaming}
              size="lg"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}