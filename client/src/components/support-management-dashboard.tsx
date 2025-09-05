import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Clock, User, AlertCircle, CheckCircle, Send, Phone, Mail } from 'lucide-react';

interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'general' | 'feature_request' | 'bug_report';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: string;
  message: string;
  isFromUser: boolean;
  authorName: string;
  createdAt: string;
}

export function SupportManagementDashboard() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('open');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['/api/admin/support-tickets', { status: filterStatus, priority: filterPriority }],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: supportStats } = useQuery({
    queryKey: ['/api/admin/support-stats'],
    refetchInterval: 60000,
  });

  const { data: selectedTicketData } = useQuery({
    queryKey: ['/api/admin/support-tickets', selectedTicket],
    enabled: !!selectedTicket,
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status, priority, assignedTo }: { id: string; status?: string; priority?: string; assignedTo?: string }) => {
      const response = await fetch(`/api/admin/support-tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, priority, assignedTo })
      });
      if (!response.ok) throw new Error('Failed to update ticket');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/support-stats'] });
    }
  });

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const response = await fetch(`/api/admin/support-tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (!response.ok) throw new Error('Failed to send reply');
      return response.json();
    },
    onSuccess: () => {
      setReplyMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/support-tickets'] });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Support Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="border border-gray-200 p-6 text-center">
          <div className="text-3xl font-serif font-light mb-2 text-orange-600">
            {supportStats?.openTickets || 0}
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Open Tickets
          </div>
        </div>
        <div className="border border-gray-200 p-6 text-center">
          <div className="text-3xl font-serif font-light mb-2">
            {supportStats?.averageResponseTime || 0}h
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Avg Response Time
          </div>
        </div>
        <div className="border border-gray-200 p-6 text-center">
          <div className="text-3xl font-serif font-light mb-2 text-green-600">
            {supportStats?.resolvedToday || 0}
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Resolved Today
          </div>
        </div>
        <div className="border border-gray-200 p-6 text-center">
          <div className="text-3xl font-serif font-light mb-2">
            {supportStats?.satisfactionScore || 0}%
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Satisfaction Score
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Ticket List */}
        <div>
          {/* Filter Controls */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Tickets */}
          <div className="space-y-3">
            {tickets?.map((ticket: SupportTicket) => (
              <div 
                key={ticket.id} 
                className={`border p-4 cursor-pointer transition-colors ${
                  selectedTicket === ticket.id 
                    ? 'border-black bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                onClick={() => setSelectedTicket(ticket.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{ticket.subject}</h4>
                    <div className={`px-2 py-1 text-xs uppercase tracking-wide ${
                      ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {ticket.priority}
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 text-xs uppercase tracking-wide ${
                    ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                    ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                    ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {ticket.status.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {ticket.userName} ({ticket.userEmail})
                </div>
                
                <div className="text-sm text-gray-700 mb-2 line-clamp-2">
                  {ticket.message}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    {ticket.responses.length} responses
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(!tickets || tickets.length === 0) && (
            <div className="text-center py-8">
              <MessageSquare size={32} className="mx-auto text-gray-400 mb-3" />
              <div className="text-gray-500">No tickets found</div>
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        <div>
          {selectedTicketData ? (
            <div className="border border-gray-200 h-full flex flex-col">
              {/* Ticket Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-xl font-light mb-2">
                      {selectedTicketData.subject}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        {selectedTicketData.userName} ({selectedTicketData.userEmail})
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {new Date(selectedTicketData.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wide border border-gray-300 hover:bg-gray-50">
                      <Mail size={14} />
                      Email
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wide border border-gray-300 hover:bg-gray-50">
                      <Phone size={14} />
                      Call
                    </button>
                  </div>
                </div>

                {/* Status Controls */}
                <div className="flex items-center gap-4">
                  <select
                    value={selectedTicketData.status}
                    onChange={(e) => updateTicketMutation.mutate({ id: selectedTicketData.id, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <select
                    value={selectedTicketData.priority}
                    onChange={(e) => updateTicketMutation.mutate({ id: selectedTicketData.id, priority: e.target.value })}
                    className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Conversation */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* Original Message */}
                  <div className="bg-gray-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} />
                      <span className="font-medium">{selectedTicketData.userName}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(selectedTicketData.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-700">{selectedTicketData.message}</div>
                  </div>

                  {/* Responses */}
                  {selectedTicketData.responses?.map((response: TicketResponse) => (
                    <div 
                      key={response.id} 
                      className={`p-4 ${response.isFromUser ? 'bg-gray-50' : 'bg-blue-50'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {response.isFromUser ? <User size={16} /> : <CheckCircle size={16} />}
                        <span className="font-medium">{response.authorName}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(response.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-gray-700">{response.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Box */}
              <div className="p-6 border-t border-gray-200">
                <div className="space-y-4">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full h-24 p-3 border border-gray-300 resize-none focus:outline-none focus:border-black"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {replyMessage.length}/1000 characters
                    </div>
                    
                    <button
                      onClick={() => replyMutation.mutate({ ticketId: selectedTicketData.id, message: replyMessage })}
                      disabled={!replyMessage.trim() || replyMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wide bg-black text-white hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                    >
                      <Send size={14} />
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={32} className="mx-auto text-gray-400 mb-3" />
                <div className="text-gray-500">Select a ticket to view details</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}