import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Code,
  IndentIncrease,
  IndentDecrease,
  AlignLeft,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeFormatterProps {
  code: string;
  language: string;
  onChange: (formattedCode: string) => void;
  formatOnType?: boolean;
}

interface FormatOptions {
  indentSize: number;
  indentType: 'spaces' | 'tabs';
  insertFinalNewline: boolean;
  trimTrailingWhitespace: boolean;
  maxLineLength: number;
  semicolons: boolean;
  quotes: 'single' | 'double';
  trailingComma: boolean;
  bracketSpacing: boolean;
}

const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  indentSize: 2,
  indentType: 'spaces',
  insertFinalNewline: true,
  trimTrailingWhitespace: true,
  maxLineLength: 100,
  semicolons: true,
  quotes: 'single',
  trailingComma: true,
  bracketSpacing: true
};

export function CodeFormatter({
  code,
  language,
  onChange,
  formatOnType = false
}: CodeFormatterProps) {
  const [options, setOptions] = useState<FormatOptions>(DEFAULT_FORMAT_OPTIONS);
  const [isFormatting, setIsFormatting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { toast } = useToast();

  // Format JavaScript/TypeScript code
  const formatJavaScript = (code: string, options: FormatOptions): string => {
    let formatted = code;

    // Basic indentation
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const indent = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);

    const formattedLines = lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) return '';

      // Decrease indent for closing brackets
      if (trimmedLine.startsWith('}') || trimmedLine.startsWith(']') || trimmedLine.startsWith(')'))) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indentedLine = indent.repeat(indentLevel) + trimmedLine;

      // Increase indent for opening brackets
      if (trimmedLine.endsWith('{') || trimmedLine.endsWith('[') || trimmedLine.endsWith('(')) {
        indentLevel++;
      }

      return indentedLine;
    });

    formatted = formattedLines.join('\n');

    // Add semicolons if required
    if (options.semicolons && (language === 'javascript' || language === 'typescript')) {
      formatted = formatted.replace(/(?<!;)\s*$/gm, (match, offset, string) => {
        const line = string.split('\n').find(l => string.indexOf(l) <= offset && offset < string.indexOf(l) + l.length);
        if (line && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}') && line.trim().length > 0) {
          return ';';
        }
        return match;
      });
    }

    // Handle quotes
    if (language === 'javascript' || language === 'typescript') {
      const quoteChar = options.quotes === 'single' ? "'" : '"';
      const otherQuote = options.quotes === 'single' ? '"' : "'";
      
      // Simple quote replacement (this is a basic implementation)
      formatted = formatted.replace(
        new RegExp(`${otherQuote}([^${otherQuote}]*?)${otherQuote}`, 'g'),
        `${quoteChar}$1${quoteChar}`
      );
    }

    // Trim trailing whitespace
    if (options.trimTrailingWhitespace) {
      formatted = formatted.replace(/[ \t]+$/gm, '');
    }

    // Insert final newline
    if (options.insertFinalNewline && !formatted.endsWith('\n')) {
      formatted += '\n';
    }

    return formatted;
  };

  // Format CSS code
  const formatCSS = (code: string, options: FormatOptions): string => {
    let formatted = code;
    const indent = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);

    // Basic CSS formatting
    formatted = formatted
      // Add spaces around colons
      .replace(/:\s*/g, ': ')
      // Add spaces after commas
      .replace(/,\s*/g, ', ')
      // Format opening braces
      .replace(/{\s*/g, ' {\n')
      // Format closing braces
      .replace(/;\s*}/g, ';\n}')
      // Format semicolons
      .replace(/;\s*/g, ';\n');

    // Apply indentation
    const lines = formatted.split('\n');
    let indentLevel = 0;
    
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return '';

      if (trimmedLine === '}') {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indentedLine = indent.repeat(indentLevel) + trimmedLine;

      if (trimmedLine.endsWith('{')) {
        indentLevel++;
      }

      return indentedLine;
    });

    return formattedLines.join('\n');
  };

  // Format JSON code
  const formatJSON = (code: string, options: FormatOptions): string => {
    try {
      const parsed = JSON.parse(code);
      const indentChar = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);
      return JSON.stringify(parsed, null, indentChar);
    } catch (error) {
      // If JSON is invalid, return original
      return code;
    }
  };

  // Format HTML code
  const formatHTML = (code: string, options: FormatOptions): string => {
    const indent = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);
    
    // Basic HTML formatting (simplified)
    let formatted = code
      // Add newlines after opening tags
      .replace(/>\s*</g, '>\n<')
      // Clean up whitespace
      .replace(/\s+/g, ' ');

    // Apply indentation to HTML
    const lines = formatted.split('\n');
    let indentLevel = 0;
    
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return '';

      // Closing tags
      if (trimmedLine.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indentedLine = indent.repeat(indentLevel) + trimmedLine;

      // Opening tags (but not self-closing)
      if (trimmedLine.startsWith('<') && !trimmedLine.startsWith('</') && !trimmedLine.endsWith('/>')) {
        indentLevel++;
      }

      return indentedLine;
    });

    return formattedLines.join('\n');
  };

  // Main format function
  const formatCode = async () => {
    setIsFormatting(true);
    
    try {
      let formatted = code;

      switch (language) {
        case 'javascript':
        case 'typescript':
        case 'jsx':
        case 'tsx':
          formatted = formatJavaScript(code, options);
          break;
        case 'css':
          formatted = formatCSS(code, options);
          break;
        case 'json':
          formatted = formatJSON(code, options);
          break;
        case 'html':
          formatted = formatHTML(code, options);
          break;
        default:
          // Basic formatting for other languages
          const indent = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);
          const lines = code.split('\n');
          formatted = lines.map(line => line.trim() ? line : '').join('\n');
      }

      onChange(formatted);
      
      toast({
        title: 'Code formatted',
        description: `Applied ${language} formatting rules`,
      });
    } catch (error) {
      toast({
        title: 'Format failed',
        description: 'Could not format code. Please check syntax.',
        variant: 'destructive',
      });
    } finally {
      setIsFormatting(false);
    }
  };

  // Quick format actions
  const quickFormat = {
    indent: () => {
      const indent = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);
      const lines = code.split('\n');
      const formatted = lines.map(line => line.trim() ? indent + line.trim() : line).join('\n');
      onChange(formatted);
    },
    unindent: () => {
      const lines = code.split('\n');
      const formatted = lines.map(line => {
        if (line.startsWith('\t')) return line.slice(1);
        if (line.startsWith(' '.repeat(options.indentSize))) return line.slice(options.indentSize);
        return line;
      }).join('\n');
      onChange(formatted);
    },
    trimWhitespace: () => {
      const formatted = code.replace(/[ \t]+$/gm, '');
      onChange(formatted);
    }
  };

  return (
    <div className="space-y-2">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={formatCode}
            disabled={isFormatting}
            className="bg-black text-white"
          >
            <Palette className="w-3 h-3 mr-1" />
            {isFormatting ? 'Formatting...' : 'Format Code'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={quickFormat.indent}
            title="Indent all lines"
          >
            <IndentIncrease className="w-3 h-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={quickFormat.unindent}
            title="Unindent all lines"
          >
            <IndentDecrease className="w-3 h-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={quickFormat.trimWhitespace}
            title="Trim trailing whitespace"
          >
            <AlignLeft className="w-3 h-3" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOptions(!showOptions)}
        >
          <Settings className="w-3 h-3 mr-1" />
          Options
        </Button>
      </div>

      {/* Format Options */}
      {showOptions && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Format Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Indent Settings */}
              <div>
                <label className="text-xs font-medium mb-1 block">Indent</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={options.indentType}
                    onChange={(e) => setOptions({...options, indentType: e.target.value as 'spaces' | 'tabs'})}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="spaces">Spaces</option>
                    <option value="tabs">Tabs</option>
                  </select>
                  {options.indentType === 'spaces' && (
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={options.indentSize}
                      onChange={(e) => setOptions({...options, indentSize: parseInt(e.target.value)})}
                      className="text-xs border rounded px-2 py-1 w-16"
                    />
                  )}
                </div>
              </div>

              {/* Line Length */}
              <div>
                <label className="text-xs font-medium mb-1 block">Max Line Length</label>
                <input
                  type="number"
                  min="40"
                  max="200"
                  value={options.maxLineLength}
                  onChange={(e) => setOptions({...options, maxLineLength: parseInt(e.target.value)})}
                  className="text-xs border rounded px-2 py-1 w-full"
                />
              </div>

              {/* JavaScript/TypeScript specific */}
              {(language === 'javascript' || language === 'typescript') && (
                <>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Quotes</label>
                    <select
                      value={options.quotes}
                      onChange={(e) => setOptions({...options, quotes: e.target.value as 'single' | 'double'})}
                      className="text-xs border rounded px-2 py-1 w-full"
                    >
                      <option value="single">Single (')</option>
                      <option value="double">Double (")</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="semicolons"
                      checked={options.semicolons}
                      onChange={(e) => setOptions({...options, semicolons: e.target.checked})}
                    />
                    <label htmlFor="semicolons" className="text-xs">Add semicolons</label>
                  </div>
                </>
              )}
            </div>

            {/* Boolean Options */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="trimWhitespace"
                  checked={options.trimTrailingWhitespace}
                  onChange={(e) => setOptions({...options, trimTrailingWhitespace: e.target.checked})}
                />
                <label htmlFor="trimWhitespace" className="text-xs">Trim trailing whitespace</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="finalNewline"
                  checked={options.insertFinalNewline}
                  onChange={(e) => setOptions({...options, insertFinalNewline: e.target.checked})}
                />
                <label htmlFor="finalNewline" className="text-xs">Insert final newline</label>
              </div>

              {(language === 'javascript' || language === 'typescript') && (
                <>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="trailingComma"
                      checked={options.trailingComma}
                      onChange={(e) => setOptions({...options, trailingComma: e.target.checked})}
                    />
                    <label htmlFor="trailingComma" className="text-xs">Trailing commas</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="bracketSpacing"
                      checked={options.bracketSpacing}
                      onChange={(e) => setOptions({...options, bracketSpacing: e.target.checked})}
                    />
                    <label htmlFor="bracketSpacing" className="text-xs">Bracket spacing</label>
                  </div>
                </>
              )}
            </div>

            {/* Format on Type */}
            <div className="pt-2 border-t">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="formatOnType"
                  checked={formatOnType}
                  onChange={(e) => {
                    // This would be handled by parent component
                    console.log('Format on type:', e.target.checked);
                  }}
                />
                <label htmlFor="formatOnType" className="text-xs">Format on type</label>
                <Badge variant="secondary" className="text-xs">
                  Pro
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}