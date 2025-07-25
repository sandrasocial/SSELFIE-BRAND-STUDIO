import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { EnhancedSyntaxHighlighter } from './SyntaxHighlighter';

interface FormattedAgentMessageProps {
  content: string | undefined | null;
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

  // Extract meaningful description from context
  const extractCodeDescription = (beforeText: string, code: string): string => {
    // Look for component creation patterns
    if (code.includes('export function') || code.includes('export default')) {
      const componentMatch = code.match(/export\s+(?:function|default)\s+(\w+)/);
      if (componentMatch) {
        return `Creating ${componentMatch[1]} component with luxury styling and editorial design`;
      }
    }
    
    // Look for file modification patterns
    if (beforeText.includes('Creating') || beforeText.includes('Building')) {
      const descMatch = beforeText.match(/(?:Creating|Building)\s+([^.!]+)/i);
      if (descMatch) {
        return descMatch[1].trim();
      }
    }
    
    // Look for explicit descriptions in the text
    const sentences = beforeText.split(/[.!]\s+/);
    const lastSentence = sentences[sentences.length - 1];
    if (lastSentence && lastSentence.length > 10 && lastSentence.length < 100) {
      return lastSentence.trim();
    }
    
    // Default descriptions based on file types
    if (code.includes('interface') || code.includes('type')) {
      return 'TypeScript interfaces and type definitions';
    }
    if (code.includes('className') && code.includes('return')) {
      return 'React component with Tailwind CSS styling';
    }
    if (code.includes('app.') || code.includes('router.')) {
      return 'Express.js server routes and middleware';
    }
    
    return 'Code implementation with luxury design standards';
  };

  const formatMessage = (text: string | undefined | null) => {
    // Handle undefined/null text gracefully
    if (!text || typeof text !== 'string') {
      return <div className="text-gray-500 italic">No message content</div>;
    }

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

      // Extract description from context before code block
      const beforeText = text.slice(Math.max(0, match.index - 200), match.index);
      const description = extractCodeDescription(beforeText, match[2]);
      
      // Add code block with description
      const language = normalizeLanguage(match[1] || 'text');
      const code = match[2];
      const isExpanded = expandedBlocks.has(codeBlockIndex);
      
      parts.push(
        <div key={`code-${codeBlockIndex}`} className="mb-4">
          <div className="border border-black rounded-lg overflow-hidden">
            {/* Code block header with description */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-black uppercase tracking-wide">
                    {language}
                  </span>
                  <span className="text-xs text-gray-500">
                    {code.split('\n').length} lines
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleCodeBlock(codeBlockIndex)}
                  className="text-xs h-7 px-3 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white bg-blue-50"
                >
                  <span className="text-blue-600 text-xs font-mono mr-1">{'<>'}</span>
                  {isExpanded ? 'Collapse' : 'View Code'}
                </Button>
              </div>
              {description && (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            
            {/* Code content */}
            {isExpanded && (
              <div className="max-h-96 overflow-y-auto">
                <SyntaxHighlighter
                  language={language}
                  style={oneDark}
                  showLineNumbers={true}
                  wrapLines={true}
                  customStyle={{
                    margin: 0,
                    padding: '16px',
                    background: '#1e1e1e',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            )}
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

  const formatInlineText = (text: string | undefined | null) => {
    // Handle undefined/null text gracefully
    if (!text || typeof text !== 'string') {
      return '';
    }

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