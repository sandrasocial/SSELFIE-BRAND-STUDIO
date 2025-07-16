import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Rocket, 
  Mail, 
  Layout, 
  Instagram, 
  Target, 
  Brain,
  CheckCircle,
  Clock,
  ArrowRight,
  Zap
} from 'lucide-react';

export default function AgentCommandCenter() {
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  
  // Form states for different proposal types
  const [emailContext, setEmailContext] = useState({
    campaignName: 'SSELFIE Studio Launch',
    emailCount: 5,
    targetAudience: 25000,
    projectedRevenue: 3500,
    priority: 'urgent'
  });

  const [landingContext, setLandingContext] = useState({
    pageName: 'SSELFIE Studio Premium',
    tagline: 'Professional AI photos that build your personal brand',
    ctaText: 'Start Your Studio €97/month',
    targetTraffic: 50000,
    projectedRevenue: 8500,
    priority: 'high'
  });

  const [socialContext, setSocialContext] = useState({
    campaignName: 'SSELFIE AI Launch',
    expectedReach: 120000,
    projectedRevenue: 5000,
    priority: 'medium'
  });

  const [adContext, setAdContext] = useState({
    campaignName: 'SSELFIE Studio Performance',
    dailyBudget: 50,
    expectedReach: 100000,
    projectedRevenue: 6000,
    priority: 'high'
  });

  // Create individual proposal mutations
  const emailMutation = useMutation({
    mutationFn: async (context: any) => {
      const response = await apiRequest('POST', '/api/agents/create-email-proposal', context);
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Email Campaign Proposal Created", description: "Rachel has created a complete email sequence for your approval" });
    }
  });

  const landingMutation = useMutation({
    mutationFn: async (context: any) => {
      const response = await apiRequest('POST', '/api/agents/create-landing-proposal', context);
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Landing Page Proposal Created", description: "Victoria has designed a luxury landing page for your approval" });
    }
  });

  const socialMutation = useMutation({
    mutationFn: async (context: any) => {
      const response = await apiRequest('POST', '/api/agents/create-social-proposal', context);
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Social Campaign Proposal Created", description: "Sophia has created a 30-day content strategy for your approval" });
    }
  });

  const adMutation = useMutation({
    mutationFn: async (context: any) => {
      const response = await apiRequest('POST', '/api/agents/create-ad-proposal', context);
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Ad Campaign Proposal Created", description: "Martha has designed performance ads for your approval" });
    }
  });

  // Full launch campaign mutation
  const launchMutation = useMutation({
    mutationFn: async (context: any) => {
      const response = await apiRequest('POST', '/api/agents/create-launch-campaign', context);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Complete Launch Campaign Created", 
        description: `${data.proposals?.length || 4} agent proposals are ready for your approval` 
      });
    }
  });

  const agents = [
    {
      id: 'rachel',
      name: 'Rachel',
      role: 'Email Marketing Specialist',
      description: 'Creates email sequences that convert like crazy using Sandra\'s authentic voice',
      icon: Mail,
      color: 'bg-purple-100 text-purple-800',
      specialty: 'Email campaigns, welcome sequences, launch automation'
    },
    {
      id: 'victoria',
      name: 'Victoria',
      role: 'UX/UI Designer',
      description: 'Designs luxury landing pages with Vogue-level aesthetics that convert',
      icon: Layout,
      color: 'bg-pink-100 text-pink-800',
      specialty: 'Landing pages, conversion optimization, luxury design'
    },
    {
      id: 'sophia',
      name: 'Sophia',
      role: 'Social Media Manager',
      description: 'Creates authentic Instagram content that engages Sandra\'s 120K+ community',
      icon: Instagram,
      color: 'bg-blue-100 text-blue-800',
      specialty: 'Instagram strategy, content calendars, community engagement'
    },
    {
      id: 'martha',
      name: 'Martha',
      role: 'Performance Marketing Expert',
      description: 'Runs Facebook/Instagram ads that deliver measurable ROI and scale',
      icon: Target,
      color: 'bg-green-100 text-green-800',
      specialty: 'Paid advertising, conversion tracking, budget optimization'
    }
  ];

  const renderAgentCard = (agent: any) => (
    <Card key={agent.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${agent.color}`}>
            <agent.icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{agent.name}</CardTitle>
            <p className="text-sm text-gray-600">{agent.role}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-3">{agent.description}</p>
        <p className="text-xs text-gray-500 mb-4">{agent.specialty}</p>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setSelectedAgent(agent.id)}
          className="w-full"
        >
          Create Proposal
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-8 w-8" />
            <h1 className="font-serif text-4xl font-light">Agent Command Center</h1>
          </div>
          <p className="text-gray-600 mb-4">Deploy your AI agents to create marketing campaigns, designs, and content with complete visual previews before execution.</p>
          
          <div className="flex gap-4">
            <Button 
              onClick={() => launchMutation.mutate({
                launchType: 'full-launch',
                context: {
                  productName: 'SSELFIE Studio',
                  targetAudience: 25000,
                  projectedRevenue: 15000
                }
              })}
              disabled={launchMutation.isPending}
              className="bg-black text-white"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Launch Complete Campaign
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.open('/agent-approval', '_blank')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              View Approval Center
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Selection Panel */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-light">Your AI Agent Team</h2>
            <div className="space-y-3">
              {agents.map(renderAgentCard)}
            </div>
          </div>

          {/* Proposal Creation Panel */}
          <div className="lg:col-span-2">
            {!selectedAgent ? (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an agent to create a proposal</p>
                </div>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {agents.find(a => a.id === selectedAgent)?.name} Proposal Creator
                    <Badge variant="outline">{agents.find(a => a.id === selectedAgent)?.role}</Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue={selectedAgent}>
                    <TabsContent value="rachel">
                      <div className="space-y-4">
                        <h3 className="font-medium">Email Campaign Parameters</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="campaignName">Campaign Name</Label>
                            <Input
                              id="campaignName"
                              value={emailContext.campaignName}
                              onChange={(e) => setEmailContext({...emailContext, campaignName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="emailCount">Number of Emails</Label>
                            <Input
                              id="emailCount"
                              type="number"
                              value={emailContext.emailCount}
                              onChange={(e) => setEmailContext({...emailContext, emailCount: parseInt(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="targetAudience">Target Audience Size</Label>
                            <Input
                              id="targetAudience"
                              type="number"
                              value={emailContext.targetAudience}
                              onChange={(e) => setEmailContext({...emailContext, targetAudience: parseInt(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="projectedRevenue">Projected Revenue (€)</Label>
                            <Input
                              id="projectedRevenue"
                              type="number"
                              value={emailContext.projectedRevenue}
                              onChange={(e) => setEmailContext({...emailContext, projectedRevenue: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={() => emailMutation.mutate(emailContext)}
                          disabled={emailMutation.isPending}
                          className="w-full"
                        >
                          {emailMutation.isPending ? <Clock className="h-4 w-4 mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                          Create Email Campaign Proposal
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="victoria">
                      <div className="space-y-4">
                        <h3 className="font-medium">Landing Page Parameters</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="pageName">Page Name</Label>
                            <Input
                              id="pageName"
                              value={landingContext.pageName}
                              onChange={(e) => setLandingContext({...landingContext, pageName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="ctaText">CTA Button Text</Label>
                            <Input
                              id="ctaText"
                              value={landingContext.ctaText}
                              onChange={(e) => setLandingContext({...landingContext, ctaText: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="tagline">Page Tagline</Label>
                          <Textarea
                            id="tagline"
                            value={landingContext.tagline}
                            onChange={(e) => setLandingContext({...landingContext, tagline: e.target.value})}
                          />
                        </div>
                        <Button 
                          onClick={() => landingMutation.mutate(landingContext)}
                          disabled={landingMutation.isPending}
                          className="w-full"
                        >
                          {landingMutation.isPending ? <Clock className="h-4 w-4 mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                          Create Landing Page Proposal
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="sophia">
                      <div className="space-y-4">
                        <h3 className="font-medium">Social Campaign Parameters</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="socialCampaignName">Campaign Name</Label>
                            <Input
                              id="socialCampaignName"
                              value={socialContext.campaignName}
                              onChange={(e) => setSocialContext({...socialContext, campaignName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="expectedReach">Expected Reach</Label>
                            <Input
                              id="expectedReach"
                              type="number"
                              value={socialContext.expectedReach}
                              onChange={(e) => setSocialContext({...socialContext, expectedReach: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={() => socialMutation.mutate(socialContext)}
                          disabled={socialMutation.isPending}
                          className="w-full"
                        >
                          {socialMutation.isPending ? <Clock className="h-4 w-4 mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                          Create Social Campaign Proposal
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="martha">
                      <div className="space-y-4">
                        <h3 className="font-medium">Ad Campaign Parameters</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="adCampaignName">Campaign Name</Label>
                            <Input
                              id="adCampaignName"
                              value={adContext.campaignName}
                              onChange={(e) => setAdContext({...adContext, campaignName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="dailyBudget">Daily Budget (€)</Label>
                            <Input
                              id="dailyBudget"
                              type="number"
                              value={adContext.dailyBudget}
                              onChange={(e) => setAdContext({...adContext, dailyBudget: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={() => adMutation.mutate(adContext)}
                          disabled={adMutation.isPending}
                          className="w-full"
                        >
                          {adMutation.isPending ? <Clock className="h-4 w-4 mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                          Create Ad Campaign Proposal
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">How it works:</span>
                    </div>
                    <p className="text-blue-800 text-sm">
                      Your AI agent will create a complete proposal with visual previews, mockups, and detailed explanations. 
                      You'll review and approve everything before any execution or API access occurs.
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