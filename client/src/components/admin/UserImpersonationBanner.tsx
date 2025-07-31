import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, LogOut, AlertTriangle } from 'lucide-react';

interface UserImpersonationBannerProps {
  impersonatedUser: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export default function UserImpersonationBanner({ impersonatedUser }: UserImpersonationBannerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const stopImpersonationMutation = useMutation({
    mutationFn: () =>
      apiRequest('/api/admin/stop-impersonation', 'POST', {}, {
        'x-admin-token': 'sandra-admin-2025'
      }),
    onSuccess: () => {
      // Force refresh auth data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: "Stopped User Testing",
        description: "Back to admin account",
      });
      
      // Reload page to ensure clean state
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <Card className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white border-blue-500 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <AlertTriangle className="h-4 w-4 text-yellow-300" />
            </div>
            <div>
              <div className="font-medium text-sm">
                Testing User Journey As
              </div>
              <div className="text-xs opacity-90">
                {impersonatedUser.firstName} {impersonatedUser.lastName} ({impersonatedUser.email})
              </div>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => stopImpersonationMutation.mutate()}
            disabled={stopImpersonationMutation.isPending}
            className="bg-white text-blue-600 hover:bg-gray-100 border-white"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Exit Testing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}