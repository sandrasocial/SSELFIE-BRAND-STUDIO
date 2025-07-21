import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  FilePlus, 
  FileEdit, 
  Trash2, 
  Check, 
  X, 
  Eye, 
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  Diff,
  ChevronDown,
  ChevronRight,
  Folder,
  Code,
  Image,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FileOperation {
  id: string;
  type: 'create' | 'read' | 'write' | 'delete' | 'move' | 'copy';
  path: string;
  success: boolean;
  error?: string;
  preview?: string;
  originalContent?: string;
  newContent?: string;
  size?: number;
  timestamp: Date;
  agentId: string;
  agentName: string;
}

interface FileOperationDisplayProps {
  operations: FileOperation[];
  messageId: string;
  onApplyOperation: (operationId: string) => void;
  onRevertOperation: (operationId: string) => void;
  onPreviewFile: (path: string) => void;
  onOpenFile: (path: string) => void;
  showDiffs?: boolean;
}

export function FileOperationDisplay({
  operations,
  messageId,
  onApplyOperation,
  onRevertOperation,
  onPreviewFile,
  onOpenFile,
  showDiffs = true
}: FileOperationDisplayProps) {
  const [expandedOperations, setExpandedOperations] = useState<Set<string>>(new Set());
  const [previewMode, setPreviewMode] = useState<'diff' | 'preview' | 'code'>('diff');
  const { toast } = useToast();

  const toggleOperation = (operationId: string) => {
    const newExpanded = new Set(expandedOperations);
    if (newExpanded.has(operationId)) {
      newExpanded.delete(operationId);
    } else {
      newExpanded.add(operationId);
    }
    setExpandedOperations(newExpanded);
  };

  const getOperationIcon = (type: string, success: boolean) => {
    if (!success) return <AlertCircle className="w-4 h-4 text-red-500" />;
    
    switch (type) {
      case 'create':
        return <FilePlus className="w-4 h-4 text-green-500" />;
      case 'write':
        return <FileEdit className="w-4 h-4 text-blue-500" />;
      case 'read':
        return <Eye className="w-4 h-4 text-gray-500" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'move':
        return <RefreshCw className="w-4 h-4 text-orange-500" />;
      case 'copy':
        return <Copy className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFileIcon = (path: string) => {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'tsx':
      case 'ts':
      case 'js':
      case 'jsx':
        return <Code className="w-4 h-4 text-blue-600" />;
      case 'css':
      case 'scss':
        return <Code className="w-4 h-4 text-pink-600" />;
      case 'json':
        return <Settings className="w-4 h-4 text-yellow-600" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'svg':
        return <Image className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied',
        description: 'Content copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy content',
        variant: 'destructive'
      });
    }
  };

  const generateDiffView = (original: string = '', updated: string = '') => {
    const originalLines = original.split('\n');
    const updatedLines = updated.split('\n');
    const maxLines = Math.max(originalLines.length, updatedLines.length);
    
    const diffLines = [];
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const updatedLine = updatedLines[i] || '';
      
      if (originalLine !== updatedLine) {
        if (originalLine && !updatedLine) {
          diffLines.push({ type: 'removed', content: originalLine, lineNumber: i + 1 });
        } else if (!originalLine && updatedLine) {
          diffLines.push({ type: 'added', content: updatedLine, lineNumber: i + 1 });
        } else {
          diffLines.push({ type: 'removed', content: originalLine, lineNumber: i + 1 });
          diffLines.push({ type: 'added', content: updatedLine, lineNumber: i + 1 });
        }
      } else if (originalLine) {
        diffLines.push({ type: 'unchanged', content: originalLine, lineNumber: i + 1 });
      }
    }
    
    return diffLines;
  };

  if (operations.length === 0) return null;

  return (
    <Card className="mt-3 border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            File Operations ({operations.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {operations.filter(op => op.success).length} successful
            </Badge>
            {operations.some(op => !op.success) && (
              <Badge variant="destructive" className="text-xs">
                {operations.filter(op => !op.success).length} failed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {operations.map((operation) => {
            const isExpanded = expandedOperations.has(operation.id);
            const hasContent = operation.newContent || operation.preview;
            const hasDiff = operation.originalContent && operation.newContent;
            
            return (
              <div key={operation.id} className="border border-gray-100 rounded-lg overflow-hidden">
                {/* Operation Header */}
                <div 
                  className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => hasContent && toggleOperation(operation.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getOperationIcon(operation.type, operation.success)}
                      <span className="text-sm font-medium capitalize">
                        {operation.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getFileIcon(operation.path)}
                      <code className="text-xs bg-white px-2 py-1 rounded border">
                        {operation.path}
                      </code>
                    </div>
                    
                    {operation.size && (
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(operation.size)}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {operation.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    
                    {hasContent && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Operation Error */}
                {!operation.success && operation.error && (
                  <div className="px-3 py-2 bg-red-50 border-t border-red-100">
                    <div className="text-sm text-red-700 font-medium mb-1">Error:</div>
                    <div className="text-xs text-red-600 font-mono">
                      {operation.error}
                    </div>
                  </div>
                )}
                
                {/* Expanded Content */}
                {isExpanded && hasContent && (
                  <div className="border-t border-gray-100">
                    {/* View Mode Tabs */}
                    {hasDiff && (
                      <div className="flex border-b border-gray-100 bg-gray-50">
                        {['diff', 'preview', 'code'].map((mode) => (
                          <Button
                            key={mode}
                            variant={previewMode === mode ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setPreviewMode(mode as typeof previewMode)}
                            className="rounded-none text-xs"
                          >
                            {mode === 'diff' && <Diff className="w-3 h-3 mr-1" />}
                            {mode === 'preview' && <Eye className="w-3 h-3 mr-1" />}
                            {mode === 'code' && <Code className="w-3 h-3 mr-1" />}
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    {/* Content Display */}
                    <div className="p-3">
                      {previewMode === 'diff' && hasDiff && (
                        <div className="space-y-1">
                          {generateDiffView(operation.originalContent, operation.newContent).map((line, index) => (
                            <div
                              key={index}
                              className={`text-xs font-mono p-1 rounded ${
                                line.type === 'added' ? 'bg-green-50 text-green-800' :
                                line.type === 'removed' ? 'bg-red-50 text-red-800' :
                                'bg-gray-50 text-gray-700'
                              }`}
                            >
                              <span className={`inline-block w-8 text-gray-500 ${
                                line.type === 'added' ? 'text-green-600' :
                                line.type === 'removed' ? 'text-red-600' : ''
                              }`}>
                                {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}{line.lineNumber}
                              </span>
                              <span className="ml-2">{line.content}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {(previewMode === 'code' || !hasDiff) && (operation.newContent || operation.preview) && (
                        <div className="relative">
                          <SyntaxHighlighter
                            language={operation.path.split('.').pop() || 'text'}
                            style={oneDark}
                            className="!text-xs !p-2 !rounded"
                            showLineNumbers
                          >
                            {operation.newContent || operation.preview || ''}
                          </SyntaxHighlighter>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(operation.newContent || operation.preview || '')}
                            className="absolute top-2 right-2 h-6 w-6 p-0 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      
                      {previewMode === 'preview' && operation.path.match(/\.(png|jpg|jpeg|svg)$/) && (
                        <div className="text-center">
                          <img
                            src={operation.preview}
                            alt="File preview"
                            className="max-w-full h-auto border border-gray-200 rounded"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    {operation.success && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPreviewFile(operation.path)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenFile(operation.path)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Open File
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(operation.path)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Path
                          </Button>
                        </div>
                        
                        {operation.type !== 'read' && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onApplyOperation(operation.id)}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Apply
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRevertOperation(operation.id)}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Revert
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}