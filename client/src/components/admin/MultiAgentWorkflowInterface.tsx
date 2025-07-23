import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'working' | 'waiting' | 'completed';
  currentTask?: string;
}

interface WorkflowStep {
  stepId: string;
  agentId: string;
  description: string;
  estimatedMinutes: number;
  dependencies?: string[];
  collaborators?: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
}

interface EnhancedWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  participants: string[];
  status: 'created' | 'running' | 'completed' | 'failed';
  progressPercentage: number;
}

const AVAILABLE_AGENTS = [
  { id: 'elena', name: 'Elena - Workflow Director' },
  { id: 'aria', name: 'Aria - Design Director' },
  { id: 'zara', name: 'Zara - Technical Director' },
  { id: 'rachel', name: 'Rachel - Voice Director' },
  { id: 'maya', name: 'Maya - AI Photography' },
  { id: 'ava', name: 'Ava - Automation Director' },
  { id: 'quinn', name: 'Quinn - Quality Director' },
  { id: 'sophia', name: 'Sophia - Social Director' },
  { id: 'martha', name: 'Martha - Marketing Director' },
  { id: 'diana', name: 'Diana - Business Coach' },
  { id: 'wilma', name: 'Workflow Director' },
  { id: 'olga', name: 'Olga - Organization Director' }
];

export default function MultiAgentWorkflowInterface() {
  const [workflows, setWorkflows] = useState<EnhancedWorkflow[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, string>>({});
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Create new workflow state
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowSteps, setWorkflowSteps] = useState<Omit<WorkflowStep, 'status'>[]>([]);
  
  // Agent coordination state
  const [fromAgent, setFromAgent] = useState('');
  const [toAgent, setToAgent] = useState('');
  const [coordinationMessage, setCoordinationMessage] = useState('');

  useEffect(() => {
    loadAgentStatuses();
    const interval = setInterval(loadAgentStatuses, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadAgentStatuses = async () => {
    try {
      const response = await fetch('/api/multi-agent/statuses');
      const data = await response.json();
      if (data.success) {
        setAgentStatuses(data.statuses);
      }
    } catch (error) {
      console.error('Error loading agent statuses:', error);
    }
  };

  const createEnhancedWorkflow = async () => {
    if (!workflowName || !workflowDescription || workflowSteps.length === 0) {
      alert('Please fill in all workflow details');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/enhanced-elena/create-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: workflowName,
          description: workflowDescription,
          steps: workflowSteps
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Enhanced workflow created: ${data.workflowId}`);
        setWorkflowName('');
        setWorkflowDescription('');
        setWorkflowSteps([]);
        loadWorkflows();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      alert('Error creating workflow');
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/enhanced-elena/execute-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workflowId })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Workflow execution started: ${workflowId}`);
        loadWorkflows();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      alert('Error executing workflow');
    } finally {
      setLoading(false);
    }
  };

  const coordinateAgents = async () => {
    if (!fromAgent || !toAgent || !coordinationMessage) {
      alert('Please fill in all coordination details');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/multi-agent/coordinate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromAgent,
          toAgent,
          message: coordinationMessage,
          workflowId: selectedWorkflow
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Agent coordination successful: ${fromAgent} → ${toAgent}`);
        setCoordinationMessage('');
        loadAgentStatuses();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error coordinating agents:', error);
      alert('Error coordinating agents');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflows = async () => {
    // Implementation would load workflows from the enhanced system
    // For now, this is a placeholder
  };

  const addWorkflowStep = () => {
    setWorkflowSteps([...workflowSteps, {
      stepId: `step_${workflowSteps.length + 1}`,
      agentId: '',
      description: '',
      estimatedMinutes: 5,
      dependencies: [],
      collaborators: []
    }]);
  };

  const updateWorkflowStep = (index: number, field: string, value: any) => {
    const updatedSteps = [...workflowSteps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setWorkflowSteps(updatedSteps);
  };

  const removeWorkflowStep = (index: number) => {
    setWorkflowSteps(workflowSteps.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Status Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle>Live Agent Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_AGENTS.map(agent => (
                <div key={agent.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm font-medium">{agent.name}</span>
                  <Badge variant={
                    agentStatuses[agent.id] === 'working' ? 'destructive' :
                    agentStatuses[agent.id] === 'waiting' ? 'secondary' :
                    agentStatuses[agent.id] === 'completed' ? 'default' : 'outline'
                  }>
                    {agentStatuses[agent.id] || 'idle'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent Coordination Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Agent-to-Agent Coordination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">From Agent</label>
                <select 
                  value={fromAgent} 
                  onChange={(e) => setFromAgent(e.target.value)}
                  className="w-full mt-1 p-2 border rounded"
                >
                  <option value="">Select agent...</option>
                  {AVAILABLE_AGENTS.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">To Agent</label>
                <select 
                  value={toAgent} 
                  onChange={(e) => setToAgent(e.target.value)}
                  className="w-full mt-1 p-2 border rounded"
                >
                  <option value="">Select agent...</option>
                  {AVAILABLE_AGENTS.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Coordination Message</label>
              <Textarea
                value={coordinationMessage}
                onChange={(e) => setCoordinationMessage(e.target.value)}
                placeholder="Enter coordination message for agent-to-agent communication..."
                className="mt-1"
                rows={3}
              />
            </div>
            <Button onClick={coordinateAgents} disabled={loading} className="w-full">
              Send Agent Coordination
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Workflow Creator */}
      <Card>
        <CardHeader>
          <CardTitle>Create Enhanced Multi-Agent Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Workflow Name</label>
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Enter workflow description..."
                className="mt-1"
              />
            </div>
          </div>

          {/* Workflow Steps */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Workflow Steps</label>
              <Button onClick={addWorkflowStep} variant="outline" size="sm">
                Add Step
              </Button>
            </div>
            <ScrollArea className="h-64 mt-2">
              <div className="space-y-2">
                {workflowSteps.map((step, index) => (
                  <div key={index} className="border rounded p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Step {index + 1}</span>
                      <Button 
                        onClick={() => removeWorkflowStep(index)} 
                        variant="destructive" 
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs">Agent</label>
                        <select 
                          value={step.agentId} 
                          onChange={(e) => updateWorkflowStep(index, 'agentId', e.target.value)}
                          className="w-full mt-1 p-1 border rounded text-sm"
                        >
                          <option value="">Select agent...</option>
                          {AVAILABLE_AGENTS.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs">Estimated Minutes</label>
                        <Input
                          type="number"
                          value={step.estimatedMinutes}
                          onChange={(e) => updateWorkflowStep(index, 'estimatedMinutes', parseInt(e.target.value))}
                          className="mt-1 text-sm"
                          min={1}
                          max={30}
                        />
                      </div>
                      <div>
                        <label className="text-xs">Dependencies (comma-separated)</label>
                        <Input
                          value={step.dependencies?.join(', ') || ''}
                          onChange={(e) => updateWorkflowStep(index, 'dependencies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          placeholder="step_1, step_2"
                          className="mt-1 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs">Task Description</label>
                      <Textarea
                        value={step.description}
                        onChange={(e) => updateWorkflowStep(index, 'description', e.target.value)}
                        placeholder="Describe what this agent should do..."
                        className="mt-1 text-sm"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-xs">Collaborators (comma-separated agent IDs)</label>
                      <Input
                        value={step.collaborators?.join(', ') || ''}
                        onChange={(e) => updateWorkflowStep(index, 'collaborators', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="aria, zara, quinn"
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Button onClick={createEnhancedWorkflow} disabled={loading} className="w-full">
            Create Enhanced Workflow
          </Button>
        </CardContent>
      </Card>

      {/* Active Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Active Enhanced Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Enhanced workflow monitoring will appear here once workflows are created and executed.
            <br />
            Real-time agent coordination and progress tracking will be displayed.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}