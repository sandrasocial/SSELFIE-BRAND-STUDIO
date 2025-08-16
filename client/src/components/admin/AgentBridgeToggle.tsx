// React import not needed with Vite JSX transform
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, MessageCircle } from 'lucide-react';

interface AgentBridgeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  agentName: string;
}

export default function AgentBridgeToggle({ enabled, onToggle, agentName }: AgentBridgeToggleProps) {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          {enabled ? (
            <Zap className="h-4 w-4 text-amber-500" />
          ) : (
            <MessageCircle className="h-4 w-4 text-zinc-500" />
          )}
          <CardTitle className="text-sm font-medium">
            {enabled ? 'Bridge Mode' : 'Chat Mode'}
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          {enabled 
            ? `${agentName} will execute tasks through the Agent Bridge System`
            : `${agentName} will respond in conversational mode only`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center space-x-2">
          <Switch
            id="bridge-mode"
            checked={enabled}
            onCheckedChange={onToggle}
          />
          <Label htmlFor="bridge-mode" className="text-sm">
            {enabled ? 'Execute Actions' : 'Chat Only'}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}