import React, { useState } from 'react';

interface ToolkitPanelProps {
  mode: 'photo' | 'story';
  selectedItem?: any;
  onItemAction?: (action: string, data?: any) => void;
  className?: string;
  children?: React.ReactNode;
}

export const ToolkitPanel: React.FC<ToolkitPanelProps> = ({
  mode,
  selectedItem,
  onItemAction,
  className = '',
  children
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showActionSheet, setShowActionSheet] = useState(false);

  // Responsive monitoring
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show action sheet when item is selected on mobile
  React.useEffect(() => {
    if (isMobile && selectedItem) {
      setShowActionSheet(true);
    }
  }, [selectedItem, isMobile]);

  const renderPhotoActions = () => {
    if (!selectedItem) {
      return (
        <div className="text-center py-8">
          <p className="text-xs text-gray-400 tracking-wider uppercase mb-4">
            No concept selected
          </p>
          <p className="text-sm text-gray-600">
            Select a concept card to see available actions
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h4 className="spaced-title text-xs mb-4">
            {selectedItem.title?.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim()}
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed mb-6">
            {selectedItem.description}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onItemAction?.('generate')}
            disabled={selectedItem.isGenerating}
            className="luxury-btn w-full text-center"
          >
            {selectedItem.isGenerating ? 'Creating Photos...' : 'Generate Photos'}
          </button>

          {selectedItem.generatedImages?.length > 0 && (
            <>
              <button
                onClick={() => onItemAction?.('variations')}
                className="luxury-btn secondary w-full text-center"
              >
                Generate Variations
              </button>

              <button
                onClick={() => onItemAction?.('save-all')}
                className="luxury-btn secondary w-full text-center"
              >
                Save All to Gallery
              </button>

              <button
                onClick={() => onItemAction?.('create-video')}
                className="luxury-btn w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none"
                style={{ background: '#000000' }}
              >
                Create Video from Concept
              </button>
            </>
          )}
        </div>

        {selectedItem.isGenerating && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <div className="flex space-x-1 mr-3">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
              Generating images...
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStoryActions = () => {
    return (
      <div className="space-y-6">
        <div>
          <h4 className="spaced-title text-xs mb-4">Story Tools</h4>
          <p className="text-xs text-gray-600 leading-relaxed mb-6">
            Configure your video generation settings
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 tracking-wider uppercase mb-3 block">
              Video Format
            </label>
            <div className="space-y-2">
              <button
                onClick={() => onItemAction?.('format', '9:16')}
                className="luxury-btn secondary w-full text-center"
              >
                Social Media (Portrait)
              </button>
              <button
                onClick={() => onItemAction?.('format', '16:9')}
                className="luxury-btn secondary w-full text-center"
              >
                Website (Landscape)
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => onItemAction?.('generate-story')}
              className="luxury-btn w-full text-center"
            >
              Generate Story Video
            </button>
          </div>
        </div>

        {selectedItem && (
          <div className="pt-4 border-t border-gray-100">
            <h5 className="text-xs text-gray-500 tracking-wider uppercase mb-3">
              Selected Scene
            </h5>
            <p className="text-xs text-gray-600 leading-relaxed">
              Scene {selectedItem.scene}: {selectedItem.prompt}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Mobile: Action Sheet Overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile Action Sheet */}
        {showActionSheet && (
          <div className="fixed inset-0 bg-black/50 z-40 flex items-end">
            <div className="bg-white w-full max-h-[70vh] overflow-y-auto rounded-t-lg">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="spaced-title text-sm">
                  {mode === 'photo' ? 'Photo Actions' : 'Story Actions'}
                </h3>
                <button
                  onClick={() => setShowActionSheet(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-4">
                {mode === 'photo' ? renderPhotoActions() : renderStoryActions()}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Quick Action Button */}
        {selectedItem && !showActionSheet && (
          <button
            onClick={() => setShowActionSheet(true)}
            className="fixed bottom-24 right-4 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center z-30 shadow-lg"
          >
            ⚡
          </button>
        )}

        {children}
      </>
    );
  }

  // Desktop: Side panel
  return (
    <div className={`desktop-panel ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <h3 className="spaced-title text-sm">
          {mode === 'photo' ? 'Photo Toolkit' : 'Story Toolkit'}
        </h3>
        <p className="text-xs text-gray-500 tracking-wider uppercase">
          Actions & Controls
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {mode === 'photo' ? renderPhotoActions() : renderStoryActions()}
        {children}
      </div>
    </div>
  );
};

// Quick Actions Component for common actions
interface QuickActionsProps {
  mode: 'photo' | 'story';
  onAction: (action: string) => void;
  disabled?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  mode,
  onAction,
  disabled = false
}) => {
  if (mode === 'photo') {
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => onAction('new-session')}
          disabled={disabled}
          className="luxury-btn secondary text-xs"
        >
          New Session
        </button>
        <button
          onClick={() => onAction('view-gallery')}
          disabled={disabled}
          className="luxury-btn secondary text-xs"
        >
          View Gallery
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onAction('clear-scenes')}
        disabled={disabled}
        className="luxury-btn secondary text-xs"
      >
        Clear Scenes
      </button>
      <button
        onClick={() => onAction('save-project')}
        disabled={disabled}
        className="luxury-btn secondary text-xs"
      >
        Save Project
      </button>
    </div>
  );
};

// Status Display Component
interface StatusDisplayProps {
  mode: 'photo' | 'story';
  stats?: {
    conceptCards?: number;
    images?: number;
    scenes?: number;
    videos?: number;
  };
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  mode,
  stats = {}
}) => {
  if (mode === 'photo') {
    return (
      <div className="border-t border-gray-100 pt-6 mt-6">
        <h5 className="text-xs text-gray-500 tracking-wider uppercase mb-3">
          Session Stats
        </h5>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-light">{stats.conceptCards || 0}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Concepts</div>
          </div>
          <div>
            <div className="text-lg font-light">{stats.images || 0}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Images</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 pt-6 mt-6">
      <h5 className="text-xs text-gray-500 tracking-wider uppercase mb-3">
        Project Stats
      </h5>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-lg font-light">{stats.scenes || 0}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Scenes</div>
        </div>
        <div>
          <div className="text-lg font-light">{stats.videos || 0}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Videos</div>
        </div>
      </div>
    </div>
  );
};