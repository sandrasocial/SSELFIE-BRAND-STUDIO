import React, { useState } from 'react';
import { X, Check, RotateCcw, Copy, Download } from 'lucide-react';

interface DevPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  previewData: {
    type: 'component' | 'page' | 'api' | 'database' | 'styling';
    title: string;
    description: string;
    code?: string;
    preview?: string;
    changes?: string[];
    files?: { path: string; content: string; type: 'modified' | 'created' | 'deleted' }[];
  };
  onApprove: () => void;
  onReject: (feedback?: string) => void;
}

export function DevPreviewModal({ 
  isOpen, 
  onClose, 
  agentName, 
  previewData, 
  onApprove, 
  onReject 
}: DevPreviewModalProps) {
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'changes'>('preview');

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="font-serif text-xl">{agentName} Development Preview</h3>
            <p className="text-sm text-gray-600 mt-1">{previewData.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'preview' 
                ? 'border-b-2 border-black text-black' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Live Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'code' 
                ? 'border-b-2 border-black text-black' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Code Changes
          </button>
          <button
            onClick={() => setActiveTab('changes')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'changes' 
                ? 'border-b-2 border-black text-black' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Summary
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'preview' && (
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-medium mb-2">Live Preview</h4>
                <p className="text-sm text-gray-600 mb-4">{previewData.description}</p>
              </div>
              
              {previewData.preview ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-3 py-2 text-xs text-gray-600 border-b">
                    Preview - {previewData.type}
                  </div>
                  <div className="p-4 bg-white min-h-[400px]">
                    <div dangerouslySetInnerHTML={{ __html: previewData.preview }} />
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-2">Preview not available for this change type</div>
                  <div className="text-sm text-gray-500">
                    This {previewData.type} change will be applied directly to the system
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'code' && (
            <div className="p-6">
              <div className="space-y-4">
                {previewData.files?.map((file, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono">{file.path}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          file.type === 'created' ? 'bg-green-100 text-green-800' :
                          file.type === 'modified' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {file.type}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(file.content)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <pre className="p-4 text-sm overflow-x-auto bg-gray-50">
                      <code>{file.content}</code>
                    </pre>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    No code changes to preview
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'changes' && (
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Summary of Changes</h4>
                  <p className="text-gray-600 mb-4">{previewData.description}</p>
                </div>
                
                {previewData.changes && previewData.changes.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">What will be changed:</h5>
                    <ul className="space-y-2">
                      {previewData.changes.map((change, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <span className="text-sm">{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-sm text-yellow-800">
                    <strong>Note:</strong> Once approved, {agentName} will implement these changes immediately in your SSELFIE Studio codebase.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Review the changes and approve to implement, or provide feedback for revisions
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (feedback.trim()) {
                    onReject(feedback);
                    setFeedback('');
                  } else {
                    onReject();
                  }
                }}
                className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-100 rounded flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Request Changes</span>
              </button>
              <button
                onClick={onApprove}
                className="px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 rounded flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Implement</span>
              </button>
            </div>
          </div>
          
          {/* Feedback Input */}
          <div className="mt-3">
            <input
              type="text"
              placeholder="Optional: Provide specific feedback for changes..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
}