import { useState, forwardRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Check,
  User,
  Bot
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FormattedAgentMessageProps {
  content: string;
  agentName: string;
  agentId: string;
  timestamp: Date;
  isUser?: boolean;
}

export function FormattedAgentMessage({ 
  content, 
  agentName, 
  agentId, 
  timestamp, 
  isUser = false 
}: FormattedAgentMessageProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set());

  const toggleBlock = (index: number) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedBlocks(newExpanded);
  };

  const copyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedBlocks(prev => new Set([...prev, index]));
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const formatMessage = (text: string) => {
    // Split by code blocks
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        content: match[2] || '',
        language: match[1] || 'text'
      });

      lastIndex = codeBlockRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return parts.map((part, index) => {
      if (part.type === 'code') {
        const isExpanded = expandedBlocks.has(blockIndex);
        const isCopied = copiedBlocks.has(blockIndex);
        const currentBlockIndex = blockIndex;
        blockIndex++;

        const lineCount = part.content.split('\n').length;
        const preview = part.content.split('\n').slice(0, 3).join('\n');
        const hasMore = lineCount > 3;

        return (
          <div key={index} className="my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBlock(currentBlockIndex)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
                <Badge variant="secondary" className="text-xs">
                  {part.language}
                </Badge>
                {hasMore && !isExpanded && (
                  <span className="text-xs text-gray-500">
                    {lineCount} lines
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyCode(part.content, currentBlockIndex)}
                className="h-6 w-6 p-0"
              >
                {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            
            <div className="relative">
              <SyntaxHighlighter
                language={part.language === 'typescript' ? 'typescript' : part.language}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  fontSize: '13px',
                  lineHeight: '1.4',
                }}
                showLineNumbers={isExpanded}
                wrapLines={true}
                wrapLongLines={true}
              >
                {isExpanded ? part.content : preview + (hasMore ? '\n...' : '')}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      } else {
        // Format text with markdown-like formatting
        return (
          <div key={index} className="prose dark:prose-invert max-w-none">
            {formatText(part.content)}
          </div>
        );
      }
    });
  };

  const formatText = (text: string) => {
    // Split by paragraphs and format each one
    return text.split('\n\n').map((paragraph, pIndex) => {
      if (!paragraph.trim()) return null;

      // Handle headers
      if (paragraph.startsWith('##')) {
        return (
          <h3 key={pIndex} className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">
            {paragraph.replace(/^##\s*/, '')}
          </h3>
        );
      }
      
      if (paragraph.startsWith('#')) {
        return (
          <h2 key={pIndex} className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">
            {paragraph.replace(/^#\s*/, '')}
          </h2>
        );
      }

      // Handle lists
      if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter(line => line.trim().startsWith('- '));
        return (
          <ul key={pIndex} className="list-disc list-inside my-2 space-y-1">
            {items.map((item, iIndex) => (
              <li key={iIndex} className="text-gray-700 dark:text-gray-300">
                {formatInlineText(item.replace(/^-\s*/, ''))}
              </li>
            ))}
          </ul>
        );
      }

      // Handle numbered lists
      if (/^\d+\./.test(paragraph.trim())) {
        const items = paragraph.split('\n').filter(line => /^\d+\./.test(line.trim()));
        return (
          <ol key={pIndex} className="list-decimal list-inside my-2 space-y-1">
            {items.map((item, iIndex) => (
              <li key={iIndex} className="text-gray-700 dark:text-gray-300">
                {formatInlineText(item.replace(/^\d+\.\s*/, ''))}
              </li>
            ))}
          </ol>
        );
      }

      // Regular paragraph
      return (
        <p key={pIndex} className="text-gray-700 dark:text-gray-300 my-2 leading-relaxed">
          {formatInlineText(paragraph)}
        </p>
      );
    }).filter(Boolean);
  };

  const formatInlineText = (text: string) => {
    // Handle inline code
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      
      // Handle bold text
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((boldPart, boldIndex) => {
        if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
          return (
            <strong key={`${index}-${boldIndex}`} className="font-semibold text-gray-900 dark:text-gray-100">
              {boldPart.slice(2, -2)}
            </strong>
          );
        }
        
        // Handle italic text
        const italicParts = boldPart.split(/(\*[^*]+\*)/g);
        return italicParts.map((italicPart, italicIndex) => {
          if (italicPart.startsWith('*') && italicPart.endsWith('*') && !italicPart.startsWith('**')) {
            return (
              <em key={`${index}-${boldIndex}-${italicIndex}`} className="italic">
                {italicPart.slice(1, -1)}
              </em>
            );
          }
          return italicPart;
        });
      });
    });
  };

  const getAgentAvatar = (agentId: string) => {
    const avatarMap: Record<string, string> = {
      'elena': 'E',
      'aria': 'A', 
      'zara': 'Z',
      'rachel': 'R',
      'maya': 'M',
      'ava': 'A',
      'quinn': 'Q',
      'sophia': 'S',
      'martha': 'M',
      'diana': 'D',
      'wilma': 'W',
      'olga': 'O',
      'flux': 'F',
      'victoria': 'V'
    };
    
    return avatarMap[agentId.toLowerCase()] || agentName.charAt(0).toUpperCase();
  };

  return (
    <Card className="mb-4 border-l-4 border-l-blue-500">
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isUser 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          }`}>
            {isUser ? <User className="h-4 w-4" /> : getAgentAvatar(agentId)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {isUser ? 'You' : agentName}
            </span>
            <Badge variant="outline" className="text-xs">
              {isUser ? 'User' : agentId}
            </Badge>
            <span className="text-xs text-gray-500">
              {timestamp.toLocaleTimeString()}
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Active" />
          </div>
          
          <div className="text-sm">
            {formatMessage(content)}
          </div>
        </div>
      </div>
    </Card>
  );
}