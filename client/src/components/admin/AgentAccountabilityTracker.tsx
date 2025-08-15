import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';

interface AccountabilityData {
  agentId: string;
  accountabilityScore: number;
  recentActivity: {
    timestamp: string;
    userMessage: string;
    agentResponse: string;
    promisedDeliverable: string;
    actualDelivery: string;
  }[];
}

export default function AgentAccountabilityTracker() {
  const [selectedAgent, setSelectedAgent] = useState<string>('aria');

  const { data: accountabilityData, isLoading, refetch } = useQuery<AccountabilityData>({
    queryKey: ['/api/agent-accountability', selectedAgent],
    enabled: !!selectedAgent,
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 0
  });

  const agents = [
    { id: 'aria', name: 'Aria', role: 'Visionary Designer & Creative Director' },
    { id: 'zara', name: 'Zara', role: 'Technical Architect & UI/UX Expert' },
    { id: 'rachel', name: 'Rachel', role: 'Copywriting Best Friend & Voice Twin' },
    { id: 'diana', name: 'Diana', role: 'Project Coordinator & Page Assembly' },
    { id: 'quinn', name: 'Quinn', role: 'QA Agent - Luxury Quality Guardian' },
    { id: 'elena', name: 'Elena', role: 'Strategic Best Friend & Execution Leader' },
    { id: 'maya', name: 'Maya', role: 'Celebrity Stylist & Creative Director' },
    { id: 'ava', name: 'Ava', role: 'Automation AI - Luxury Workflow Architect' },
    { id: 'sophia', name: 'Sophia', role: 'Social Media Manager - Community Growth' },
    { id: 'martha', name: 'Martha', role: 'Marketing & Ads Expert' },
    { id: 'victoria', name: 'Victoria', role: 'UX Strategist & Business Consultant' },
    { id: 'wilma', name: 'Wilma', role: 'Workflow AI - Business Process Designer' },
    { id: 'olga', name: 'Olga', role: 'Organization and Infrastructure Expert' },
    { id: 'flux', name: 'Flux', role: 'Advanced Flux LoRA Prompt Specialist' },
  ];

  const getAccountabilityBadge = (score: number) => {
    if (score >= 90) return { color: 'bg-green-100 text-green-800', label: 'EXCELLENT' };
    if (score >= 70) return { color: 'bg-yellow-100 text-yellow-800', label: 'GOOD' };
    if (score >= 50) return { color: 'bg-orange-100 text-orange-800', label: 'NEEDS IMPROVEMENT' };
    return { color: 'bg-red-100 text-red-800', label: 'CRITICAL' };
  };

  const getDeliveryStatus = (promised: string, actual: string) => {
    if (actual === 'File Created' && promised === 'Delivery Promise Detected') {
      return { color: 'text-green-600', label: '✓ DELIVERED' };
    }
    if (promised === 'Delivery Promise Detected' && actual === 'No File Creation') {
      return { color: 'text-red-600', label: '✗ BROKEN PROMISE' };
    }
    return { color: 'text-gray-600', label: '- GENERAL RESPONSE' };
  };

  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Selection */}
      <Card className="border border-gray-200">
        <CardHeader>
          <h3 className="text-lg font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
            Agent Accountability Tracker
          </h3>
          <p className="text-sm text-gray-600">Monitor agent promises vs actual deliverables</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {agents.map((agent) => (
              <Button
                key={agent.id}
                variant={selectedAgent === agent.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAgent(agent.id)}
                className={selectedAgent === agent.id ? "bg-black text-white" : ""}
              >
                {agent.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accountability Score */}
      {accountabilityData && (
        <Card className="border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h4 className="font-medium capitalize">{selectedAgent} Accountability</h4>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-black">
                  {accountabilityData.accountabilityScore}%
                </div>
                <div className="text-sm text-gray-600">Promise-to-Delivery Rate</div>
              </div>
              <div>
                <Badge className={getAccountabilityBadge(accountabilityData.accountabilityScore).color}>
                  {getAccountabilityBadge(accountabilityData.accountabilityScore).label}
                </Badge>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <h5 className="font-medium text-sm text-gray-700">Recent Activity (Last 20 Interactions)</h5>
              <div className="space-y-3">
                {accountabilityData.recentActivity.map((activity, index) => {
                  const deliveryStatus = getDeliveryStatus(activity.promisedDeliverable, activity.actualDelivery);
                  
                  return (
                    <div key={index} className="border border-gray-100 p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                        <span className={`text-xs font-medium ${deliveryStatus.color}`}>
                          {deliveryStatus.label}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-700">Task: </span>
                          <span className="text-xs text-gray-600">
                            {activity.userMessage.substring(0, 100)}
                            {activity.userMessage.length > 100 ? '...' : ''}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-700">Response: </span>
                          <span className="text-xs text-gray-600">
                            {activity.agentResponse.substring(0, 150)}
                            {activity.agentResponse.length > 150 ? '...' : ''}
                          </span>
                        </div>

                        <div className="flex gap-4 text-xs">
                          <span className={activity.promisedDeliverable === 'Delivery Promise Detected' ? 'text-orange-600' : 'text-gray-500'}>
                            Promise: {activity.promisedDeliverable}
                          </span>
                          <span className={activity.actualDelivery === 'File Created' ? 'text-green-600' : 'text-gray-500'}>
                            Result: {activity.actualDelivery}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}