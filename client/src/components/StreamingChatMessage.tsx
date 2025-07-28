/**
 * STREAMING CHAT MESSAGE COMPONENT
 * 
 * Displays streaming text messages like Replit AI agents
 * Shows real-time typing effect with progress indicator
 */

import React from 'react';

interface StreamingChatMessageProps {
  id: string;
  type: 'user' | 'agent';
  content: string;
  isStreaming?: boolean;
  streamingContent?: string;
  agentName?: string;
  timestamp: string;
  progress?: number;
}

export const StreamingChatMessage: React.FC<StreamingChatMessageProps> = ({
  type,
  content,
  isStreaming,
  streamingContent,
  agentName,
  timestamp,
  progress
}) => {
  const displayContent = isStreaming ? streamingContent || '' : content;
  const showCursor = isStreaming && streamingContent;

  return (
    <div className={`mb-6 ${type === 'user' ? 'ml-auto max-w-2xl' : 'mr-auto max-w-4xl'}`}>
      {/* Agent Header */}
      {type === 'agent' && (
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {agentName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-light uppercase tracking-wider text-black">
              {agentName}
            </span>
            {isStreaming && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-black rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-black rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-black rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
                {progress && (
                  <span className="text-xs text-gray-500">{progress}%</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={`
        p-4 
        ${type === 'user' 
          ? 'bg-black text-white' 
          : 'bg-gray-50 text-black border border-gray-200'
        }
        ${type === 'user' ? 'rounded-sm' : 'border-l-4 border-l-black pl-6'}
      `}>
        <div className="whitespace-pre-wrap font-light leading-relaxed">
          {displayContent}
          {showCursor && (
            <span className="inline-block w-2 h-5 bg-black ml-1 animate-pulse"></span>
          )}
        </div>
        
        {/* Streaming Progress Bar */}
        {isStreaming && progress && (
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-black h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div className={`mt-2 text-xs text-gray-500 ${type === 'user' ? 'text-right' : 'text-left'}`}>
        {new Date(timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};