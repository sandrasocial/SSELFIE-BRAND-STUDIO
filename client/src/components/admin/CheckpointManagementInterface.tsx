import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Save, RotateCcw, Database, GitBranch, Shield } from 'lucide-react';

interface Checkpoint {
  id: string;
  timestamp: Date;
  type: 'auto' | 'manual' | 'milestone';
  description: string;
  fileCount: number;
  agentId?: string;
  status: 'success' | 'pending' | 'failed';
}

export default function CheckpointManagementInterface() {
  const [checkpoints] = useState<Checkpoint[]>([
    {
      id: 'cp_1754040000',
      timestamp: new Date(Date.now() - 1800000), // 30 min ago
      type: 'auto',
      description: 'Auto-checkpoint: Agent file operations',
      fileCount: 12,
      agentId: 'aria',
      status: 'success'
    },
    {
      id: 'cp_1754038000',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago  
      type: 'milestone',
      description: 'Enhancement Project Milestone: Backend Services Complete',
      fileCount: 28,
      status: 'success'
    },
    {
      id: 'cp_1754036000',
      timestamp: new Date(Date.now() - 5400000), // 1.5 hours ago
      type: 'manual',
      description: 'Pre-agent fix checkpoint',
      fileCount: 15,
      status: 'success'
    }
  ]);

  const [isCreatingCheckpoint, setIsCreatingCheckpoint] = useState(false);

  const handleCreateCheckpoint = async () => {
    setIsCreatingCheckpoint(true);
    // Implementation would call checkpoint API
    setTimeout(() => setIsCreatingCheckpoint(false), 2000);
  };

  const handleRestore = async (checkpointId: string) => {
    console.log(`Restoring checkpoint: ${checkpointId}`);
    // Implementation would call restore API
  };

  const getTypeIcon = (type: Checkpoint['type']) => {
    switch (type) {
      case 'auto': return <Clock className="h-4 w-4" />;
      case 'manual': return <Save className="h-4 w-4" />;
      case 'milestone': return <GitBranch className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: Checkpoint['type']) => {
    switch (type) {
      case 'auto': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'manual': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'milestone': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">Checkpoint Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Automated backup and restore system for SSELFIE Studio
          </p>
        </div>
        
        <Button 
          onClick={handleCreateCheckpoint}
          disabled={isCreatingCheckpoint}
          className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <Save className="mr-2 h-4 w-4" />
          {isCreatingCheckpoint ? 'Creating...' : 'Create Checkpoint'}
        </Button>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-green-600" />
            System Protection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Active</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Auto-checkpoint</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">15 min</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Checkpoint interval</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">7 days</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Retention period</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkpoint History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Checkpoint History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checkpoints.map((checkpoint) => (
              <div 
                key={checkpoint.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(checkpoint.type)}
                    <Badge className={getTypeBadgeColor(checkpoint.type)}>
                      {checkpoint.type}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="font-medium text-black dark:text-white">
                      {checkpoint.description}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {checkpoint.timestamp.toLocaleString()} • {checkpoint.fileCount} files
                      {checkpoint.agentId && ` • by ${checkpoint.agentId}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={checkpoint.status === 'success' ? 'default' : 'destructive'}
                    className={checkpoint.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                  >
                    {checkpoint.status}
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(checkpoint.id)}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Restore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Checkpoint Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-checkpoint frequency</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically create checkpoints during agent operations
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Every 15 minutes
              </Badge>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Milestone checkpoints</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Create checkpoints at key project milestones
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Enabled
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}