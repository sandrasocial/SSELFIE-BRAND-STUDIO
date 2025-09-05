import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, AlertCircle, Users, TrendingUp, Clock, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailDashboard {
  totalAccounts: number;
  unreadEmails: number;
  urgentEmails: number;
  customerInquiries: number;
  responsesPending: number;
  lastProcessed: string;
  accounts: Array<{
    type: 'business' | 'personal';
    email: string;
    unread: number;
    urgent: number;
    customers: number;
  }>;
}

interface EmailInsight {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionItems: string[];
  emailIds: string[];
}

export default function EmailDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email dashboard data
  const { data: dashboard, isLoading: dashboardLoading } = useQuery<EmailDashboard>({
    queryKey: ['/api/email-management/dashboard'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Process emails mutation
  const processEmailsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/email-management/process');
    },
    onSuccess: (data) => {
      toast({
        title: 'Email Processing Complete',
        description: `Processed emails with ${data.insights} insights generated`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email-management/dashboard'] });
    },
    onError: (error) => {
      toast({
        title: 'Processing Failed',
        description: 'Failed to process emails. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Start monitoring mutation
  const startMonitoringMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/email-management/monitor/start');
    },
    onSuccess: () => {
      toast({
        title: 'Monitoring Started',
        description: 'Ava will now automatically process your emails every hour',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Start Monitoring',
        description: 'Please try again',
        variant: 'destructive',
      });
    },
  });

  // Test processing mutation (admin only)
  const testProcessingMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/email-management/test-processing');
    },
    onSuccess: (data) => {
      toast({
        title: 'Test Processing Complete',
        description: `Mock processing completed - check Slack for insights!`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Test Failed',
        description: 'Admin access required',
        variant: 'destructive',
      });
    },
  });

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading email dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">📧 Ava Email Management</h1>
            <p className="text-muted-foreground mt-2">
              AI-powered email processing for both personal and business accounts
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => testProcessingMutation.mutate()}
              disabled={testProcessingMutation.isPending}
              variant="outline"
            >
              🧪 Test Processing
            </Button>
            <Button
              onClick={() => processEmailsMutation.mutate()}
              disabled={processEmailsMutation.isPending}
            >
              {processEmailsMutation.isPending ? 'Processing...' : '🔍 Process Emails'}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.unreadEmails || 0}</div>
              <p className="text-xs text-muted-foreground">Across {dashboard?.totalAccounts || 0} accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Items</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboard?.urgentEmails || 0}</div>
              <p className="text-xs text-muted-foreground">Need immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Inquiries</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{dashboard?.customerInquiries || 0}</div>
              <p className="text-xs text-muted-foreground">Potential opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Responses Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{dashboard?.responsesPending || 0}</div>
              <p className="text-xs text-muted-foreground">Need replies</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="accounts">Account Overview</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dashboard?.accounts?.map((account, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {account.type === 'business' ? '💼' : '👤'} {account.type.toUpperCase()} Account
                      <Badge variant={account.urgent > 0 ? 'destructive' : 'secondary'}>
                        {account.urgent} urgent
                      </Badge>
                    </CardTitle>
                    <CardDescription>{account.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Unread emails:</span>
                        <span className="font-medium">{account.unread}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Urgent items:</span>
                        <span className="font-medium text-red-600">{account.urgent}</span>
                      </div>
                      {account.type === 'business' && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Customer emails:</span>
                          <span className="font-medium text-blue-600">{account.customers}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Email Automation Settings
                </CardTitle>
                <CardDescription>
                  Configure how Ava processes and manages your emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Automatic Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      Ava will check for new emails every hour and categorize them automatically
                    </p>
                  </div>
                  <Button
                    onClick={() => startMonitoringMutation.mutate()}
                    disabled={startMonitoringMutation.isPending}
                  >
                    {startMonitoringMutation.isPending ? 'Starting...' : 'Start Monitoring'}
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">What Ava Does:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Categorizes emails as urgent, customer, business, personal, or marketing</li>
                    <li>• Identifies emails that need responses</li>
                    <li>• Generates AI summaries for important emails</li>
                    <li>• Suggests response drafts for efficiency</li>
                    <li>• Sends Slack notifications for urgent items</li>
                    <li>• Tracks customer opportunities and sales inquiries</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI-Generated Insights
                </CardTitle>
                <CardDescription>
                  Intelligent analysis of your email patterns and opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Process Emails to See Insights</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ava will analyze your emails and provide strategic insights about customer opportunities,
                    urgent items, and response priorities.
                  </p>
                  <Button onClick={() => processEmailsMutation.mutate()}>
                    Generate Insights
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          {dashboard?.lastProcessed && (
            <p>Last processed: {new Date(dashboard.lastProcessed).toLocaleString()}</p>
          )}
          <p className="mt-1">
            🤖 Ava Email Management Agent • Part of SSELFIE Studio Empire Management System
          </p>
        </div>
      </div>
    </div>
  );
}