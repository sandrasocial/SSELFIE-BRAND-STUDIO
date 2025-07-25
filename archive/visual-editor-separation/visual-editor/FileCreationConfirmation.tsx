import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, Clock, AlertCircle } from 'lucide-react';

interface FileOperation {
  id: string;
  type: 'created' | 'modified' | 'deleted';
  filePath: string;
  agentName: string;
  timestamp: Date;
  contentLength: number;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

interface FileCreationConfirmationProps {
  onFileSelect?: (filePath: string) => void;
}

export function FileCreationConfirmation({ onFileSelect }: FileCreationConfirmationProps) {
  const [fileOperations, setFileOperations] = useState<FileOperation[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for file operations from agents
    const handleFileOperation = (event: CustomEvent<FileOperation>) => {
      const operation = event.detail;
      setFileOperations(prev => [operation, ...prev.slice(0, 9)]); // Keep last 10 operations
      setIsVisible(true);
      
      // Auto-hide after 5 seconds for successful operations
      if (operation.status === 'success') {
        setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      }
    };

    window.addEventListener('agentFileOperation', handleFileOperation as EventListener);
    
    return () => {
      window.removeEventListener('agentFileOperation', handleFileOperation as EventListener);
    };
  }, []);

  const getOperationIcon = (operation: FileOperation) => {
    switch (operation.status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getOperationText = (operation: FileOperation) => {
    const action = operation.type === 'created' ? 'Created' : 
                   operation.type === 'modified' ? 'Modified' : 'Deleted';
    return `${action} by ${operation.agentName}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isVisible || fileOperations.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">File Operations</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </Button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {fileOperations.map((operation) => (
          <div
            key={operation.id}
            className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onFileSelect?.(operation.filePath)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getOperationIcon(operation)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {operation.filePath.split('/').pop()}
                  </p>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTime(operation.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {getOperationText(operation)}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {formatFileSize(operation.contentLength)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {operation.filePath}
                  </span>
                </div>
                {operation.error && (
                  <p className="text-xs text-red-600 mt-1">
                    Error: {operation.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {fileOperations.length} operation{fileOperations.length !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFileOperations([])}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}