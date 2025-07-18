import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface AgentChatControlsProps {
  isLoading: boolean;
  onStop: () => void;
  onPause: () => void;
  onRollback: () => void;
  canRollback?: boolean;
}

export function AgentChatControls({ 
  isLoading, 
  onStop, 
  onPause, 
  onRollback, 
  canRollback = false 
}: AgentChatControlsProps) {
  const handleOpenControls = () => {
    const controlsWindow = window.open('', '_blank', 'width=400,height=300');
    if (controlsWindow) {
      controlsWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Agent Controls</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; }
            .controls { display: flex; flex-direction: column; gap: 10px; }
            button { padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; }
            button:hover { background: #f5f5f5; }
            .stop { border-color: #ef4444; color: #dc2626; }
            .pause { border-color: #eab308; color: #ca8a04; }
            .rollback { border-color: #3b82f6; color: #2563eb; }
          </style>
        </head>
        <body>
          <h3>Agent Chat Controls</h3>
          <div class="controls">
            ${isLoading ? `
              <button class="stop" onclick="window.opener.postMessage({action: 'stop'}, '*')">■ Stop Agent</button>
              <button class="pause" onclick="window.opener.postMessage({action: 'pause'}, '*')">⏸ Pause Agent</button>
            ` : ''}
            ${canRollback ? `
              <button class="rollback" onclick="window.opener.postMessage({action: 'rollback'}, '*')">↶ Rollback Chat</button>
            ` : ''}
          </div>
        </body>
        </html>
      `);
    }
  };

  // Listen for messages from the popup
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.action === 'stop') onStop();
      else if (event.data.action === 'pause') onPause();
      else if (event.data.action === 'rollback') onRollback();
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onStop, onPause, onRollback]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleOpenControls}
      className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600"
      title="Open chat controls"
    >
      <Settings className="w-4 h-4" />
    </Button>
  );
}