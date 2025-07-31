import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { User, Shield, LogOut, Settings } from 'lucide-react';

export default function AccountSwitcher() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if currently viewing Shannon's account
  const isViewingShannon = user?.email === 'shannon@soulresets.com';
  const isAdmin = user?.email === 'ssa@ssasocial.com' || user?.role === 'admin';

  // Switch to Shannon account
  const switchToShannonMutation = useMutation({
    mutationFn: () =>
      apiRequest('/api/admin/impersonate-user', 'POST', { email: 'shannon@soulresets.com' }, {
        'x-admin-token': 'sandra-admin-2025'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Switched to Shannon's Account",
        description: "Now viewing Shannon Murray's Soul Resets workspace",
      });
      // Small delay then reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Switch Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Switch back to admin account
  const switchToAdminMutation = useMutation({
    mutationFn: () =>
      apiRequest('/api/admin/stop-impersonation', 'POST', {}, {
        'x-admin-token': 'sandra-admin-2025'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Switched to Admin Account",
        description: "Back to Sandra's admin access",
      });
      // Small delay then reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Switch Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSwitchToShannon = () => {
    switchToShannonMutation.mutate();
  };

  const handleSwitchToAdmin = () => {
    switchToAdminMutation.mutate();
  };

  // Always show the switcher when viewing Shannon or when admin
  // This allows switching from Shannon back to admin
  if (!isViewingShannon && !isAdmin) {
    return null;
  }

  return (
    <Card className="fixed top-4 right-4 z-50 bg-white border-2 shadow-lg max-w-sm">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {isViewingShannon ? (
                <User className="h-4 w-4 text-blue-600" />
              ) : (
                <Shield className="h-4 w-4 text-purple-600" />
              )}
              <div className="text-sm">
                <div className="font-medium">
                  {isViewingShannon ? 'Viewing Shannon\'s Account' : 'Admin Account'}
                </div>
                <div className="text-gray-500 text-xs">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isViewingShannon ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSwitchToAdmin}
                disabled={switchToAdminMutation.isPending}
                className="flex-1"
              >
                {switchToAdminMutation.isPending ? (
                  <>
                    <Settings className="h-3 w-3 mr-1 animate-spin" />
                    Switching...
                  </>
                ) : (
                  <>
                    <Shield className="h-3 w-3 mr-1" />
                    Switch to Admin
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSwitchToShannon}
                disabled={switchToShannonMutation.isPending}
                className="flex-1"
              >
                {switchToShannonMutation.isPending ? (
                  <>
                    <Settings className="h-3 w-3 mr-1 animate-spin" />
                    Switching...
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 mr-1" />
                    View Shannon
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}