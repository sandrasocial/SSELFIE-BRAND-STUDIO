/**
 * SANDRA'S AGENT MANAGEMENT DASHBOARD
 * Conversational interface with approval workflows and frontend previews
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Clock, MessageSquare, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';

interface AgentProposal {
  id: string;
  agentId: string;
  agentName: string;
  type: 'email' | 'api' | 'database' | 'workflow' | 'design' | 'file';
  title: string;
  description: string;
  reasoning: string;
  impact: string;
  preview?: string;
  conversation: Array<{
    id: string;
    role: 'agent' | 'sandra';
    content: string;
    timestamp: string;
  }>;
  status: 'proposed' | 'in_discussion' | 'ready_for_approval' | 'approved' | 'rejected' | 'implemented';
  createdAt: string;
  updatedAt: string;
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProposal, setSelectedProposal] = useState<AgentProposal | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Fetch all proposals
  const { data: proposalsData, isLoading } = useQuery({
    queryKey: ['/api/agent/proposals'],
    refetchInterval: 5000 // Auto-refresh every 5 seconds
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async ({ proposalId, message }: { proposalId: string; message: string }) => {
      const response = await apiRequest('POST', `/api/agent/proposals/${proposalId}/chat`, { message });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent/proposals'] });
      setChatMessage('');
    }
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ proposalId, message }: { proposalId: string; message?: string }) => {
      const response = await apiRequest('POST', `/api/agent/proposals/${proposalId}/approve`, { message });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent/proposals'] });
      setSelectedProposal(null);
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ proposalId, reason }: { proposalId: string; reason: string }) => {
      const response = await apiRequest('POST', `/api/agent/proposals/${proposalId}/reject`, { reason });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent/proposals'] });
      setSelectedProposal(null);
    }
  });

  const proposals = proposalsData?.proposals || [];
  const summary = proposalsData?.summary || { total: 0, pending: 0, approved: 0, implemented: 0 };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'proposed': return <Clock className="h-4 w-4" />;
      case 'in_discussion': return <MessageSquare className="h-4 w-4" />;
      case 'ready_for_approval': return <AlertCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'implemented': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed': return 'bg-blue-100 text-blue-800';
      case 'in_discussion': return 'bg-yellow-100 text-yellow-800';
      case 'ready_for_approval': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'implemented': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = async () => {
    if (!selectedProposal || !chatMessage.trim()) return;
    
    await chatMutation.mutateAsync({
      proposalId: selectedProposal.id,
      message: chatMessage
    });
  };

  const handleApprove = async () => {
    if (!selectedProposal) return;
    
    await approveMutation.mutateAsync({
      proposalId: selectedProposal.id,
      message: 'Approved! Please implement this change.'
    });
  };

  const handleReject = async () => {
    if (!selectedProposal) return;
    
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    await rejectMutation.mutateAsync({
      proposalId: selectedProposal.id,
      reason
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading your agent dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-serif font-light text-black">Agent Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Chat with your agents, review proposals, and approve changes before they go live
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-gray-600">Total Proposals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">{summary.pending}</div>
              <p className="text-xs text-gray-600">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{summary.approved}</div>
              <p className="text-xs text-gray-600">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-emerald-600">{summary.implemented}</div>
              <p className="text-xs text-gray-600">Implemented</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Proposals List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-serif">Agent Proposals</CardTitle>
                <CardDescription>Click to review and chat with your agents</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  {proposals.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No proposals yet</p>
                      <p className="text-xs">Your agents will create proposals here</p>
                    </div>
                  ) : (
                    proposals.map((proposal: AgentProposal) => (
                      <div
                        key={proposal.id}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                          selectedProposal?.id === proposal.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedProposal(proposal)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(proposal.status)}
                            <span className="font-medium text-sm">{proposal.agentName}</span>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(proposal.status)}`}>
                            {proposal.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm mb-1">{proposal.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{proposal.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Conversation & Preview */}
          <div className="lg:col-span-2">
            {selectedProposal ? (
              <div className="space-y-6">
                {/* Proposal Details */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-serif">{selectedProposal.title}</CardTitle>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPreview(!showPreview)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {showPreview ? 'Hide' : 'Show'} Preview
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Proposed by {selectedProposal.agentName} • {selectedProposal.type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-gray-600">{selectedProposal.description}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Why This Matters</h4>
                        <p className="text-sm text-gray-600">{selectedProposal.reasoning}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Business Impact</h4>
                        <p className="text-sm text-gray-600">{selectedProposal.impact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Preview */}
                {showPreview && selectedProposal.preview && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-serif">Preview</CardTitle>
                      <CardDescription>How this will look when implemented</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="border border-gray-200 rounded-lg p-4 bg-white"
                        dangerouslySetInnerHTML={{ __html: selectedProposal.preview }}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Conversation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-serif">Conversation</CardTitle>
                    <CardDescription>Chat with {selectedProposal.agentName} about this proposal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 mb-4">
                      {selectedProposal.conversation.map((message, index) => (
                        <div key={message.id} className={`mb-4 ${message.role === 'sandra' ? 'text-right' : 'text-left'}`}>
                          <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                            message.role === 'sandra' 
                              ? 'bg-black text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.role === 'sandra' ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>

                    <div className="space-y-4">
                      <Textarea
                        placeholder={`Chat with ${selectedProposal.agentName}...`}
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSendMessage}
                          disabled={!chatMessage.trim() || chatMutation.isPending}
                          size="sm"
                        >
                          Send Message
                        </Button>
                        
                        {selectedProposal.status !== 'implemented' && selectedProposal.status !== 'rejected' && (
                          <>
                            <Button
                              onClick={handleApprove}
                              disabled={approveMutation.isPending}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            
                            <Button
                              onClick={handleReject}
                              disabled={rejectMutation.isPending}
                              size="sm"
                              variant="destructive"
                            >
                              <ThumbsDown className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a Proposal</h3>
                  <p className="text-sm text-gray-600">
                    Choose a proposal from the left to start chatting with your agent
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}