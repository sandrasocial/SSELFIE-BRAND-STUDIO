import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface EmailCampaign {
  subject: string;
  content: string;
  audience: string;
  callToAction: string;
  personalizedElements: string[];
}

interface VoiceAnalysis {
  toneConsistency: number;
  brandAlignment: number;
  conversionOptimization: number;
  authenticityScore: number;
}

interface EmailCampaignResponse {
  campaign: EmailCampaign;
  voiceAnalysis: VoiceAnalysis;
  status: string;
  message: string;
  sendResult?: any;
}

export default function RachelChat() {
  const [task, setTask] = useState('');
  const [context, setContext] = useState('');
  const [selectedCampaignType, setSelectedCampaignType] = useState('');
  const [currentCampaign, setCurrentCampaign] = useState<EmailCampaignResponse | null>(null);
  const { toast } = useToast();

  // Chat with Rachel
  const chatMutation = useMutation({
    mutationFn: async (data: { task: string; context: string }) => {
      return apiRequest('POST', '/api/agents/ask', {
        agentId: 'rachel',
        task: data.task,
        context: data.context
      });
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Rachel has responded to your request"
      });
    }
  });

  // Create email campaign
  const emailCampaignMutation = useMutation({
    mutationFn: async (data: { campaignType: string; audience: string; approved?: boolean }) => {
      return apiRequest('POST', '/api/rachel/create-email-campaign', data);
    },
    onSuccess: (data: EmailCampaignResponse) => {
      setCurrentCampaign(data);
      toast({
        title: "Email Campaign Created",
        description: data.message
      });
    }
  });

  // Approve and send campaign
  const approveCampaignMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/rachel/create-email-campaign', {
        campaignType: selectedCampaignType,
        audience: '2500 Flodesk subscribers',
        approved: true
      });
    },
    onSuccess: () => {
      toast({
        title: "Campaign Approved",
        description: "Email campaign has been sent to your subscribers"
      });
      setCurrentCampaign(null);
    }
  });

  const handleChat = () => {
    if (!task.trim()) return;
    chatMutation.mutate({ task, context });
    setTask('');
    setContext('');
  };

  const handleCreateCampaign = () => {
    if (!selectedCampaignType) return;
    emailCampaignMutation.mutate({
      campaignType: selectedCampaignType,
      audience: '2500 Flodesk subscribers'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border border-gray-200 p-6 mb-8">
          <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
            Rachel AI - Copywriting Agent
          </h1>
          <p className="text-gray-600">
            Your authentic voice copywriter with access to Flodesk, Resend, and Sandra's complete voice profile
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chat Interface */}
          <div className="bg-white border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                Chat with Rachel
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task for Rachel</label>
                <textarea
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Example: 'Write an email announcing SSELFIE AI to my 2500 subscribers'"
                  className="w-full border border-gray-300 p-3 h-24 focus:border-gray-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Context (Optional)</label>
                <input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Additional details, deadlines, specific requirements"
                  className="w-full border border-gray-300 p-3 focus:border-gray-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleChat}
                disabled={!task || chatMutation.isPending}
                className="w-full bg-black text-white p-3 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {chatMutation.isPending ? 'Sending...' : 'Chat with Rachel'}
              </button>

              {chatMutation.data && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Rachel's Response:</div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {chatMutation.data.response}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Email Campaign Creator */}
          <div className="bg-white border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
                Email Campaign Creator
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
                <select
                  value={selectedCampaignType}
                  onChange={(e) => setSelectedCampaignType(e.target.value)}
                  className="w-full border border-gray-300 p-3 focus:border-gray-500 focus:outline-none"
                >
                  <option value="">Select campaign type...</option>
                  <option value="launch_announcement">Launch Announcement</option>
                  <option value="demo_showcase">Demo Showcase</option>
                  <option value="direct_sales">Direct Sales</option>
                  <option value="nurture_sequence">Nurture Sequence</option>
                  <option value="win_back">Win Back Campaign</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3">
                <div className="text-sm font-medium text-blue-800 mb-1">Target Audience</div>
                <div className="text-sm text-blue-600">2500 Flodesk email subscribers</div>
              </div>

              <button
                onClick={handleCreateCampaign}
                disabled={!selectedCampaignType || emailCampaignMutation.isPending}
                className="w-full bg-black text-white p-3 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {emailCampaignMutation.isPending ? 'Creating Campaign...' : 'Create Email Campaign'}
              </button>
            </div>
          </div>
        </div>

        {/* Campaign Review */}
        {currentCampaign && (
          <div className="bg-white border border-gray-200 p-6 mt-8">
            <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
              Campaign Ready for Approval
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Email Preview */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium mb-3">Email Preview</h3>
                <div className="border border-gray-200 p-4 bg-gray-50">
                  <div className="font-medium mb-2">Subject: {currentCampaign.campaign.subject}</div>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                    {currentCampaign.campaign.content}
                  </div>
                </div>
              </div>

              {/* Voice Analysis */}
              <div>
                <h3 className="text-lg font-medium mb-3">Voice Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Tone Consistency</span>
                    <span className={`text-sm font-medium ${getScoreColor(currentCampaign.voiceAnalysis.toneConsistency)}`}>
                      {currentCampaign.voiceAnalysis.toneConsistency}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Brand Alignment</span>
                    <span className={`text-sm font-medium ${getScoreColor(currentCampaign.voiceAnalysis.brandAlignment)}`}>
                      {currentCampaign.voiceAnalysis.brandAlignment}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Conversion Optimization</span>
                    <span className={`text-sm font-medium ${getScoreColor(currentCampaign.voiceAnalysis.conversionOptimization)}`}>
                      {currentCampaign.voiceAnalysis.conversionOptimization}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Authenticity Score</span>
                    <span className={`text-sm font-medium ${getScoreColor(currentCampaign.voiceAnalysis.authenticityScore)}`}>
                      {currentCampaign.voiceAnalysis.authenticityScore}%
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => approveCampaignMutation.mutate()}
                    disabled={approveCampaignMutation.isPending}
                    className="w-full bg-black text-white p-3 hover:bg-black disabled:bg-gray-300 transition-colors"
                  >
                    {approveCampaignMutation.isPending ? 'Sending...' : 'Approve & Send to 2500 Subscribers'}
                  </button>

                  <button
                    onClick={() => setCurrentCampaign(null)}
                    className="w-full bg-gray-200 text-gray-800 p-3 hover:bg-gray-300 transition-colors"
                  >
                    Reject & Revise
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}