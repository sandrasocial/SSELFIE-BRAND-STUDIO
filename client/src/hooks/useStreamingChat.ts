/**
 * STREAMING CHAT HOOK
 * 
 * React hook for real-time streaming chat like Replit AI agents
 * Provides word-by-word streaming text display
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface StreamingMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  isStreaming?: boolean;
  streamingContent?: string;
  agentName?: string;
  timestamp: string;
  progress?: number;
}

interface UseStreamingChatOptions {
  onMessageComplete?: (message: StreamingMessage) => void;
  onError?: (error: string) => void;
}

export const useStreamingChat = (options: UseStreamingChatOptions = {}) => {
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentStreamingMessageRef = useRef<string | null>(null);

  const { onMessageComplete, onError } = options;

  // Clean up EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const sendStreamingMessage = useCallback(async (
    agentName: string, 
    message: string, 
    conversationId?: string,
    fileEditMode: boolean = true
  ) => {
    setIsLoading(true);

    // Add user message immediately
    const userMessage: StreamingMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    // Create streaming agent message placeholder
    const agentMessageId = `agent-${Date.now()}`;
    const agentMessage: StreamingMessage = {
      id: agentMessageId,
      type: 'agent',
      content: '',
      isStreaming: true,
      streamingContent: '',
      agentName,
      timestamp: new Date().toISOString(),
      progress: 0
    };
    setMessages(prev => [...prev, agentMessage]);
    currentStreamingMessageRef.current = agentMessageId;

    try {
      // Create EventSource for streaming response
      const url = new URL('/api/claude/send-message-stream', window.location.origin);
      
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Send POST request to initiate streaming
      const response = await fetch('/api/claude/send-message-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sandra-admin-2025'
        },
        body: JSON.stringify({
          agentName,
          message,
          conversationId,
          fileEditMode
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Set up EventSource for streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No readable stream available');
      }

      let accumulatedContent = '';
      
      const readStream = async (): Promise<void> => {
        try {
          const { done, value } = await reader.read();
          
          if (done) {
            // Stream complete
            setMessages(prev => prev.map(msg => 
              msg.id === agentMessageId 
                ? { ...msg, isStreaming: false, content: accumulatedContent }
                : msg
            ));
            setIsLoading(false);
            currentStreamingMessageRef.current = null;
            
            if (onMessageComplete) {
              onMessageComplete({
                ...agentMessage,
                content: accumulatedContent,
                isStreaming: false
              });
            }
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'chunk') {
                  accumulatedContent = data.accumulatedText;
                  
                  setMessages(prev => prev.map(msg => 
                    msg.id === agentMessageId 
                      ? { 
                          ...msg, 
                          streamingContent: accumulatedContent,
                          progress: data.progress 
                        }
                      : msg
                  ));
                } else if (data.type === 'complete') {
                  accumulatedContent = data.finalText;
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', parseError);
              }
            }
          }

          // Continue reading
          readStream();
        } catch (error) {
          console.error('Stream reading error:', error);
          setIsLoading(false);
          if (onError) {
            onError(error instanceof Error ? error.message : 'Stream error');
          }
        }
      };

      await readStream();

    } catch (error) {
      console.error('Streaming error:', error);
      setIsLoading(false);
      currentStreamingMessageRef.current = null;
      
      // Update message with error
      setMessages(prev => prev.map(msg => 
        msg.id === agentMessageId 
          ? { 
              ...msg, 
              isStreaming: false, 
              content: 'Sorry, I encountered an error while processing your request.' 
            }
          : msg
      ));

      if (onError) {
        onError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }, [onMessageComplete, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    currentStreamingMessageRef.current = null;
  }, []);

  return {
    messages,
    isLoading,
    sendStreamingMessage,
    clearMessages
  };
};