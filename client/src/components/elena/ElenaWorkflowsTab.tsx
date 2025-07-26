/**
 * ELENA WORKFLOWS TAB
 * Luxury interface for Elena's conversational-to-autonomous workflows
 * Real-time monitoring and manual execution controls
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DetectedWorkflow {
  id: string;
  name: string;
  description: string;
  agents: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
  customRequirements: string[];
  detectedAt: Date;
  status: 'staged' | 'executed' | 'expired';
  conversationId?: string;
}

interface ElenaWorkflowsResponse {
  success: boolean;
  workflows: DetectedWorkflow[];
  count: number;
  timestamp: string;
  error?: string;
}

export function ElenaWorkflowsTab() {
  const [workflows, setWorkflows] = useState<DetectedWorkflow[]>([]);
  const [executedWorkflows, setExecutedWorkflows] = useState<DetectedWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'staged' | 'history'>('staged');

  // Fetch workflows from API
  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      
      // Fetch both staged and executed workflows
      const [stagedResponse, executedResponse] = await Promise.all([
        fetch('/api/elena/staged-workflows', {
          credentials: 'include',
          headers: { 'Authorization': 'Bearer sandra-admin-2025' }
        }),
        fetch('/api/elena/executed-workflows', {
          credentials: 'include',
          headers: { 'Authorization': 'Bearer sandra-admin-2025' }
        })
      ]);
      
      if (!stagedResponse.ok || !executedResponse.ok) {
        throw new Error(`HTTP ${stagedResponse.status} / ${executedResponse.status}`);
      }
      
      const [stagedData, executedData] = await Promise.all([
        stagedResponse.json(),
        executedResponse.json()
      ]);
      
      if (stagedData.success && executedData.success) {
        setWorkflows(stagedData.workflows || []);
        setExecutedWorkflows(executedData.workflows || []);
        setError(null);
      } else {
        setError(stagedData.error || executedData.error || 'Failed to fetch workflows');
        setWorkflows([]);
        setExecutedWorkflows([]);
      }
    } catch (error) {
      console.error('Elena workflows fetch error:', error);
      setError(error.message);
      setWorkflows([]);
      setExecutedWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  // Execute workflow
  const executeWorkflow = async (workflowId: string) => {
    setExecuting(prev => new Set(prev).add(workflowId));
    
    try {
      const response = await fetch(`/api/elena/execute-staged-workflow/${workflowId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer sandra-admin-2025',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh workflows after execution
        await fetchWorkflows();
      } else {
        setError(data.message || 'Workflow execution failed');
      }
    } catch (error) {
      console.error('Workflow execution error:', error);
      setError(error.message);
    } finally {
      setExecuting(prev => {
        const newSet = new Set(prev);
        newSet.delete(workflowId);
        return newSet;
      });
    }
  };

  // Remove workflow
  const removeWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/elena/workflow/${workflowId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer sandra-admin-2025'
        }
      });
      
      if (response.ok) {
        await fetchWorkflows();
      }
    } catch (error) {
      console.error('Workflow removal error:', error);
    }
  };

  // Initial load only - no auto-refresh
  useEffect(() => {
    fetchWorkflows(); // Initial load only
  }, []);

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format created date
  const formatDate = (dateValue: string | Date) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
          Elena's Workflows
        </h2>
        <p className="text-gray-600 mt-2">
          Conversational workflows automatically detected and staged for execution
        </p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setActiveTab('staged')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  activeTab === 'staged'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Staged ({workflows?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  activeTab === 'history'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                History ({executedWorkflows?.length || 0})
              </button>
            </div>
            <Button 
              onClick={fetchWorkflows} 
              disabled={loading}
              variant="outline" 
              size="sm"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          
          <div className="text-xs text-gray-400">
            Manual refresh only
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Error: {error}</p>
            <Button 
              onClick={() => { setError(null); fetchWorkflows(); }} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading ? (
        <Card className="border-gray-200">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="text-gray-400 mb-2">Loading workflows...</div>
          </CardContent>
        </Card>
      ) : (
        (() => {
          const currentWorkflows = activeTab === 'staged' ? workflows : executedWorkflows;
          
          if (!currentWorkflows || currentWorkflows.length === 0) {
            return (
              <Card className="border-gray-200">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {activeTab === 'staged' ? 'No workflows detected' : 'No execution history'}
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    {activeTab === 'staged' 
                      ? "When Elena creates coordination workflows through conversation, they'll appear here for manual execution."
                      : "Executed workflows will appear here to track your workflow history."
                    }
                  </p>
                </CardContent>
              </Card>
            );
          }
          
          return (
            <div className="space-y-4">
              {currentWorkflows.map((workflow) => (
                <Card key={workflow.id} className="border-gray-200 hover:border-gray-300 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-black mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                          {workflow.name}
                        </CardTitle>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span>{formatDate(workflow.detectedAt)}</span>
                          <Badge className={getPriorityColor(workflow.priority)}>
                            {workflow.priority} priority
                          </Badge>
                          <span className="text-gray-400">•</span>
                          <span>{workflow.estimatedDuration} min</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {activeTab === 'staged' ? (
                          <>
                            <Button
                              onClick={() => executeWorkflow(workflow.id)}
                              disabled={executing.has(workflow.id)}
                              size="sm"
                              className="bg-black text-white hover:bg-gray-800 font-medium px-4"
                            >
                              {executing.has(workflow.id) ? 'Executing...' : 'Execute'}
                            </Button>
                            <Button
                              onClick={() => removeWorkflow(workflow.id)}
                              variant="outline"
                              size="sm"
                              className="text-gray-600 hover:text-red-600 border-gray-300"
                            >
                              Remove
                            </Button>
                          </>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Executed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {workflow.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Agents */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Agents ({workflow.agents?.length || 0})</h4>
                        <div className="flex flex-wrap gap-1">
                          {(workflow.agents || []).map((agent) => (
                            <Badge key={agent} variant="secondary" className="text-xs">
                              {agent}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Requirements */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Requirements ({workflow.customRequirements?.length || 0})</h4>
                        <div className="space-y-1">
                          {(workflow.customRequirements || []).slice(0, 3).map((requirement, index) => (
                            <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                              {requirement}
                            </div>
                          ))}
                          {(workflow.customRequirements?.length || 0) > 3 && (
                            <div className="text-xs text-gray-400">
                              +{(workflow.customRequirements?.length || 0) - 3} more requirements
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })()
      )}
    </div>
  );
}