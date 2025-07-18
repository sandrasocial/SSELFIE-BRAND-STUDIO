import React from 'react';
import { Button } from '@/components/ui/button';

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
  return (
    <div className="flex items-center space-x-2 mb-4">
      {isLoading && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onStop}
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            ■ Stop
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onPause}
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
          >
            ⏸ Pause
          </Button>
        </>
      )}
      
      {canRollback && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRollback}
          className="border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          ↶ Rollback
        </Button>
      )}
    </div>
  );
}