import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Brain, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConsultingAgent {
  id: string;
  name: string;
  role: string;
  specialty: string;
}

interface ConsultationResponse {
  success: boolean;
  message: string;
  agentName: string;
  agentRole: string;
  consulting: boolean;
}

export default function AdminConsultingAgents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agents, setAgents] = useState<ConsultingAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<ConsultingAgent | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [consultation, setConsultation] = useState<ConsultationResponse | null>(null);

  // Check if user is Sandra (admin access required)
  if (!user || (user.email !== 'ssa@ssasocial.com' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-white mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Admin Access Required
          </h1>
          <p className="text-gray-400">Only Sandra can access consulting agents.</p>
        </div>
      </div>
    );
  }

  // Load consulting agents on mount
  useEffect(() => {
    fetchConsultingAgents();
  }, []);

  const fetchConsultingAgents = async () => {
    try {
      const response = await fetch('/api/admin/consulting-agents', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer sandra-admin-2025`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAgents(data.consultingAgents || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to load consulting agents",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching consulting agents:', error);
      toast({
        title: "Error", 
        description: "Failed to connect to consulting agents",
        variant: "destructive"
      });
    }
  };

  const sendConsultationRequest = async () => {
    if (!selectedAgent || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select an agent and enter a message",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setConsultation(null);

    try {
      const response = await fetch('/api/admin/consulting-agents/chat', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer sandra-admin-2025`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: message.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConsultation(data);
        toast({
          title: "Analysis Complete",
          description: `${data.agentName} has provided strategic advice`,
        });
      } else {
        toast({
          title: "Consultation Failed",
          description: data.message || "Failed to get strategic advice",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Consultation error:', error);
      toast({
        title: "Error",
        description: "Failed to communicate with consulting agent",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 
              className="text-4xl font-light text-black mb-2 tracking-wider"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              CONSULTING AGENTS
            </h1>
            <p className="text-gray-600">Strategic advisors that analyze codebase and provide Replit AI instructions</p>
          </div>
          <Button 
            onClick={() => window.location.href = '/admin-dashboard'}
            variant="outline"
            className="border-black text-black hover:bg-black hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agent Selection */}
          <div>
            <h2 
              className="text-2xl font-light text-black mb-6 tracking-wider"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              SELECT CONSULTING AGENT
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {agents.map((agent) => (
                <Card 
                  key={agent.id}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedAgent?.id === agent.id 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-200 hover:border-black'
                  }`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Brain className="w-5 h-5 mr-2" />
                      {agent.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{agent.role}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{agent.specialty}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Consultation Interface */}
          <div>
            <h2 
              className="text-2xl font-light text-black mb-6 tracking-wider"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              REQUEST STRATEGIC ADVICE
            </h2>

            {selectedAgent && (
              <Card className="border-2 border-black mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Consulting with {selectedAgent.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{selectedAgent.role}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={`Ask ${selectedAgent.name} to analyze the codebase and provide strategic advice...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <Button 
                    onClick={sendConsultationRequest}
                    disabled={isLoading || !message.trim()}
                    className="w-full bg-black text-white hover:bg-gray-800"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Get Strategic Advice
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Consultation Response */}
            {consultation && (
              <Card className="border-2 border-green-500 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">
                    {consultation.agentName}'s Strategic Analysis
                  </CardTitle>
                  <p className="text-sm text-green-600">{consultation.agentRole}</p>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm font-mono bg-white p-4 rounded border">
                    {consultation.message}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      💡 Next Step: Copy the "Tell Replit AI" instructions above and paste them to Replit AI
                    </p>
                    <p className="text-xs text-blue-600">
                      These consulting agents provide read-only analysis and exact instructions for Replit AI implementation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}