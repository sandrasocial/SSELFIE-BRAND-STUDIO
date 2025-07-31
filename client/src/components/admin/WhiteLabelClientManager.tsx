import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Eye, LogOut, Search } from 'lucide-react';

interface WhiteLabelClient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: string;
  mayaAiAccess: boolean;
  victoriaAiAccess: boolean;
  profile?: {
    fullName: string;
    location: string;
    instagramHandle: string;
    bio: string;
  };
  onboarding?: {
    brandStory: string;
    businessGoals: string;
    targetAudience: string;
    completed: boolean;
  };
}

export default function WhiteLabelClientManager() {
  const [searchEmail, setSearchEmail] = useState('');
  const [impersonatingUser, setImpersonatingUser] = useState<WhiteLabelClient | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all white-label clients
  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['/api/admin/white-label-clients'],
    queryFn: () => apiRequest('/api/admin/white-label-clients', 'GET', undefined, {
      'x-admin-token': 'sandra-admin-2025'
    })
  });

  // Impersonate user mutation
  const impersonateMutation = useMutation({
    mutationFn: (userData: { userId?: string; email?: string }) =>
      apiRequest('/api/admin/impersonate-user', 'POST', userData, {
        'x-admin-token': 'sandra-admin-2025'
      }),
    onSuccess: (data) => {
      setImpersonatingUser(data.user);
      toast({
        title: "Admin Access Granted",
        description: `Now managing ${data.user.email} account`,
      });
    },
    onError: (error) => {
      toast({
        title: "Impersonation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Stop impersonation mutation
  const stopImpersonationMutation = useMutation({
    mutationFn: () =>
      apiRequest('/api/admin/stop-impersonation', 'POST', {}, {
        'x-admin-token': 'sandra-admin-2025'
      }),
    onSuccess: () => {
      setImpersonatingUser(null);
      toast({
        title: "Stopped Impersonation",
        description: "Back to admin account",
      });
    }
  });

  const handleImpersonate = (client: WhiteLabelClient) => {
    impersonateMutation.mutate({ userId: client.id });
  };

  const handleStopImpersonation = () => {
    stopImpersonationMutation.mutate();
  };

  const handleSearchByEmail = () => {
    if (searchEmail.trim()) {
      impersonateMutation.mutate({ email: searchEmail.trim() });
    }
  };

  const clients = clientsData?.clients || [];
  const filteredClients = clients.filter((client: WhiteLabelClient) =>
    client.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
    client.firstName?.toLowerCase().includes(searchEmail.toLowerCase()) ||
    client.lastName?.toLowerCase().includes(searchEmail.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading white-label clients...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Times New Roman, serif' }}>
            White-Label Client Manager
          </h1>
          <p className="text-gray-600 mt-2">Manage and access client accounts</p>
        </div>
        
        {impersonatingUser && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    Managing: {impersonatingUser.email}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStopImpersonation}
                  disabled={stopImpersonationMutation.isPending}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Access Client Account
          </CardTitle>
          <CardDescription>
            Search by email or name to find and manage client accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter client email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchByEmail()}
            />
            <Button 
              onClick={handleSearchByEmail}
              disabled={impersonateMutation.isPending || !searchEmail.trim()}
            >
              Access Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold" style={{ fontFamily: 'Times New Roman, serif' }}>
          All White-Label Clients ({clients.length})
        </h2>
        
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              {searchEmail ? 'No clients found matching your search.' : 'No white-label clients found.'}
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client: WhiteLabelClient) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {client.firstName} {client.lastName}
                      </span>
                      <Badge variant={client.plan === 'full-access' ? 'default' : 'secondary'}>
                        {client.plan}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600">{client.email}</p>
                    
                    {client.profile && (
                      <div className="space-y-1 text-sm">
                        <p><strong>Location:</strong> {client.profile.location}</p>
                        <p><strong>Instagram:</strong> {client.profile.instagramHandle}</p>
                        <p className="text-gray-600">{client.profile.bio}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-2">
                      <Badge variant={client.mayaAiAccess ? 'default' : 'outline'}>
                        Maya AI: {client.mayaAiAccess ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant={client.victoriaAiAccess ? 'default' : 'outline'}>
                        Victoria AI: {client.victoriaAiAccess ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleImpersonate(client)}
                      disabled={impersonateMutation.isPending || impersonatingUser?.id === client.id}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      {impersonatingUser?.id === client.id ? 'Managing' : 'Manage'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}