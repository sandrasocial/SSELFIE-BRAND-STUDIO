import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Download, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Code,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  fileName?: string;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
  maxHeight?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  showCopyButton?: boolean;
  showDownloadButton?: boolean;
  customStyle?: React.CSSProperties;
}

const LANGUAGE_EXTENSIONS = {
  'typescript': '.ts',
  'javascript': '.js',
  'tsx': '.tsx',
  'jsx': '.jsx',
  'css': '.css',
  'html': '.html',
  'json': '.json',
  'markdown': '.md',
  'bash': '.sh',
  'python': '.py',
  'yaml': '.yml',
  'sql': '.sql'
};

const LANGUAGE_COLORS = {
  'typescript': 'bg-blue-100 text-blue-800',
  'javascript': 'bg-yellow-100 text-yellow-800',
  'tsx': 'bg-blue-100 text-blue-800',
  'jsx': 'bg-yellow-100 text-yellow-800',
  'css': 'bg-purple-100 text-purple-800',
  'html': 'bg-orange-100 text-orange-800',
  'json': 'bg-green-100 text-green-800',
  'markdown': 'bg-gray-100 text-gray-800',
  'bash': 'bg-black text-white',
  'python': 'bg-green-100 text-green-800',
  'yaml': 'bg-indigo-100 text-indigo-800',
  'sql': 'bg-red-100 text-red-800'
};

export function EnhancedSyntaxHighlighter({
  code,
  language,
  fileName,
  showLineNumbers = true,
  wrapLines = false,
  maxHeight = '400px',
  collapsible = true,
  collapsed = false,
  onToggleCollapse,
  showCopyButton = true,
  showDownloadButton = false,
  customStyle = {}
}: SyntaxHighlighterProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [lineCount, setLineCount] = React.useState(0);

  React.useEffect(() => {
    setLineCount(code.split('\n').length);
  }, [code]);

  // Copy code to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: 'Copied',
        description: 'Code copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy code',
        variant: 'destructive',
      });
    }
  };

  // Download code as file
  const handleDownload = () => {
    const extension = LANGUAGE_EXTENSIONS[language as keyof typeof LANGUAGE_EXTENSIONS] || '.txt';
    const filename = fileName || `code${extension}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: `Code saved as ${filename}`,
    });
  };

  // Toggle expanded view
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Get language badge color
  const getBadgeColor = () => {
    return LANGUAGE_COLORS[language as keyof typeof LANGUAGE_COLORS] || 'bg-gray-100 text-gray-800';
  };

  const syntaxHighlighterStyle = {
    ...oneDark,
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      margin: 0,
      padding: '1rem',
      background: '#1e1e1e',
      maxHeight: isExpanded ? 'none' : maxHeight,
      overflow: isExpanded ? 'visible' : 'auto',
      fontSize: '14px',
      lineHeight: '1.5',
      ...customStyle
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      fontSize: '14px',
      lineHeight: '1.5'
    }
  };

  if (collapsed && collapsible) {
    return (
      <div className="border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Code className="w-4 h-4" />
            <span className="text-sm font-medium">{fileName || 'Code'}</span>
            <Badge variant="secondary" className={`text-xs ${getBadgeColor()}`}>
              {language}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {lineCount} lines
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1">
            {showCopyButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 w-6 p-0"
                title="Copy code"
              >
                <Copy className="w-3 h-3" />
              </Button>
            )}
            {showDownloadButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-6 w-6 p-0"
                title="Download code"
              >
                <Download className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="p-3 text-sm text-gray-500">
          {code.split('\n').slice(0, 2).join('\n')}
          {lineCount > 2 && <div className="mt-1">... ({lineCount - 2} more lines)</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
        <div className="flex items-center space-x-2">
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-6 w-6 p-0"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
          <Code className="w-4 h-4" />
          <span className="text-sm font-medium">{fileName || 'Code'}</span>
          <Badge variant="secondary" className={`text-xs ${getBadgeColor()}`}>
            {language}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {lineCount} lines
          </Badge>
        </div>
        
        <div className="flex items-center space-x-1">
          {showCopyButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 w-6 p-0"
              title="Copy code"
            >
              <Copy className="w-3 h-3" />
            </Button>
          )}
          {showDownloadButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-6 w-6 p-0"
              title="Download code"
            >
              <Download className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpand}
            className="h-6 w-6 p-0"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <EyeOff className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={syntaxHighlighterStyle}
          showLineNumbers={showLineNumbers}
          wrapLines={wrapLines}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#1e1e1e',
            maxHeight: isExpanded ? 'none' : maxHeight,
            overflow: isExpanded ? 'visible' : 'auto'
          }}
        >
          {code}
        </SyntaxHighlighter>

        {/* Line count indicator */}
        {!isExpanded && lineCount > 20 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {lineCount} lines
          </div>
        )}
      </div>

      {/* Expansion indicator */}
      {!isExpanded && code.length > 1000 && (
        <div className="p-2 bg-gray-50 border-t text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpand}
            className="text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Show full code ({lineCount} lines)
          </Button>
        </div>
      )}
    </div>
  );
}