import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FormattedAgentMessageProps {
  content: string;
  agentName?: string;
  timestamp: Date;
}

export function FormattedAgentMessage({ content, agentName, timestamp }: FormattedAgentMessageProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());

  const toggleCodeBlock = (index: number) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const formatMessage = (text: string) => {
    const parts = [];
    let currentIndex = 0;
    let codeBlockIndex = 0;

    // Split by code blocks first
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > currentIndex) {
        const beforeText = text.slice(currentIndex, match.index);
        parts.push(
          <div key={`text-${currentIndex}`} className="mb-2">
            {formatInlineText(beforeText)}
          </div>
        );
      }

      // Add code block
      const language = normalizeLanguage(match[1] || 'text');
      const code = match[2];
      const isExpanded = expandedBlocks.has(codeBlockIndex);
      
      parts.push(
        <div key={`code-${codeBlockIndex}`} className="mb-3">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Code block header */}
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-600 uppercase">
                  {language}
                </span>
                <span className="text-xs text-gray-400">
                  {code.split('\n').length} lines
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCodeBlock(codeBlockIndex)}
                className="text-xs h-6 px-2"
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
            </div>
            
            {/* Code content */}
            <div className={`relative ${isExpanded ? '' : 'max-h-32 overflow-hidden'}`}>
              <SyntaxHighlighter
                language={language}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '12px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  backgroundColor: '#1e1e1e'
                }}
                showLineNumbers={isExpanded}
                wrapLines={true}
                wrapLongLines={true}
              >
                {code}
              </SyntaxHighlighter>
              {!isExpanded && code.split('\n').length > 8 && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
              )}
            </div>
          </div>
        </div>
      );

      currentIndex = match.index + match[0].length;
      codeBlockIndex++;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      parts.push(
        <div key={`text-${currentIndex}`} className="mb-2">
          {formatInlineText(remainingText)}
        </div>
      );
    }

    return parts;
  };

  const formatInlineText = (text: string) => {
    // Convert markdown formatting
    let formatted = text;
    
    // Bold **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    
    // Italic *text*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Inline code `text`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono border">$1</code>');
    
    // Headers ### text
    formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold mt-3 mb-2 text-gray-900">$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mt-4 mb-2 text-gray-900">$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="text-xl font-semibold mt-4 mb-3 text-gray-900">$1</h1>');
    
    // Links [text](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Process lines for lists and paragraphs
    const lines = formatted.split('\n');
    let inList = false;
    let inOrderedList = false;
    const processedLines = lines.map((line, index) => {
      const trimmed = line.trim();
      
      // Handle bullet lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('✓ ')) {
        if (!inList) {
          inList = true;
          return `<ul class="list-disc list-inside space-y-1 my-3 ml-4"><li class="text-sm leading-relaxed">${trimmed.substring(2)}</li>`;
        }
        return `<li class="text-sm leading-relaxed">${trimmed.substring(2)}</li>`;
      }
      
      // Handle numbered lists
      else if (/^\d+\.\s/.test(trimmed)) {
        if (!inOrderedList) {
          inOrderedList = true;
          return `<ol class="list-decimal list-inside space-y-1 my-3 ml-4"><li class="text-sm leading-relaxed">${trimmed.replace(/^\d+\.\s/, '')}</li>`;
        }
        return `<li class="text-sm leading-relaxed">${trimmed.replace(/^\d+\.\s/, '')}</li>`;
      }
      
      // End lists
      else if ((inList || inOrderedList) && trimmed === '') {
        const closeTag = inList ? '</ul>' : '</ol>';
        inList = false;
        inOrderedList = false;
        return closeTag;
      }
      
      // Continue with regular text after list
      else if ((inList || inOrderedList) && trimmed !== '') {
        const closeTag = inList ? '</ul>' : '</ol>';
        inList = false;
        inOrderedList = false;
        return `${closeTag}<p class="text-sm leading-relaxed mt-2">${line}</p>`;
      }
      
      // Regular paragraphs
      else if (trimmed !== '') {
        return `<p class="text-sm leading-relaxed mt-2 first:mt-0">${line}</p>`;
      }
      
      // Empty lines
      else {
        return '<div class="h-2"></div>';
      }
    });
    
    // Close any open lists
    if (inList) {
      processedLines.push('</ul>');
    }
    if (inOrderedList) {
      processedLines.push('</ol>');
    }

    return (
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: processedLines.join('')
            .replace(/(<p[^>]*>)\s*<\/p>/g, '') // Remove empty paragraphs
            .replace(/<div class="h-2"><\/div>(<\/[ou]l>)/g, '$1') // Remove spacing before list ends
        }} 
      />
    );
  };

  const normalizeLanguage = (language: string) => {
    const langMap: Record<string, string> = {
      'typescript': 'typescript',
      'tsx': 'tsx',
      'javascript': 'javascript',
      'jsx': 'jsx',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'bash': 'bash',
      'shell': 'bash',
      'js': 'javascript',
      'ts': 'typescript'
    };
    return langMap[language.toLowerCase()] || 'text';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Agent header */}
      {agentName && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {agentName.charAt(0)}
                </span>
              </div>
              <div>
                <span className="font-medium text-sm text-gray-900">{agentName}</span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Active</span>
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {timestamp instanceof Date ? timestamp.toLocaleTimeString() : new Date(timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Formatted content */}
      <div className="p-4">
        <div className="space-y-1">
          {formatMessage(content)}
        </div>
      </div>
    </div>
  );
}