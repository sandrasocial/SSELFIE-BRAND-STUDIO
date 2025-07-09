import React, { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AgentResponse {
  agent: string;
  task: string;
  response: string;
  timestamp: Date;
  approved?: boolean;
}

const agents = [
  { id: 'victoria', name: 'Victoria', role: 'UX Designer AI', avatar: '👩‍🎨' },
  { id: 'maya', name: 'Maya', role: 'Dev AI', avatar: '👩‍💻' },
  { id: 'rachel', name: 'Rachel', role: 'Voice AI', avatar: '✍️' },
  { id: 'ava', name: 'Ava', role: 'Automation AI', avatar: '🔧' },
  { id: 'quinn', name: 'Quinn', role: 'QA AI', avatar: '🔍' },
  { id: 'sophia', name: 'Sophia', role: 'Social Media AI', avatar: '📱' },
  { id: 'martha', name: 'Martha', role: 'Marketing AI', avatar: '📊' },
  { id: 'diana', name: 'Diana', role: 'Business Coach AI', avatar: '💼' },
  { id: 'wilma', name: 'Wilma', role: 'Workflow AI', avatar: '⚙️' }
];

export default function AgentSandbox() {
  const { user, isAuthenticated } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState(agents[0].id);
  const [task, setTask] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [context, setContext] = useState('');

  // Only Sandra can access agent sandbox
  if (!isAuthenticated || user?.email !== 'ssa@ssasocial.com') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Access Restricted
          </h1>
          <p className="text-[#666]">This sandbox is for Sandra only.</p>
        </div>
      </div>
    );
  }

  const handleAskAgent = async () => {
    if (!task.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/agents/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: selectedAgent,
          task: task.trim(),
          context: context.trim() || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to communicate with agent');
      }

      const data = await response.json();
      
      const newResponse: AgentResponse = {
        agent: selectedAgent,
        task: task.trim(),
        response: data.response,
        timestamp: new Date(),
        approved: false
      };

      setResponses(prev => [newResponse, ...prev]);
      setTask('');
    } catch (error) {
      console.error('Error asking agent:', error);
      alert('Failed to communicate with agent. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const approveResponse = (index: number) => {
    setResponses(prev => prev.map((response, i) => 
      i === index ? { ...response, approved: true } : response
    ));
  };

  const selectedAgentInfo = agents.find(a => a.id === selectedAgent);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light mb-4 tracking-[-0.01em] text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
            Agent Sandbox
          </h1>
          <p className="text-lg text-[#666] font-light">
            Test your AI agents safely before they go live. Experiment with different tasks and review responses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Selection & Task Input */}
          <div className="lg:col-span-1 space-y-6">
            {/* Agent Selection */}
            <div className="bg-white border border-[#e5e5e5] p-6">
              <h3 className="text-lg font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Select Agent
              </h3>
              <div className="space-y-3">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`w-full flex items-center space-x-3 p-3 text-left transition-colors ${
                      selectedAgent === agent.id
                        ? 'bg-[#0a0a0a] text-white'
                        : 'bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#0a0a0a]'
                    }`}
                  >
                    <span className="text-xl">{agent.avatar}</span>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm opacity-70">{agent.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Agent Info */}
            {selectedAgentInfo && (
              <div className="bg-white border border-[#e5e5e5] p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl">{selectedAgentInfo.avatar}</span>
                  <div>
                    <h3 className="text-lg font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                      {selectedAgentInfo.name}
                    </h3>
                    <p className="text-sm text-[#666]">{selectedAgentInfo.role}</p>
                  </div>
                </div>
                <div className="bg-[#f5f5f5] p-3 text-sm">
                  Testing mode: Responses will be shown here for review before going live.
                </div>
              </div>
            )}
          </div>

          {/* Task Input & Responses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Input */}
            <div className="bg-white border border-[#e5e5e5] p-6">
              <h3 className="text-lg font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Ask {selectedAgentInfo?.name}
              </h3>
              
              {/* Context (Optional) */}
              <div className="mb-4">
                <label className="block text-sm text-[#666] mb-2 uppercase tracking-[0.1em]">
                  Context (Optional)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Any additional context or information the agent should know..."
                  className="w-full px-4 py-3 border border-[#e5e5e5] bg-transparent text-[#0a0a0a] placeholder:text-[#666] focus:outline-none focus:border-[#0a0a0a] transition-colors resize-none"
                  rows={3}
                />
              </div>

              {/* Task */}
              <div className="mb-4">
                <label className="block text-sm text-[#666] mb-2 uppercase tracking-[0.1em]">
                  Task
                </label>
                <textarea
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="What do you want this agent to do? Be specific..."
                  className="w-full px-4 py-3 border border-[#e5e5e5] bg-transparent text-[#0a0a0a] placeholder:text-[#666] focus:outline-none focus:border-[#0a0a0a] transition-colors resize-none"
                  rows={4}
                />
              </div>

              <button
                onClick={handleAskAgent}
                disabled={isLoading || !task.trim()}
                className="px-6 py-3 bg-[#0a0a0a] text-white text-sm tracking-[0.1em] uppercase hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Asking Agent...' : 'Ask Agent'}
              </button>
            </div>

            {/* Response History */}
            <div className="space-y-4">
              {responses.length === 0 ? (
                <div className="bg-white border border-[#e5e5e5] p-8 text-center">
                  <div className="text-[#666] mb-4">No agent responses yet.</div>
                  <p className="text-sm text-[#666]">
                    Select an agent and ask them to do something to see how they respond.
                  </p>
                </div>
              ) : (
                responses.map((response, index) => (
                  <div key={index} className="bg-white border border-[#e5e5e5] p-6">
                    {/* Response Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">
                          {agents.find(a => a.id === response.agent)?.avatar}
                        </span>
                        <div>
                          <div className="font-medium">
                            {agents.find(a => a.id === response.agent)?.name}
                          </div>
                          <div className="text-sm text-[#666]">
                            {response.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      
                      {response.approved ? (
                        <div className="bg-green-100 text-green-800 px-3 py-1 text-sm">
                          Approved
                        </div>
                      ) : (
                        <button
                          onClick={() => approveResponse(index)}
                          className="bg-[#0a0a0a] text-white px-4 py-2 text-sm hover:bg-black transition-colors"
                        >
                          Approve
                        </button>
                      )}
                    </div>

                    {/* Task */}
                    <div className="mb-4">
                      <div className="text-sm text-[#666] uppercase tracking-[0.1em] mb-2">Task</div>
                      <div className="bg-[#f5f5f5] p-3 text-sm">
                        {response.task}
                      </div>
                    </div>

                    {/* Response */}
                    <div>
                      <div className="text-sm text-[#666] uppercase tracking-[0.1em] mb-2">Response</div>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {response.response}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}