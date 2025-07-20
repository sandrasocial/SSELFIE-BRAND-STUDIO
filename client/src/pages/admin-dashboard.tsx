import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { VisualDesignPreview } from "@/components/visual-design-preview";
import { DevPreviewModal } from "@/components/dev-preview-modal";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TestAdminCard from '@/components/admin/TestAdminCard';
import AdminHero from '@/components/admin/AdminHero';
import AdminHeroRedesigned from '@/components/admin/AdminHeroRedesigned';
import AgentDashboard from '@/components/admin/AgentDashboard';
import AgentDirectorInterface from '@/components/admin/AgentDirectorInterface';
import AgentAnalyticsDashboard from '@/components/admin/AgentAnalyticsDashboard';
import EnhancedAgentCoordination from '@/components/admin/EnhancedAgentCoordination';
import AgentEnhancementDashboard from '@/components/admin/AgentEnhancementDashboard';
import AgentPerformanceMonitor from '@/components/admin/AgentPerformanceMonitor';
import AgentAccountabilityTracker from '@/components/admin/AgentAccountabilityTracker';
import AgentWorkflowAccelerator from '@/components/admin/AgentWorkflowAccelerator';
import AgentCoordinationDashboard from '@/components/admin/AgentCoordinationDashboard';
import AgentUtilizationOptimizer from '@/components/admin/AgentUtilizationOptimizer';
import AgentPowerDashboard from '@/components/admin/AgentPowerDashboard';
import DualModeAgentChat from '@/components/admin/DualModeAgentChat';
import WorkflowCreator from '@/components/Elena/WorkflowCreator';

// Agent configurations now fetched dynamically from API (includes Olga automatically)

function AdminDashboardOld() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [useNewHero, setUseNewHero] = useState(false);
  const queryClientInstance = useQueryClient();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.email !== 'ssa@ssasocial.com')) {
      setLocation('/admin-access-only');
      return;
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated && user?.email === 'ssa@ssasocial.com',
    retry: false
  });

  const { data: agents = [], isLoading: agentsLoading, error: agentsError } = useQuery({
    queryKey: ['/api/agents'],
    enabled: isAuthenticated && user?.email === 'ssa@ssasocial.com',
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  // Debug logging
  console.log('Admin Dashboard - Agents data:', { 
    agents, 
    agentsLoading, 
    agentsError, 
    agentsCount: agents.length,
    isAuthenticated,
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  });

  // Force clear cache and refetch if needed
  useEffect(() => {
    if (isAuthenticated && user?.email === 'ssa@ssasocial.com') {
      queryClientInstance.invalidateQueries({ queryKey: ['/api/agents'] });
    }
  }, [isAuthenticated, user?.email, queryClientInstance]);

  const refreshAgents = () => {
    queryClientInstance.invalidateQueries({ queryKey: ['/api/agents'] });
    queryClientInstance.refetchQueries({ queryKey: ['/api/agents'] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.email !== 'ssa@ssasocial.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Admin Navigation */}
      <nav className="bg-black text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/sandra-command">
              <div className="font-serif text-lg tracking-wide">SANDRA COMMAND</div>
            </Link>
            <div className="flex space-x-6">
              <button 
                onClick={() => setActiveTab('director')}
                className={`text-sm uppercase tracking-wide hover:text-gray-300 ${activeTab === 'director' ? 'text-white border-b border-white' : ''}`}
              >
                Elena CEO
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`text-sm uppercase tracking-wide hover:text-gray-300 ${activeTab === 'dashboard' ? 'text-white border-b border-white' : ''}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`text-sm uppercase tracking-wide hover:text-gray-300 ${activeTab === 'analytics' ? 'text-white border-b border-white' : ''}`}
              >
                Analytics
              </button>
              <button 
                onClick={() => setActiveTab('coordination')}
                className={`text-sm uppercase tracking-wide hover:text-gray-300 ${activeTab === 'coordination' ? 'text-white border-b border-white' : ''}`}
              >
                Coordination
              </button>
              <button 
                onClick={() => setActiveTab('enhancements')}
                className={`text-sm uppercase tracking-wide hover:text-gray-300 ${activeTab === 'enhancements' ? 'text-white border-b border-white' : ''}`}
              >
                Enhancements
              </button>
              <button 
                onClick={() => setActiveTab('performance')}
                className={`text-sm uppercase tracking-wide hover:text-gray-300 ${activeTab === 'performance' ? 'text-white border-b border-white' : ''}`}
              >
                Performance
              </button>
              <Link href="/flux-collection-manager" className="text-sm uppercase tracking-wide hover:text-gray-300">
                Flux Collections
              </Link>
              <Link href="/visual-editor" className="text-sm uppercase tracking-wide hover:text-gray-300">
                Visual Editor
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/workspace" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Back to Platform
            </Link>
            <a href="/api/logout" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Logout
            </a>
          </div>
        </div>
      </nav>
      
      {/* Content */}
      <div className="pt-4">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Conditional Tab Content */}
          {activeTab === 'director' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-serif text-black mb-2">Elena - AI Agent Director & CEO</h1>
                <p className="text-gray-600">Strategic vision coordination • Multi-agent workflow orchestration • Performance oversight</p>
              </div>
              
              {/* Elena's Workflow Creator */}
              <div className="bg-white border border-gray-200 p-6">
                <WorkflowCreator />
              </div>
              
              <AgentDirectorInterface />
            </div>
          )}
          
          {activeTab === 'dashboard' && (
            <>
              {/* Hero Component Toggle */}
              <div className="mb-8 p-4 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg">Admin Hero Component</h3>
                  <button
                    onClick={() => setUseNewHero(!useNewHero)}
                    className="px-4 py-2 bg-black text-white hover:bg-gray-800 text-sm uppercase tracking-wide"
                  >
                    {useNewHero ? 'Use Original Hero' : 'Use New Redesigned Hero'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {useNewHero ? 'Currently showing the new redesigned hero component created by Aria' : 'Currently showing the original admin hero component'}
                </p>
              </div>
              
              {/* Hero Component */}
              {useNewHero ? <AdminHeroRedesigned /> : <AdminHero />}
              
              {/* File Creation Test */}
              <TestAdminCard />
              <AgentDashboard />
            </>
          )}
          
          {activeTab === 'analytics' && (
            <AgentAnalyticsDashboard />
          )}
          
          {activeTab === 'coordination' && (
            <EnhancedAgentCoordination />
          )}
          
          {activeTab === 'enhancements' && (
            <AgentEnhancementDashboard />
          )}
          
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <AgentPowerDashboard />
              <AgentUtilizationOptimizer />
              <AgentPerformanceMonitor />
              <AgentAccountabilityTracker />
              <AgentWorkflowAccelerator />
              <AgentCoordinationDashboard />
            </div>
          )}
          
          {activeTab === 'dashboard' && (
            <>
              {/* Business Metrics */}
          <section className="mb-12">
            <h2 className="font-serif text-2xl mb-6">Business Overview</h2>
            {statsLoading ? (
              <div className="border border-gray-200 p-6 text-center">
                <div className="text-sm text-gray-600">Loading business metrics...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Platform Users" value={stats?.totalUsers || 0} subtitle="total registered" />
                <StatCard title="Active Subscribers" value={stats?.activeSubscriptions || 0} subtitle="paying customers" />
                <StatCard title="AI Images Created" value={stats?.totalImages || 0} subtitle="total generations" />
                <StatCard title="Monthly Revenue" value={`€${stats?.monthlyRevenue || 0}`} subtitle="current month" />
              </div>
            )}
          </section>

          {/* AI Agent Team Cards */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl">Your AI Team</h2>
              <div className="flex gap-4">
                <Link href="/visual-editor">
                  <Button className="bg-black text-white hover:bg-gray-800 text-sm uppercase tracking-wide">
                    Open Visual Editor
                  </Button>
                </Link>
                <button 
                  onClick={refreshAgents}
                  className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white text-sm uppercase tracking-wide"
                >
                  Refresh ({agents.length})
                </button>
              </div>
            </div>
            


            {/* Dual Mode Agent Chat */}
            <DualModeAgentChat />
            
          {/* Individual Agent Chat Interfaces */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Quick Chat Interfaces
              </h3>
              {agentsLoading ? (
                <div className="border border-gray-200 p-6 text-center">
                  <div className="text-sm text-gray-600">Loading agent chat interfaces...</div>
                </div>
              ) : agentsError ? (
                <div className="border border-red-200 bg-red-50 p-6 text-center">
                  <div className="text-sm text-red-600">Error loading agents: {agentsError.message}</div>
                  <button 
                    onClick={refreshAgents}
                    className="mt-2 px-4 py-2 bg-red-600 text-white text-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : agents.length === 0 ? (
                <div className="border border-yellow-200 bg-yellow-50 p-6 text-center">
                  <div className="text-sm text-yellow-600">No agents available for quick chat.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {agents.map((agent: any) => (
                    <div key={agent.id} id={`agent-chat-${agent.id}`}>
                      <AgentChat 
                        agentId={agent.id} 
                        agentName={agent.name} 
                        role={agent.role}
                        status={agent.status || 'active'}
                        currentTask={agent.currentTask || 'Ready to assist'}
                        metrics={agent.metrics || { tasksCompleted: 0, efficiency: 100, lastActivity: new Date() }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface AgentChatProps {
  agentId: string;
  agentName: string;
  role: string;
  status?: string;
  currentTask?: string;
  metrics?: {
    tasksCompleted: number;
    efficiency: number;
    lastActivity: Date;
  };
}

function AgentChat({ agentId, agentName, role, status, currentTask, metrics }: AgentChatProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewType, setPreviewType] = useState<'component' | 'layout' | 'page' | 'email'>('component');
  const [showDevPreview, setShowDevPreview] = useState(false);
  const [devPreviewData, setDevPreviewData] = useState<any>(null);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(`agent-chat-${agentId}`);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setChatHistory(parsed);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, [agentId]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem(`agent-chat-${agentId}`, JSON.stringify(chatHistory));
    }
  }, [chatHistory, agentId]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      // Use the working admin bypass endpoint
      const response = await fetch('/api/admin/agent-chat-bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId,
          message: content,
          adminToken: 'sandra-admin-2025',
          conversationHistory: chatHistory.slice(-10).map(msg => ({
            type: msg.type,
            content: msg.content
          })) // Send last 10 messages with proper format
        })
      });
      
      if (!response.ok) {
        throw new Error(`Agent chat failed: ${response.statusText}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      const newMessage = {
        id: Date.now(),
        type: 'user',
        content: message,
        timestamp: new Date()
      };

      // Agent response will be created below after parsing

      // Enhanced DEV_PREVIEW parsing and file creation detection
      let parsedDevPreview = null;
      let cleanedMessage = data.response || data.message || 'Agent response received';
      
      // Check if this was a file creation response
      if (data.fileCreated && data.filePath) {
        parsedDevPreview = {
          type: 'file',
          title: `${data.agentId.toUpperCase()} Created File`,
          description: `Successfully created ${data.filePath}`,
          changes: [
            `✅ File created: ${data.filePath}`,
            `📂 Agent: ${data.agentId}`,
            `🕒 Timestamp: ${data.timestamp}`
          ],
          preview: `<div class="bg-green-50 border border-green-200 p-4 rounded"><h3 class="text-green-800 font-bold">File Created Successfully!</h3><p class="text-green-700">Path: ${data.filePath}</p><p class="text-green-600 text-sm">Agent ${data.agentId} has successfully created this file in your codebase.</p></div>`
        };
      }
      
      try {
        console.log('🔍 Checking message for DEV_PREVIEW:', cleanedMessage ? cleanedMessage.substring(0, 200) + '...' : 'No message content');
        
        // ROBUST JSON EXTRACTION AND PARSING
        const extractValidJson = (message) => {
          console.log('🔍 Starting robust JSON extraction...');
          
          // Pattern 1: Complete ```json blocks
          const completeJsonPattern = /```json\s*(\{[^`]*\})\s*```/s;
          let match = message.match(completeJsonPattern);
          
          if (match) {
            console.log('✅ Found complete JSON block with closing ```');
            return match[1];
          }
          
          // Pattern 2: Truncated ```json blocks - find the valid JSON object
          const openJsonPattern = /```json\s*(\{[\s\S]*?)(?:```|$)/s;
          match = message.match(openJsonPattern);
          
          if (match) {
            console.log('🔧 Found truncated JSON block, extracting valid part...');
            const jsonStr = match[1];
            
            // Parse character by character to find complete JSON object
            let braceCount = 0;
            let inString = false;
            let escapeNext = false;
            
            for (let i = 0; i < jsonStr.length; i++) {
              const char = jsonStr[i];
              
              if (escapeNext) {
                escapeNext = false;
                continue;
              }
              
              if (char === '\\') {
                escapeNext = true;
                continue;
              }
              
              if (char === '"' && !escapeNext) {
                inString = !inString;
                continue;
              }
              
              if (!inString) {
                if (char === '{') {
                  braceCount++;
                } else if (char === '}') {
                  braceCount--;
                  if (braceCount === 0) {
                    // Found complete JSON object
                    const validJson = jsonStr.substring(0, i + 1);
                    console.log('✅ Extracted complete JSON object:', validJson.length, 'chars');
                    return validJson;
                  }
                }
              }
            }
          }
          
          return null;
        };
        
        // Extract JSON and attempt parsing
        const jsonString = extractValidJson(cleanedMessage);
        let jsonMatch = null;
        
        if (jsonString) {
          console.log('🔍 JSON extracted, attempting to parse...');
          console.log('🔍 JSON preview:', jsonString.substring(0, 150) + '...');
          
          try {
            parsedDevPreview = JSON.parse(jsonString);
            console.log('✅ JSON parsed successfully!');
            console.log('✅ Preview data:', {
              type: parsedDevPreview.type,
              title: parsedDevPreview.title,
              hasChanges: Array.isArray(parsedDevPreview.changes),
              changesCount: parsedDevPreview.changes?.length || 0
            });
          } catch (parseError) {
            console.error('❌ JSON parsing failed:', parseError.message);
            console.log('🔍 Failed JSON sample:', jsonString.substring(0, 200));
            
            // Create fallback for Victoria design responses
            if (data.agentId === 'victoria' && jsonString.includes('"type"')) {
              console.log('🎨 Creating fallback for Victoria design response');
              parsedDevPreview = {
                type: 'component',
                title: 'Victoria Design Response',
                description: 'Victoria provided design suggestions',
                changes: ['Design suggestions from Victoria'],
                preview: 'Victoria provided design guidance',
                fallback: true
              };
            }
          }
        }
      } catch (error) {
        console.error('❌ Failed to parse DEV_PREVIEW:', error.message);
        console.error('Raw message sample:', cleanedMessage ? cleanedMessage.substring(0, 500) : 'No message content');
        console.log('🔧 Trying fallback detection for Victoria design responses...');
        
        // Fallback: Check if Victoria is providing design guidance without proper JSON
        if (data.agentId === 'victoria' && cleanedMessage && (
          cleanedMessage.includes('design') || 
          cleanedMessage.includes('layout') || 
          cleanedMessage.includes('component') ||
          cleanedMessage.includes('styling') ||
          cleanedMessage.includes('luxury')
        )) {
          console.log('🎨 Victoria design response detected, creating synthetic preview');
          parsedDevPreview = {
            type: 'component',
            title: 'Victoria Design Suggestion',
            description: 'Design improvements suggested by Victoria',
            preview: `<div class="bg-white p-6"><h3 class="text-xl mb-4">Victoria's Design Suggestion</h3><p class="text-gray-600">${cleanedMessage.substring(0, 200)}...</p></div>`,
            changes: ['Victoria provided design guidance - check full message for details']
          };
        }
      }

      const agentResponse = {
        id: Date.now() + 1,
        type: 'agent',
        content: cleanedMessage,
        timestamp: new Date(),
        agentName: data.agentName || agentName,
        agentRole: data.agentRole || role,
        hasPreview: data.hasPreview,
        previewContent: data.previewContent,
        previewType: data.previewType,
        businessContext: data.businessContext,
        devPreview: parsedDevPreview,
        fileOperations: data.fileOperations || []
      };
      setChatHistory(prev => [...prev, newMessage, agentResponse]);
      
      // Show development preview if agent provided one (check both sources)
      if (parsedDevPreview || data.devPreview) {
        const previewData = parsedDevPreview || data.devPreview;
        console.log('Setting dev preview data:', previewData);
        setDevPreviewData(previewData);
        setShowDevPreview(true);
        
        // Force a small delay to ensure state updates
        setTimeout(() => {
          console.log('Dev preview modal should be open:', showDevPreview);
        }, 100);
      }
      // Legacy preview support
      else if (data.hasPreview && agentId === 'victoria') {
        setPreviewContent(data.previewContent);
        setPreviewType(data.previewType || 'component');
        setShowPreview(true);
      }
      
      setMessage('');
    }
  });

  return (
    <div className="border border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">{role}</div>
          {status && (
            <span className={`px-2 py-1 text-xs rounded ${
              status === 'active' ? 'bg-green-100 text-green-800' :
              status === 'working' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-600'
            }`}>
              {status}
            </span>
          )}
        </div>
        <h3 className="font-serif text-xl">{agentName}</h3>
        {currentTask && (
          <div className="text-xs text-gray-500 mt-1">Current: {currentTask}</div>
        )}
        {metrics && (
          <div className="flex text-xs text-gray-500 mt-2 space-x-4">
            <span>Tasks: {metrics.tasksCompleted}</span>
            <span>Efficiency: {metrics.efficiency}%</span>
          </div>
        )}
      </div>
      
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {chatHistory.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8">
            <div className="mb-2">🤖 {agentName} ready to assist</div>
            <div className="text-xs">Connected to AI • Full system access</div>
          </div>
        ) : (
          chatHistory.map((msg) => (
            <div key={msg.id} className={`${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-lg p-3 rounded ${
                msg.type === 'user' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 border border-gray-200'
              }`}>
                {msg.type === 'agent' && (
                  <div className="text-xs text-gray-600 mb-1 font-medium">
                    {msg.agentName || agentName}
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                
                {/* DEV_PREVIEW Button */}
                {msg.devPreview && (
                  <button
                    onClick={() => {
                      setDevPreviewData(msg.devPreview);
                      setShowDevPreview(true);
                    }}
                    className="text-xs mt-2 underline block text-blue-600 hover:text-blue-800"
                  >
                    🔧 View Development Preview
                  </button>
                )}
                
                {/* Legacy Preview Button */}
                {msg.hasPreview && (
                  <button
                    onClick={() => {
                      setPreviewContent(msg.previewContent);
                      setPreviewType(msg.previewType);
                      setShowPreview(true);
                    }}
                    className="text-xs mt-2 underline block"
                  >
                    View Design Preview
                  </button>
                )}
                
                {/* File Operations Display */}
                {msg.fileOperations && msg.fileOperations.length > 0 && (
                  <div className="text-xs mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="font-medium text-blue-800 mb-1">📁 File Operations:</div>
                    {msg.fileOperations.map((op, index) => (
                      <div key={index} className={`text-blue-700 ${op.success ? '' : 'text-red-700'}`}>
                        {op.success ? '✅' : '❌'} {op.type.toUpperCase()}: {op.path}
                        {op.error && <div className="text-red-600 text-xs ml-4">Error: {op.error}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {msg.businessContext && (
                  <div className="text-xs text-gray-500 mt-2">
                    Platform: {msg.businessContext.users} users • {msg.businessContext.revenue} revenue
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Visual Design Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-serif text-xl">{agentName} Design Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-sm uppercase tracking-wide hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <VisualDesignPreview
              designContent={previewContent}
              previewType={previewType}
              onApprove={(approved) => {
                if (approved) {
                  // Send approval message
                  sendMessage.mutate("Approved! Please implement this design.");
                } else {
                  // Send revision request
                  sendMessage.mutate("Please revise this design with my feedback.");
                }
                setShowPreview(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Development Preview Modal */}
      <DevPreviewModal
        isOpen={showDevPreview}
        onClose={() => setShowDevPreview(false)}
        agentName={agentName}
        previewData={devPreviewData || {
          type: 'component',
          title: 'Development Preview',
          description: 'Preview of proposed changes',
          changes: []
        }}
        onApprove={async () => {
          // If there's fileContent, create the actual file
          if (devPreviewData?.fileContent && devPreviewData?.filePath) {
            try {
              const response = await fetch('/api/admin/approve-component', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  agentId: agentName.toLowerCase(),
                  filePath: devPreviewData.filePath,
                  fileContent: devPreviewData.fileContent,
                  adminToken: 'sandra-admin-2025'
                })
              });
              
              const result = await response.json();
              
              if (result.success) {
                sendMessage.mutate(`✅ APPROVED & IMPLEMENTED! Component created at ${result.filePath}`);
              } else {
                sendMessage.mutate(`❌ Approval failed: ${result.error}`);
              }
            } catch (error) {
              sendMessage.mutate(`❌ Implementation error: ${error.message}`);
            }
          } else {
            sendMessage.mutate("✅ APPROVED! Please implement these changes immediately.");
          }
          setShowDevPreview(false);
        }}
        onReject={(feedback) => {
          const rejectMessage = feedback 
            ? `❌ Please revise this implementation. Feedback: ${feedback}`
            : "❌ Please revise this implementation with a different approach.";
          sendMessage.mutate(rejectMessage);
          setShowDevPreview(false);
        }}
      />
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (message.trim()) {
            sendMessage.mutate(message);
          }
        }} className="flex gap-2">
          <label htmlFor={`agent-chat-input-${agentId}`} className="sr-only">Message to {agentName}</label>
          <input
            id={`agent-chat-input-${agentId}`}
            name={`agentMessage_${agentId}`}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Ask ${agentName} anything about SSELFIE Studio...`}
            className="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black rounded"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={sendMessage.isPending || !message.trim()}
            className="px-4 py-2 bg-black text-white text-sm disabled:bg-gray-400 rounded hover:bg-gray-800 transition-colors"
          >
            {sendMessage.isPending ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Thinking...</span>
              </div>
            ) : (
              'Send'
            )}
          </button>
        </form>
        <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
          <span>{agentName} has full access to implement changes in the SSELFIE Studio codebase</span>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                if (chatHistory.length > 0) {
                  const newHistory = chatHistory.slice(0, -1);
                  setChatHistory(newHistory);
                  if (newHistory.length === 0) {
                    localStorage.removeItem(`agent-chat-${agentId}`);
                  } else {
                    localStorage.setItem(`agent-chat-${agentId}`, JSON.stringify(newHistory));
                  }
                }
              }}
              disabled={chatHistory.length === 0}
              className="text-xs text-blue-500 hover:text-blue-700 underline disabled:text-gray-400 disabled:no-underline"
            >
              Rollback
            </button>
            <button
              onClick={() => {
                setChatHistory([]);
                localStorage.removeItem(`agent-chat-${agentId}`);
              }}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <div className="bg-gray-50 p-6">
      <div className="text-sm text-gray-600 uppercase tracking-wide">{title}</div>
      <div className="text-3xl font-light font-serif mt-2">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
    </div>
  );
}

// Export the main component as default
export default AdminDashboardOld;