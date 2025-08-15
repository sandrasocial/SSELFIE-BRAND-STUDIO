import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Eye } from 'lucide-react';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simple Shannon access mutation
  const accessShannonMutation = useMutation({
    mutationFn: () =>
      apiRequest('POST', '/api/admin/impersonate-user', { 
        email: 'shannon@soulresets.com',
        adminToken: 'sandra-admin-2025'
      }),
    onSuccess: () => {
      toast({
        title: "Accessing Shannon's Account",
        description: "Redirecting to Shannon's workspace...",
      });
      // Redirect to workspace after brief delay
      setTimeout(() => {
        window.location.href = '/workspace';
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Access Failed",
        description: error.message,
        
      });
    }
  });

  const handleAccessShannon = () => {
    accessShannonMutation.mutate();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
          Shannon Account Access
        </h1>
        <p className="text-gray-600 mb-8">Direct access to Shannon Murray's Soul Resets account</p>
        
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-center">
              <User className="h-5 w-5" />
              Shannon Murray
            </CardTitle>
            <CardDescription className="text-center">
              shannon@soulresets.com<br/>
              Soul Resets - Sound Healing Business
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={handleAccessShannon}
              disabled={accessShannonMutation.isPending}
              className="w-full"
              size="lg"
            >
              {accessShannonMutation.isPending ? (
                <>
                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                  Accessing Account...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Access Shannon's Account
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              This will take you directly to Shannon's workspace
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}