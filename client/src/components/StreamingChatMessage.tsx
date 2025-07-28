import React from 'react';

interface StreamingChatMessageProps {
  id: string;
  type: 'user' | 'agent';
  content: string;
  agentName?: string;
  timestamp: string;
  isStreaming?: boolean;
  streamingContent?: string;
  progress?: number;
}

// Content cleaning utility functions
const cleanMessageContent = (content: string): string => {
  if (!content) return '';
  
  // Remove tool results sections
  let cleaned = content.replace(/\[File Operation:[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\[Codebase Search Results\][^]*?(?=\n\n|\n[A-Z]|$)/g, '');
  cleaned = cleaned.replace(/\[Tool Results\][^]*?(?=\n\n|\n[A-Z]|$)/g, '');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleaned = cleaned.trim();
  
  return cleaned;
};

export function StreamingChatMessage({
  id,
  type,
  content,
  agentName,
  timestamp,
  isStreaming = false,
  streamingContent = '',
  progress = 0
}: StreamingChatMessageProps) {
  // Use streaming content if available, otherwise use regular content
  const displayContent = isStreaming && streamingContent ? streamingContent : content;
  const cleanedContent = cleanMessageContent(displayContent);

  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] p-4 ${
        type === 'user' 
          ? 'bg-black text-white ml-4' 
          : 'bg-gray-50 text-black mr-4'
      }`}>
        {type === 'agent' && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wide text-gray-500">
              {agentName}
            </span>
            
            {/* Tool Usage Indicators */}
            {content.includes('[File Operation:') && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-sm">
                  File Edit
                </span>
              </div>
            )}
            {content.includes('[Codebase Search Results]') && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-sm">
                  Code Search
                </span>
              </div>
            )}
            
            {/* Streaming Indicator */}
            {isStreaming && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">Streaming... {progress}%</span>
              </div>
            )}
          </div>
        )}
        
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {cleanedContent}
          {isStreaming && <span className="animate-pulse">|</span>}
        </div>
        
        {timestamp && (
          <div className="text-xs text-gray-400 mt-2">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}