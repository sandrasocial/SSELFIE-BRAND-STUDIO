import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickActionsPopupProps {
  isLoading: boolean;
  onStartWorkflow: (workflow: string) => void;
  onQuickCommand: (command: any) => void;
  onGenerateImages: () => void;
  quickCommands: any[];
}

export function QuickActionsPopup({
  isLoading,
  onStartWorkflow,
  onQuickCommand,
  onGenerateImages,
  quickCommands
}: QuickActionsPopupProps) {
  const handleOpenWorkflows = () => {
    const workflowWindow = window.open('', '_blank', 'width=500,height=600');
    if (workflowWindow) {
      workflowWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Quick Actions & Workflows</title>
          <style>
            body { 
              font-family: "Times New Roman", serif;
              padding: 20px; 
              margin: 0;
              background: #ffffff;
            }
            h2 { 
              font-size: 24px;
              margin-bottom: 20px;
              color: #0a0a0a;
            }
            h3 { 
              font-size: 14px;
              margin-bottom: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .section { 
              margin-bottom: 30px;
            }
            .workflows { 
              display: flex; 
              flex-direction: column; 
              gap: 8px; 
              margin-bottom: 20px;
            }
            .commands { 
              display: flex; 
              flex-direction: column; 
              gap: 6px; 
            }
            button { 
              padding: 8px 12px;
              border: 1px solid #0a0a0a;
              border-radius: 4px;
              cursor: pointer;
              background: white;
              color: #0a0a0a;
              font-size: 12px;
              text-align: left;
            }
            button:hover { 
              background: #0a0a0a;
              color: white;
            }
            .workflow-btn {
              font-weight: 500;
              padding: 10px 12px;
            }
            .command-btn {
              border-color: #ccc;
              color: #666;
            }
            .command-btn:hover {
              background: #f5f5f5;
              color: #0a0a0a;
            }
            .generate-btn {
              background: #f3e8ff;
              border-color: #c4b5fd;
              color: #7c3aed;
            }
            .generate-btn:hover {
              background: #e9d5ff;
            }
          </style>
        </head>
        <body>
          <h2>Quick Actions & Workflows</h2>
          
          <div class="section">
            <h3>Workflows</h3>
            <div class="workflows">
              <button class="workflow-btn" onclick="window.opener.postMessage({action: 'workflow', data: 'Create a new landing page design and implement it'}, '*')">
                New Landing Page
              </button>
              <button class="workflow-btn" onclick="window.opener.postMessage({action: 'workflow', data: 'Design and build a pricing section'}, '*')">
                Pricing Section
              </button>
              <button class="workflow-btn" onclick="window.opener.postMessage({action: 'workflow', data: 'Create an image gallery component'}, '*')">
                Image Gallery
              </button>
            </div>
          </div>

          <div class="section">
            <h3>Quick Commands</h3>
            <div class="commands">
              ${quickCommands.map(cmd => `
                <button class="command-btn" onclick="window.opener.postMessage({action: 'command', data: ${JSON.stringify(cmd)}}, '*')">
                  ${cmd.label}
                </button>
              `).join('')}
              
              <button class="generate-btn" onclick="window.opener.postMessage({action: 'generate'}, '*')" ${isLoading ? 'disabled' : ''}>
                ${isLoading ? 'Generating...' : 'Generate Images'}
              </button>
            </div>
          </div>
        </body>
        </html>
      `);
    }
  };

  // Listen for messages from the popup
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.action === 'workflow') {
        onStartWorkflow(event.data.data);
      } else if (event.data.action === 'command') {
        onQuickCommand(event.data.data);
      } else if (event.data.action === 'generate') {
        onGenerateImages();
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onStartWorkflow, onQuickCommand, onGenerateImages]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleOpenWorkflows}
      className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600 text-xs"
      title="Open workflows & quick actions"
    >
      •••
    </Button>
  );
}