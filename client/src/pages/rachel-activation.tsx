import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function RachelActivation() {
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const { toast } = useToast();

  const executeTaskMutation = useMutation({
    mutationFn: async (taskData: { agentId: string; task: string; context: string }) => {
      return apiRequest('POST', '/api/agents/ask', taskData);
    },
    onSuccess: (data) => {
      toast({
        title: "Task Completed",
        description: "Rachel has completed your request"
      });
      setActiveTask(null);
    },
    onError: (error) => {
      toast({
        title: "Task Failed",
        description: "There was an issue with your request",
        variant: "destructive"
      });
    }
  });

  const urgentTasks = [
    {
      id: 'email_launch',
      title: 'Launch Email Series',
      description: 'Create 3-email series announcing SSELFIE to 2500 Flodesk subscribers',
      context: 'Urgent revenue generation, €97 AI photoshoot service, financial pressure',
      priority: 'critical',
      revenue: '€11,640+ potential'
    },
    {
      id: 'instagram_stories',
      title: 'Instagram Story Sequence',
      description: 'Create 5-story sequence promoting SSELFIE with email capture',
      context: 'Drive 120K followers to email signup, visual storytelling',
      priority: 'high',
      revenue: '€5,000+ potential'
    },
    {
      id: 'dm_templates',
      title: 'DM Response Templates',
      description: 'Professional templates for 800+ unanswered Instagram messages',
      context: 'Convert existing conversations to customers, personalized responses',
      priority: 'high',
      revenue: '€3,000+ potential'
    },
    {
      id: 'conversion_funnel',
      title: 'Email Conversion Funnel',
      description: 'Design automated sequence from signup to €97 purchase',
      context: 'Nurture sequence, authentic voice, conversion optimization',
      priority: 'medium',
      revenue: '€8,000+ potential'
    }
  ];

  const handleExecuteTask = (task: any) => {
    setActiveTask(task.id);
    executeTaskMutation.mutate({
      agentId: 'rachel',
      task: task.description,
      context: task.context
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 p-6 mb-8">
          <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
            Rachel AI - Immediate Revenue Activation
          </h1>
          <p className="text-gray-600 mb-4">
            Your copywriting agent with access to 2500 Flodesk subscribers, 120K Instagram followers, and authentic Sandra voice
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-red-50 border border-red-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">€200</div>
              <div className="text-sm text-red-500">Budget Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">€50/day</div>
              <div className="text-sm text-red-500">Current Costs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">2500</div>
              <div className="text-sm text-green-500">Email Subscribers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">120K</div>
              <div className="text-sm text-green-500">Instagram Followers</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {urgentTasks.map((task) => (
            <div key={task.id} className={`border p-6 ${getPriorityColor(task.priority)}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">{task.title}</h3>
                  <p className="text-gray-700 mb-2">{task.description}</p>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Context:</strong> {task.context}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    <strong>Revenue Potential:</strong> {task.revenue}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 text-sm font-medium rounded-full ${
                    task.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {task.priority.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleExecuteTask(task)}
                  disabled={executeTaskMutation.isPending && activeTask === task.id}
                  className="bg-black text-white px-4 py-2 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {executeTaskMutation.isPending && activeTask === task.id ? 'Rachel Working...' : 'Execute Task'}
                </button>
                
                <a
                  href="/rachel-chat"
                  className="bg-gray-200 text-gray-800 px-4 py-2 hover:bg-gray-300 transition-colors"
                >
                  Advanced Chat
                </a>
              </div>

              {executeTaskMutation.data && activeTask === task.id && (
                <div className="mt-4 p-4 bg-white border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Rachel's Response:</div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {executeTaskMutation.data.response}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-black-50 border border-green-200 p-6 mt-8">
          <h2 className="text-xl font-medium mb-4">Conservative Revenue Projections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">0.1% Email Conversion</div>
              <div className="text-green-600">2500 subscribers × 0.1% × €97 = €2,425/month</div>
            </div>
            <div>
              <div className="font-medium">0.01% Instagram Conversion</div>
              <div className="text-green-600">120K followers × 0.01% × €97 = €1,164/month</div>
            </div>
            <div>
              <div className="font-medium">Combined Conservative Target</div>
              <div className="text-green-600 font-bold">€3,589/month minimum</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}