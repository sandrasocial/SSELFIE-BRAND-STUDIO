import React, { useEffect, useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

interface LiveComponentPreviewProps {
  fileContent: string;
  componentName?: string;
  type: 'component' | 'page' | 'api' | 'database' | 'styling';
}

export function LiveComponentPreview({ fileContent, componentName, type }: LiveComponentPreviewProps) {
  const [error, setError] = useState<string | null>(null);

  // Mock imports for common dependencies
  const mockImports = {
    'react': React,
    'lucide-react': {
      // Common icons from lucide-react that Victoria might use
      ChevronRight: () => <span>→</span>,
      ArrowRight: () => <span>→</span>,
      Star: () => <span>★</span>,
      Heart: () => <span>♥</span>,
      User: () => <span>👤</span>,
      Mail: () => <span>✉</span>,
      Phone: () => <span>📞</span>,
      MapPin: () => <span>📍</span>,
      Calendar: () => <span>📅</span>,
      Clock: () => <span>🕐</span>,
      Download: () => <span>⬇</span>,
      Upload: () => <span>⬆</span>,
      Search: () => <span>🔍</span>,
      Menu: () => <span>☰</span>,
      X: () => <span>✖</span>,
      Check: () => <span>✓</span>,
      AlertCircle: () => <span>⚠</span>,
    },
    '@/components/ui/button': {
      Button: ({ children, className, ...props }: any) => (
        <button className={`px-4 py-2 rounded ${className || ''}`} {...props}>
          {children}
        </button>
      )
    },
    '@/components/ui/card': {
      Card: ({ children, className, ...props }: any) => (
        <div className={`border rounded-lg ${className || ''}`} {...props}>
          {children}
        </div>
      ),
      CardHeader: ({ children, className, ...props }: any) => (
        <div className={`p-4 border-b ${className || ''}`} {...props}>
          {children}
        </div>
      ),
      CardContent: ({ children, className, ...props }: any) => (
        <div className={`p-4 ${className || ''}`} {...props}>
          {children}
        </div>
      )
    }
  };

  const processedHtml = useMemo(() => {
    if (!fileContent || type !== 'component') {
      return null;
    }

    try {
      setError(null);

      // Extract JSX from the component
      let jsxContent = fileContent;

      // Remove imports 
      jsxContent = jsxContent.replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '');

      // Extract the return statement JSX
      const returnMatch = jsxContent.match(/return\s*\(([\s\S]*?)\);?\s*(?:}|$)/);
      if (!returnMatch) {
        throw new Error('Could not find component return statement');
      }

      const jsxCode = returnMatch[1].trim();

      // Convert JSX to safe HTML for preview
      let previewHtml = jsxCode
        // Convert JSX syntax to HTML
        .replace(/className=/g, 'class=')
        .replace(/htmlFor=/g, 'for=')
        // Handle self-closing tags
        .replace(/<(\w+)([^>]*?)\s*\/>/g, '<$1$2></$1>')
        // Remove React-specific attributes and complex expressions
        .replace(/\{[^}]*\}/g, (match) => {
          // Keep simple string content, remove complex expressions
          const content = match.slice(1, -1).trim();
          if (content.startsWith('"') && content.endsWith('"')) {
            return content.slice(1, -1);
          }
          if (content.startsWith("'") && content.endsWith("'")) {
            return content.slice(1, -1);
          }
          // For simple variables or content, return placeholder
          if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(content)) {
            return `[${content}]`;
          }
          return '';
        });

      return previewHtml;

    } catch (err) {
      console.error('Component processing error:', err);
      setError(err.message);
      return null;
    }
  }, [fileContent, type]);

  // No longer using dynamic component state

  if (type !== 'component') {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-2">Live Preview not available</div>
        <div className="text-sm text-gray-500">
          Live preview is only available for React components. This is a {type} change.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="flex items-center space-x-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Preview Error</span>
        </div>
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
        <div className="mt-3 text-xs text-red-500">
          The component code will still be created correctly when approved. This preview system has limitations with complex React patterns.
        </div>
      </div>
    );
  }

  if (!processedHtml) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-2">Processing component...</div>
        <div className="text-sm text-gray-500">
          Generating live preview of the React component
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-3 py-2 text-xs text-gray-600 border-b">
        Live Preview - {componentName || 'React Component'}
      </div>
      <div className="p-6 bg-white min-h-[400px]">
        <div className="space-y-4">
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
            <strong>Live Preview:</strong> This is a simplified rendering of Victoria's component. 
            The actual implementation will include full React functionality, proper state management, and interactive features.
          </div>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div 
              className="live-preview-content"
              dangerouslySetInnerHTML={{ __html: processedHtml }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}