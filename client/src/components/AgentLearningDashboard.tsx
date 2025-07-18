import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AgentLearningStats {
  agentId: string;
  name: string;
  totalLearningEvents: number;
  successRate: number;
  knowledgeBaseSize: number;
  lastTrainingSession: string;
  improvementTrend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

export default function AgentLearningDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<string>('maya');

  const { data: learningStats, isLoading } = useQuery({
    queryKey: ['/api/agent-learning/stats'],
    retry: false
  });

  const { data: agentPerformance } = useQuery({
    queryKey: ['/api/agent-learning/performance', selectedAgent],
    enabled: !!selectedAgent,
    retry: false
  });

  const { data: agentKnowledge } = useQuery({
    queryKey: ['/api/agent-learning/knowledge', selectedAgent],
    enabled: !!selectedAgent,
    retry: false
  });

  const { data: learningHistory } = useQuery({
    queryKey: ['/api/agent-learning/history', selectedAgent],
    enabled: !!selectedAgent,
    retry: false
  });

  const { data: recommendations } = useQuery({
    queryKey: ['/api/agent-learning/recommendations', selectedAgent],
    enabled: !!selectedAgent,
    retry: false
  });

  const agents = [
    { id: 'maya', name: 'Maya', role: 'Dev AI' },
    { id: 'victoria', name: 'Victoria', role: 'UX Designer AI' },
    { id: 'rachel', name: 'Rachel', role: 'Voice AI' },
    { id: 'ava', name: 'Ava', role: 'Automation AI' },
    { id: 'quinn', name: 'Quinn', role: 'QA AI' },
    { id: 'sophia', name: 'Sophia', role: 'Social Media AI' },
    { id: 'martha', name: 'Martha', role: 'Marketing AI' },
    { id: 'diana', name: 'Diana', role: 'Business Coach AI' },
    { id: 'wilma', name: 'Wilma', role: 'Workflow AI' }
  ];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="mb-8">
        <h1 
          className="text-4xl font-serif text-black uppercase tracking-wide mb-4"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Agent Learning & Training Dashboard
        </h1>
        <p className="text-black text-lg">
          Monitor agent intelligence, training progress, and learning capabilities
        </p>
      </div>

      <Tabs value={selectedAgent} onValueChange={setSelectedAgent} className="space-y-6">
        <TabsList className="grid grid-cols-9 w-full">
          {agents.map(agent => (
            <TabsTrigger 
              key={agent.id} 
              value={agent.id}
              className="text-sm"
            >
              {agent.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {agents.map(agent => (
          <TabsContent key={agent.id} value={agent.id} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {agentPerformance?.map((metric: any) => (
                    <div key={metric.taskType} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.taskType}</span>
                        <Badge variant={metric.successRate > 0.8 ? 'default' : 'secondary'}>
                          {Math.round(metric.successRate * 100)}%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-black h-2 rounded-full" 
                          style={{ width: `${metric.successRate * 100}%` }}
                        />
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No performance data available yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Knowledge Base */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Knowledge Base</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agentKnowledge?.slice(0, 5).map((knowledge: any, index: number) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{knowledge.topic}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(knowledge.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {knowledge.content}
                      </p>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">Building knowledge base...</p>
                  )}
                  
                  {agentKnowledge?.length > 5 && (
                    <p className="text-xs text-gray-500">
                      +{agentKnowledge.length - 5} more topics
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Learning Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Enhancement Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations?.recommendations?.map((rec: string, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded border-l-2 border-black">
                      <p className="text-sm">{rec}</p>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">Agent performing optimally</p>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-black text-black hover:bg-black hover:text-white"
                  >
                    Start Training Session
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Learning History */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">Recent Learning Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {learningHistory?.slice(0, 10).map((event: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={event.outcome === 'success' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {event.outcome}
                          </Badge>
                          <span className="text-sm font-medium">{event.taskType}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{event.context}</p>
                        <p className="text-xs text-gray-500 mt-1">{event.learningNotes}</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-8">
                      No learning events recorded yet. Agent interactions will appear here.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}