import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown,
  ChevronRight,
  Palette,
  FileText,
  Settings,
  Lightbulb
} from 'lucide-react';

interface CodeIntelligenceProps {
  content: string;
  language?: string;
  onChange?: (content: string) => void;
  onLanguageChange?: (language: string) => void;
  showLineNumbers?: boolean;
  enableAutoComplete?: boolean;
  enableErrorDetection?: boolean;
  readOnly?: boolean;
}

interface CodeSuggestion {
  text: string;
  type: 'keyword' | 'function' | 'variable' | 'property' | 'snippet';
  description: string;
  insertText: string;
  documentation?: string;
}

interface CodeError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

const SUPPORTED_LANGUAGES = [
  'typescript', 'javascript', 'css', 'html', 'json', 'markdown', 'bash', 'python', 'jsx', 'tsx'
];

const LANGUAGE_KEYWORDS = {
  typescript: ['interface', 'type', 'class', 'function', 'const', 'let', 'var', 'import', 'export', 'async', 'await'],
  javascript: ['function', 'const', 'let', 'var', 'import', 'export', 'async', 'await', 'class', 'extends'],
  css: ['display', 'position', 'margin', 'padding', 'background', 'color', 'font-size', 'width', 'height'],
  html: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'img', 'a', 'button', 'input', 'form'],
  react: ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'Component', 'Fragment']
};

const CODE_SNIPPETS = {
  typescript: [
    { 
      trigger: 'interface', 
      text: 'interface ${1:Name} {\n  ${2:property}: ${3:type};\n}', 
      description: 'TypeScript interface' 
    },
    { 
      trigger: 'function', 
      text: 'function ${1:name}(${2:params}): ${3:returnType} {\n  ${4:// implementation}\n}', 
      description: 'TypeScript function' 
    },
    { 
      trigger: 'component', 
      text: 'interface ${1:Name}Props {\n  ${2:prop}: ${3:type};\n}\n\nexport function ${1:Name}({ ${2:prop} }: ${1:Name}Props) {\n  return (\n    <div>${4:content}</div>\n  );\n}', 
      description: 'React component with TypeScript' 
    }
  ],
  javascript: [
    { 
      trigger: 'function', 
      text: 'function ${1:name}(${2:params}) {\n  ${3:// implementation}\n}', 
      description: 'JavaScript function' 
    },
    { 
      trigger: 'arrow', 
      text: 'const ${1:name} = (${2:params}) => {\n  ${3:// implementation}\n};', 
      description: 'Arrow function' 
    }
  ],
  css: [
    { 
      trigger: 'flex', 
      text: 'display: flex;\njustify-content: ${1:center};\nalign-items: ${2:center};', 
      description: 'Flexbox layout' 
    },
    { 
      trigger: 'grid', 
      text: 'display: grid;\ngrid-template-columns: ${1:repeat(auto-fit, minmax(250px, 1fr))};\ngap: ${2:1rem};', 
      description: 'CSS Grid layout' 
    }
  ]
};

export function CodeIntelligence({
  content,
  language = 'typescript',
  onChange,
  onLanguageChange,
  showLineNumbers = true,
  enableAutoComplete = true,
  enableErrorDetection = true,
  readOnly = false
}: CodeIntelligenceProps) {
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState<CodeError[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  const [foldedLines, setFoldedLines] = useState<Set<number>>(new Set());
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect language from content
  const detectLanguage = (code: string): string => {
    if (code.includes('interface') || code.includes('type ') || code.includes(': string')) return 'typescript';
    if (code.includes('function') || code.includes('const ') || code.includes('let ')) return 'javascript';
    if (code.includes('display:') || code.includes('margin:') || code.includes('{') && code.includes('}')) return 'css';
    if (code.includes('<div') || code.includes('<span') || code.includes('<!DOCTYPE')) return 'html';
    if (code.includes('"') && code.includes(':') && code.includes('{')) return 'json';
    return language;
  };

  // Get code suggestions based on current input
  const getCodeSuggestions = (input: string, position: number): CodeSuggestion[] => {
    const lines = input.split('\n');
    const currentLine = lines[cursorPosition.line] || '';
    const beforeCursor = currentLine.slice(0, cursorPosition.column);
    const words = beforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1] || '';

    const suggestions: CodeSuggestion[] = [];

    // Keyword suggestions
    const keywords = LANGUAGE_KEYWORDS[language as keyof typeof LANGUAGE_KEYWORDS] || [];
    keywords.forEach(keyword => {
      if (keyword.toLowerCase().startsWith(currentWord.toLowerCase()) && currentWord.length > 0) {
        suggestions.push({
          text: keyword,
          type: 'keyword',
          description: `${language} keyword`,
          insertText: keyword
        });
      }
    });

    // Snippet suggestions
    const snippets = CODE_SNIPPETS[language as keyof typeof CODE_SNIPPETS] || [];
    snippets.forEach(snippet => {
      if (snippet.trigger.toLowerCase().startsWith(currentWord.toLowerCase()) && currentWord.length > 0) {
        suggestions.push({
          text: snippet.trigger,
          type: 'snippet',
          description: snippet.description,
          insertText: snippet.text
        });
      }
    });

    // React-specific suggestions
    if (language === 'typescript' || language === 'javascript') {
      LANGUAGE_KEYWORDS.react.forEach(hook => {
        if (hook.toLowerCase().startsWith(currentWord.toLowerCase()) && currentWord.length > 0) {
          suggestions.push({
            text: hook,
            type: 'function',
            description: 'React hook',
            insertText: hook
          });
        }
      });
    }

    return suggestions.slice(0, 10); // Limit to 10 suggestions
  };

  // Basic syntax error detection
  const detectErrors = (code: string): CodeError[] => {
    const errors: CodeError[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      // Basic bracket matching
      const openBrackets = (line.match(/\{/g) || []).length;
      const closeBrackets = (line.match(/\}/g) || []).length;
      
      if (openBrackets > closeBrackets + 1) {
        errors.push({
          line: index + 1,
          column: line.length,
          message: 'Unclosed bracket',
          severity: 'warning'
        });
      }

      // Missing semicolon (TypeScript/JavaScript)
      if ((language === 'typescript' || language === 'javascript') && 
          line.trim().length > 0 && 
          !line.trim().endsWith(';') && 
          !line.trim().endsWith('{') && 
          !line.trim().endsWith('}') &&
          !line.trim().startsWith('//') &&
          !line.trim().startsWith('import') &&
          !line.trim().startsWith('export')) {
        errors.push({
          line: index + 1,
          column: line.length,
          message: 'Missing semicolon',
          severity: 'info'
        });
      }

      // Undefined variables (basic detection)
      if (language === 'typescript' || language === 'javascript') {
        const undefinedMatches = line.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g) || [];
        // This is a simplified check - in a real implementation, you'd use a proper parser
      }
    });

    return errors;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onChange?.(newContent);

    // Update cursor position
    const textarea = e.target;
    const lines = newContent.slice(0, textarea.selectionStart).split('\n');
    const newCursorPos = {
      line: lines.length - 1,
      column: lines[lines.length - 1].length
    };
    setCursorPosition(newCursorPos);

    // Auto-detect language
    const detectedLang = detectLanguage(newContent);
    if (detectedLang !== language) {
      onLanguageChange?.(detectedLang);
    }

    // Get suggestions
    if (enableAutoComplete) {
      const newSuggestions = getCodeSuggestions(newContent, textarea.selectionStart);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedSuggestion(0);
    }

    // Detect errors
    if (enableErrorDetection) {
      const newErrors = detectErrors(newContent);
      setErrors(newErrors);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : suggestions.length - 1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion(prev => prev < suggestions.length - 1 ? prev + 1 : 0);
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestion]);
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }

    // Auto-formatting shortcuts
    if (e.key === 'Tab' && !showSuggestions) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.slice(0, start) + '  ' + content.slice(end);
        onChange?.(newContent);
        
        setTimeout(() => {
          textarea.setSelectionRange(start + 2, start + 2);
        }, 0);
      }
    }
  };

  // Apply code suggestion
  const applySuggestion = (suggestion: CodeSuggestion) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const lines = content.split('\n');
    const currentLine = lines[cursorPosition.line] || '';
    const beforeCursor = currentLine.slice(0, cursorPosition.column);
    const afterCursor = currentLine.slice(cursorPosition.column);
    
    // Replace the current word with the suggestion
    const words = beforeCursor.split(/\s+/);
    words[words.length - 1] = suggestion.insertText;
    const newLine = words.join(' ') + afterCursor;
    
    lines[cursorPosition.line] = newLine;
    const newContent = lines.join('\n');
    
    onChange?.(newContent);
    setShowSuggestions(false);
  };

  // Format code
  const formatCode = () => {
    if (language === 'json') {
      try {
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        onChange?.(formatted);
      } catch (error) {
        // Invalid JSON, don't format
      }
    }
    // Additional formatting logic for other languages could be added here
  };

  // Get line numbers
  const getLineNumbers = () => {
    const lines = content.split('\n');
    return lines.map((_, index) => index + 1);
  };

  // Check if line should be folded
  const isFoldableLine = (lineIndex: number): boolean => {
    const lines = content.split('\n');
    const line = lines[lineIndex];
    return line.includes('{') || line.includes('function') || line.includes('class') || line.includes('interface');
  };

  // Toggle line folding
  const toggleFold = (lineIndex: number) => {
    const newFolded = new Set(foldedLines);
    if (newFolded.has(lineIndex)) {
      newFolded.delete(lineIndex);
    } else {
      newFolded.add(lineIndex);
    }
    setFoldedLines(newFolded);
  };

  return (
    <div className="relative">
      {/* Language and Tools Bar */}
      <div className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded border">
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4" />
          <select
            value={language}
            onChange={(e) => onLanguageChange?.(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
          <Badge variant="secondary" className="text-xs">
            {errors.length} {errors.length === 1 ? 'issue' : 'issues'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={formatCode}
            className="h-6 text-xs"
            title="Format code"
          >
            <Palette className="w-3 h-3 mr-1" />
            Format
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="h-6 text-xs"
            title="Toggle suggestions"
          >
            <Lightbulb className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="relative border border-gray-200 rounded">
        {showLineNumbers && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r border-gray-200 p-2 text-xs text-gray-500 font-mono">
            {getLineNumbers().map((lineNum, index) => (
              <div key={lineNum} className="flex items-center h-5 leading-5">
                {isFoldableLine(index) && (
                  <button
                    onClick={() => toggleFold(index)}
                    className="mr-1 hover:bg-gray-200 rounded"
                  >
                    {foldedLines.has(index) ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}
                <span>{lineNum}</span>
              </div>
            ))}
          </div>
        )}
        
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`w-full h-64 p-2 font-mono text-sm resize-none outline-none ${
            showLineNumbers ? 'pl-14' : 'pl-2'
          }`}
          placeholder={`Enter your ${language} code here...`}
          readOnly={readOnly}
          spellCheck={false}
        />

        {/* Error indicators */}
        {errors.length > 0 && (
          <div className="absolute right-2 top-2 space-y-1">
            {errors.slice(0, 5).map((error, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  error.severity === 'error' ? 'bg-red-500' :
                  error.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                title={`Line ${error.line}: ${error.message}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Code Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-24 left-0 right-0 z-50 border border-gray-200 shadow-lg">
          <CardContent className="p-2">
            <div className="text-xs text-gray-500 mb-2 flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              Code Suggestions (Tab to accept)
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-2 rounded text-sm cursor-pointer ${
                    index === selectedSuggestion ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => applySuggestion(suggestion)}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center text-xs ${
                    suggestion.type === 'keyword' ? 'bg-blue-100 text-blue-800' :
                    suggestion.type === 'function' ? 'bg-green-100 text-green-800' :
                    suggestion.type === 'snippet' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {suggestion.type === 'keyword' ? 'K' :
                     suggestion.type === 'function' ? 'F' :
                     suggestion.type === 'snippet' ? 'S' : 'V'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{suggestion.text}</div>
                    <div className="text-xs opacity-60">{suggestion.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Panel */}
      {errors.length > 0 && (
        <Card className="mt-2 border-red-200">
          <CardContent className="p-2">
            <div className="text-xs text-red-600 mb-2 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Code Issues ({errors.length})
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {errors.map((error, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    error.severity === 'error' ? 'bg-red-500' :
                    error.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-gray-600">Line {error.line}:</span>
                  <span>{error.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}