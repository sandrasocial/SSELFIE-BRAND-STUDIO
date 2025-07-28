import { useState, useCallback } from 'react';

interface StreamingMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: string;
  agentName?: string;
  isStreaming?: boolean;
  streamingContent?: string;
  progress?: number;
}

interface UseStreamingChatProps {
  onMessageComplete?: (message: StreamingMessage) => void;
  onError?: (error: Error) => void;
}

export function useStreamingChat({ onMessageComplete, onError }: UseStreamingChatProps) {
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendStreamingMessage = useCallback(async (
    agentName: string,
    message: string,
    conversationId: string,
    fileEditMode: boolean = true
  ) => {
    // Add user message immediately
    const userMessage: StreamingMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    // Create streaming agent message
    const agentMessageId = (Date.now() + 1).toString();
    const agentMessage: StreamingMessage = {
      id: agentMessageId,
      type: 'agent',
      content: '',
      timestamp: new Date().toISOString(),
      agentName,
      isStreaming: true,
      streamingContent: '',
      progress: 0,
    };

    setMessages(prev => [...prev, agentMessage]);

    try {
      // Start streaming
      const response = await fetch('/api/claude/send-message-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sandra-admin-2025',
        },
        credentials: 'include',
        body: JSON.stringify({
          agentName,
          message,
          conversationId,
          fileEditMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.statusText}`);
      }

      // Handle Server-Sent Events
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let streamedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'chunk') {
                streamedContent += data.chunk;
                
                // Update the streaming message
                setMessages(prev => prev.map(msg => 
                  msg.id === agentMessageId 
                    ? { 
                        ...msg, 
                        streamingContent: streamedContent,
                        progress: data.progress || 0 
                      }
                    : msg
                ));
              } else if (data.type === 'complete') {
                // Finalize the message
                const finalMessage: StreamingMessage = {
                  ...agentMessage,
                  content: data.finalText || streamedContent,
                  isStreaming: false,
                  streamingContent: undefined,
                  progress: 100,
                };

                setMessages(prev => prev.map(msg => 
                  msg.id === agentMessageId ? finalMessage : msg
                ));

                onMessageComplete?.(finalMessage);
                break;
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      
      // Update message with error
      setMessages(prev => prev.map(msg => 
        msg.id === agentMessageId 
          ? { 
              ...msg, 
              content: `Error: ${error instanceof Error ? error.message : 'Failed to process request'}`,
              isStreaming: false,
              streamingContent: undefined
            }
          : msg
      ));

      onError?.(error instanceof Error ? error : new Error('Unknown streaming error'));
    } finally {
      setIsStreaming(false);
    }
  }, [onMessageComplete, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    sendStreamingMessage,
    clearMessages,
  };
}