import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WorkflowStage {
  id: string;
  name: string;
  primaryAgent: string;
  supportingAgents: string[];
  outputs: string[];
  nextStages: string[];
}

interface ActiveWorkflow {
  workflowId: string;
  projectType: string;
  currentStage: string;
  status: string;
  startedAt: Date;
  completedStages: string[];
  nextActions: string[];
}

export default function EnhancedAgentCoordination() {
  const [selectedProjectType, setSelectedProjectType] = useState<string>('design');
  const [activeWorkflows, setActiveWorkflows] = useState<ActiveWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get workflow stages
  const { data: workflowStages } = useQuery({
    queryKey: ['/api/admin/coordinate-agents', 'get_workflow_stages'],
    queryFn: async () => {
      const response = await fetch('/api/admin/coordinate-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_workflow_stages' })
      });
      return response.json();
    }
  });

  // Get agent specialties
  const { data: agentSpecialties } = useQuery({
    queryKey: ['/api/admin/coordinate-agents', 'get_agent_specialties'],
    queryFn: async () => {
      const response = await fetch('/api/admin/coordinate-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_agent_specialties' })
      });
      return response.json();
    }
  });

  // Initiate workflow mutation
  const initiateWorkflowMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await fetch('/api/admin/coordinate-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiate_workflow',
          context: {
            projectType: projectData.projectType,
            requirements: projectData.requirements
          }
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workflow-analytics'] });
      // Add to active workflows
      const newWorkflow: ActiveWorkflow = {
        workflowId: data.workflowId,
        projectType: selectedProjectType,
        currentStage: getStartingStage(selectedProjectType),
        status: 'initiated',
        startedAt: new Date(),
        completedStages: [],
        nextActions: getNextActions(getStartingStage(selectedProjectType))
      };
      setActiveWorkflows(prev => [newWorkflow, ...prev]);
    }
  });

  const projectTypes = [
    { id: 'design', name: 'Design Project', description: 'UI/UX design and visual identity work', startAgent: 'aria' },
    { id: 'technical', name: 'Technical Project', description: 'Development and implementation work', startAgent: 'zara' },
    { id: 'content', name: 'Content Project', description: 'Content strategy and copywriting', startAgent: 'rachel' },
    { id: 'marketing', name: 'Marketing Campaign', description: 'Marketing and revenue optimization', startAgent: 'martha' },
    { id: 'strategy', name: 'Strategic Planning', description: 'Business strategy and coordination', startAgent: 'diana' },
    { id: 'automation', name: 'Automation Setup', description: 'Process automation and workflows', startAgent: 'ava' }
  ];

  const agentNames: Record<string, string> = {
    aria: 'Aria',
    zara: 'Zara',
    rachel: 'Rachel',
    ava: 'Ava',
    quinn: 'Quinn',
    sophia: 'Sophia',
    martha: 'Martha',
    diana: 'Diana',
    wilma: 'Wilma'
  };

  const getStartingStage = (projectType: string): string => {
    switch (projectType) {
      case 'design': return 'design_concept';
      case 'technical': return 'technical_implementation';
      case 'content': return 'content_creation';
      case 'marketing': return 'marketing_campaigns';
      case 'strategy': return 'strategic_planning';
      case 'automation': return 'automation_setup';
      default: return 'design_concept';
    }
  };

  const getNextActions = (stage: string): string[] => {
    const stageActions: Record<string, string[]> = {
      design_concept: ['Create design mockups', 'Establish style guidelines', 'Coordinate with Zara for implementation'],
      technical_implementation: ['Write component code', 'Set up database schema', 'Configure API endpoints'],
      content_creation: ['Develop brand voice', 'Write copy content', 'Create content guidelines'],
      marketing_campaigns: ['Develop campaign strategy', 'Set up tracking', 'Create ad content'],
      strategic_planning: ['Analyze business goals', 'Create strategic roadmap', 'Coordinate team resources'],
      automation_setup: ['Design workflow automation', 'Set up integrations', 'Configure triggers']
    };
    return stageActions[stage] || ['Define project requirements', 'Begin initial planning'];
  };

  const handleInitiateWorkflow = () => {
    const selectedProject = projectTypes.find(p => p.id === selectedProjectType);
    if (!selectedProject) return;

    initiateWorkflowMutation.mutate({
      projectType: selectedProjectType,
      requirements: {
        projectName: `New ${selectedProject.name}`,
        priority: 'high',
        expectedOutputs: selectedProject.description,
        primaryAgent: selectedProject.startAgent
      }
    });
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      design_concept: 'bg-purple-100 text-purple-800',
      technical_implementation: 'bg-blue-100 text-blue-800',
      content_creation: 'bg-green-100 text-green-800',
      marketing_campaigns: 'bg-red-100 text-red-800',
      strategic_planning: 'bg-yellow-100 text-yellow-800',
      automation_setup: 'bg-indigo-100 text-indigo-800',
      quality_assurance: 'bg-gray-100 text-gray-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-serif text-black">Enhanced Agent Coordination</h2>
        <p className="text-gray-600 mt-1">Orchestrate multi-agent workflows with intelligent handoffs</p>
      </div>

      {/* Project Initiation */}
      <div className="bg-white border border-gray-200 rounded p-6">
        <h3 className="text-lg font-serif text-black mb-4">Initiate New Workflow</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {projectTypes.map(project => (
            <div
              key={project.id}
              className={`border rounded p-4 cursor-pointer transition-colors ${
                selectedProjectType === project.id 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedProjectType(project.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-black">{project.name}</h4>
                <div className="text-xs text-gray-500">
                  {agentNames[project.startAgent]}
                </div>
              </div>
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleInitiateWorkflow}
          disabled={initiateWorkflowMutation.isPending}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {initiateWorkflowMutation.isPending ? 'Initiating...' : 'Start Workflow'}
        </button>
      </div>

      {/* Active Workflows */}
      {activeWorkflows.length > 0 && (
        <div className="bg-white border border-gray-200 rounded p-6">
          <h3 className="text-lg font-serif text-black mb-4">Active Workflows</h3>
          
          <div className="space-y-4">
            {activeWorkflows.map(workflow => (
              <div
                key={workflow.workflowId}
                className="border border-gray-200 rounded p-4 hover:border-black transition-colors cursor-pointer"
                onClick={() => setSelectedWorkflow(
                  selectedWorkflow === workflow.workflowId ? null : workflow.workflowId
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-black">
                      {projectTypes.find(p => p.id === workflow.projectType)?.name}
                    </h4>
                    <div className={`px-2 py-1 rounded text-xs ${getStageColor(workflow.currentStage)}`}>
                      {workflow.currentStage.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {workflow.startedAt.toLocaleDateString()}
                  </div>
                </div>

                {selectedWorkflow === workflow.workflowId && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <div>
                      <h5 className="font-medium text-sm text-black mb-2">Workflow ID</h5>
                      <p className="text-sm text-gray-600 font-mono">{workflow.workflowId}</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm text-black mb-2">Current Status</h5>
                      <p className="text-sm text-gray-600 capitalize">{workflow.status}</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm text-black mb-2">Next Actions</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {workflow.nextActions.map((action, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="w-1 h-1 bg-black rounded-full mt-2 flex-shrink-0"></span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {workflow.completedStages.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm text-black mb-2">Completed Stages</h5>
                        <div className="flex flex-wrap gap-2">
                          {workflow.completedStages.map(stage => (
                            <div key={stage} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              {stage.replace('_', ' ')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Stages Overview */}
      {workflowStages?.stages && (
        <div className="bg-white border border-gray-200 rounded p-6">
          <h3 className="text-lg font-serif text-black mb-4">Workflow Stages</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(workflowStages.stages).map(([stageId, stage]: [string, any]) => (
              <div key={stageId} className="border border-gray-200 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-black">{stage.name}</h4>
                  <div className={`px-2 py-1 rounded text-xs ${getStageColor(stageId)}`}>
                    {agentNames[stage.primaryAgent]}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Supporting Agents:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {stage.supportingAgents.map((agent: string) => (
                        <span key={agent} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {agentNames[agent]}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Outputs:</span>
                    <ul className="mt-1">
                      {stage.outputs.map((output: string) => (
                        <li key={output} className="text-xs text-gray-600 flex items-center space-x-1">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span>{output.replace('_', ' ')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Specialties Reference */}
      {agentSpecialties?.specialties && (
        <div className="bg-white border border-gray-200 rounded p-6">
          <h3 className="text-lg font-serif text-black mb-4">Agent Specialties Reference</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(agentSpecialties.specialties).map(([agentId, specialties]: [string, any]) => (
              <div key={agentId} className="border border-gray-200 rounded p-4">
                <h4 className="font-medium text-black mb-2">{agentNames[agentId]}</h4>
                <div className="space-y-1">
                  {specialties.map((specialty: string) => (
                    <div key={specialty} className="text-sm text-gray-600 flex items-center space-x-2">
                      <span className="w-1 h-1 bg-black rounded-full"></span>
                      <span>{specialty}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}