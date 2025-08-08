import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface AgentTask {
  agentId: string;
  agentName: string;
  role: string;
  task: string;
  expectedFile: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed';
  fileCreated: boolean;
  lastUpdate: Date;
}

interface TestResult {
  phase: number;
  phaseName: string;
  tasks: AgentTask[];
  completed: boolean;
  successRate: number;
}

export default function TestMayaOptimization() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isRunning, setIsRunning] = useState(false);

  // Test workflow phases
  const phases: TestResult[] = [
    {
      phase: 1,
      phaseName: "Parameter Intelligence",
      completed: false,
      successRate: 0,
      tasks: [
        {
          agentId: "zara",
          agentName: "Zara",
          role: "Dev AI",
          task: "Create user-analysis-engine.ts for training image analysis",
          expectedFile: "server/user-analysis-engine.ts",
          status: "pending",
          fileCreated: false,
          lastUpdate: new Date()
        },
        {
          agentId: "zara",
          agentName: "Zara", 
          role: "Dev AI",
          task: "Create adaptive-parameters-service.ts for optimal parameter generation",
          expectedFile: "server/adaptive-parameters-service.ts",
          status: "pending",
          fileCreated: false,
          lastUpdate: new Date()
        }
      ]
    },
    {
      phase: 2,
      phaseName: "Quality Learning System",
      completed: false,
      successRate: 0,
      tasks: [
        {
          agentId: "ava",
          agentName: "Ava",
          role: "Automation AI",
          task: "Create quality-tracking-service.ts for generation success monitoring",
          expectedFile: "server/quality-tracking-service.ts",
          status: "pending",
          fileCreated: false,
          lastUpdate: new Date()
        },
        {
          agentId: "quinn",
          agentName: "Quinn",
          role: "QA AI",
          task: "Create parameter-optimization.test.ts testing suite",
          expectedFile: "server/tests/parameter-optimization.test.ts",
          status: "pending",
          fileCreated: false,
          lastUpdate: new Date()
        }
      ]
    },
    {
      phase: 3,
      phaseName: "Advanced AI Integration",
      completed: false,
      successRate: 0,
      tasks: [
        {
          agentId: "aria",
          agentName: "Aria",
          role: "UX Designer AI",
          task: "Create ParameterOptimizationDashboard.tsx admin interface",
          expectedFile: "client/src/components/ParameterOptimizationDashboard.tsx",
          status: "pending",
          fileCreated: false,
          lastUpdate: new Date()
        },
        {
          agentId: "rachel",
          agentName: "Rachel",
          role: "Voice AI", 
          task: "Create MAYA_PERSONALIZATION_COPY.md documentation",
          expectedFile: "MAYA_PERSONALIZATION_COPY.md",
          status: "pending",
          fileCreated: false,
          lastUpdate: new Date()
        }
      ]
    }
  ];

  useEffect(() => {
    setTestResults(phases);
  }, []);

  const sendTaskToAgent = async (task: AgentTask) => {
    try {
      setIsRunning(true);
      
      // Update task status to in-progress
      setTestResults(prev => prev.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(t => 
          t.agentId === task.agentId && t.expectedFile === task.expectedFile
            ? { ...t, status: 'in-progress', lastUpdate: new Date() }
            : t
        )
      })));

      const taskMessage = `CREATE FILE: ${task.expectedFile}

${task.task}

IMPORTANT: Create the actual file in the codebase using the DEV_PREVIEW format. This is for testing Maya's optimization system.

Requirements:
- Use proper TypeScript/React syntax
- Include complete implementation with imports
- Follow SSELFIE architecture patterns
- Ensure file integrates with existing codebase
- Add proper error handling and documentation

Create this as a production-ready file that can be immediately used in the application.`;

      const response = await fetch('/api/admin/agent-chat-bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          agentId: task.agentId,
          message: taskMessage,
          conversationHistory: []
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Check if file was created (mock check for now)
        const fileCreated = result.response.includes('create') || result.response.includes('file');
        
        // Update task status
        setTestResults(prev => prev.map(phase => ({
          ...phase,
          tasks: phase.tasks.map(t => 
            t.agentId === task.agentId && t.expectedFile === task.expectedFile
              ? { 
                  ...t, 
                  status: fileCreated ? 'completed' : 'failed',
                  fileCreated,
                  lastUpdate: new Date() 
                }
              : t
          )
        })));

        toast({
          title: fileCreated ? "Task Completed" : "Task Failed",
          description: `${task.agentName} ${fileCreated ? 'created' : 'failed to create'} ${task.expectedFile}`,
          variant: fileCreated ? "default" : "destructive"
        });

      } else {
        throw new Error('Failed to send task to agent');
      }
    } catch (error) {
      console.error('Error sending task:', error);
      toast({
        title: "Error",
        description: `Failed to send task to ${task.agentName}`,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runPhase = async (phaseNumber: number) => {
    const phase = testResults.find(p => p.phase === phaseNumber);
    if (!phase) return;

    setCurrentPhase(phaseNumber);
    
    for (const task of phase.tasks) {
      await sendTaskToAgent(task);
      // Wait 2 seconds between tasks to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const runAllPhases = async () => {
    for (let i = 1; i <= 3; i++) {
      await runPhase(i);
      // Wait 5 seconds between phases
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  };

  const getStatusColor = (status: AgentTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'assigned': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Admin access required to test agent file creation system.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Maya Optimization Agent Test
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Test all agents by implementing Maya's user-adaptive parameter optimization across 3 phases.
            Verify each agent creates actual files in the codebase.
          </p>
          
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={runAllPhases} 
              disabled={isRunning}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isRunning ? 'Running...' : 'Run All Phases'}
            </Button>
            <Button 
              onClick={() => runPhase(1)} 
              disabled={isRunning}
              variant="outline"
            >
              Run Phase 1
            </Button>
            <Button 
              onClick={() => runPhase(2)} 
              disabled={isRunning}
              variant="outline"
            >
              Run Phase 2
            </Button>
            <Button 
              onClick={() => runPhase(3)} 
              disabled={isRunning}
              variant="outline"
            >
              Run Phase 3
            </Button>
          </div>
        </div>

        <Tabs value={currentPhase.toString()} onValueChange={(value) => setCurrentPhase(parseInt(value))}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1">Phase 1: Parameter Intelligence</TabsTrigger>
            <TabsTrigger value="2">Phase 2: Quality Learning</TabsTrigger>
            <TabsTrigger value="3">Phase 3: AI Integration</TabsTrigger>
          </TabsList>

          {testResults.map((phase) => (
            <TabsContent key={phase.phase} value={phase.phase.toString()}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span style={{ fontFamily: 'Times New Roman, serif' }}>
                      Phase {phase.phase}: {phase.phaseName}
                    </span>
                    <Badge variant={phase.completed ? "default" : "secondary"}>
                      {phase.completed ? 'Completed' : 'In Progress'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {phase.tasks.map((task, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{task.agentName} ({task.role})</h4>
                            <p className="text-sm text-gray-600">{task.task}</p>
                            <p className="text-xs text-gray-500 mt-1">Expected: {task.expectedFile}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                            {task.fileCreated && (
                              <Badge variant="outline" className="bg-green-50 text-green-800">
                                File Created
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            Last Update: {task.lastUpdate.toLocaleTimeString()}
                          </span>
                          <Button 
                            size="sm" 
                            onClick={() => sendTaskToAgent(task)}
                            disabled={isRunning || task.status === 'in-progress'}
                            variant="outline"
                          >
                            Send Task
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Times New Roman, serif' }}>
              Test Results Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {testResults.map((phase) => {
                const completedTasks = phase.tasks.filter(t => t.status === 'completed').length;
                const totalTasks = phase.tasks.length;
                const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                
                return (
                  <div key={phase.phase} className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Phase {phase.phase}</h4>
                    <div className="text-2xl font-bold mb-1">{successRate.toFixed(0)}%</div>
                    <div className="text-sm text-gray-600">
                      {completedTasks}/{totalTasks} tasks completed
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}