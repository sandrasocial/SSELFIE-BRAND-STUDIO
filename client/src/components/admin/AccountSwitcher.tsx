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
  
  // ZARA FIX: Force render regardless of any errors
  React.useEffect(() => {
    console.log('🔧 ZARA: AccountSwitcher mounted and rendering');
  }, []);

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

  // ZARA FIX: Force visibility for debugging - remove conditional hiding
  console.log('🔧 ZARA DEBUG: AccountSwitcher render check', {
    isViewingShannon,
    isAdmin,
    userEmail: user?.email,
    userRole: user?.role
  });

  return (
    <div 
      className="fixed top-4 right-4 z-[9999] bg-red-600 text-white p-6 border-4 border-black shadow-2xl rounded-lg max-w-sm"
      style={{ 
        position: 'fixed', 
        top: '16px', 
        right: '16px', 
        zIndex: 9999,
        backgroundColor: 'red',
        color: 'white',
        border: '4px solid black',
        padding: '24px',
        borderRadius: '8px'
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {isViewingShannon ? (
              <User className="h-5 w-5 text-white" />
            ) : (
              <Shield className="h-5 w-5 text-white" />
            )}
            <div className="text-sm">
              <div className="font-bold text-white">
                🔧 ZARA: {isViewingShannon ? 'Shannon Account' : 'Admin Account'}
              </div>
              <div className="text-white text-xs">
                {user?.email || 'No email'}
              </div>
            </div>
          </div>
        </div>
          
        <div className="flex gap-2">
          {isViewingShannon ? (
            <button
              onClick={handleSwitchToAdmin}
              disabled={switchToAdminMutation.isPending}
              className="bg-black text-white px-4 py-2 rounded border-2 border-white font-medium hover:bg-gray-800"
              style={{
                backgroundColor: 'black',
                color: 'white',
                padding: '8px 16px',
                border: '2px solid white',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              {switchToAdminMutation.isPending ? 'Switching...' : '🔧 Switch to Admin'}
            </button>
          ) : (
            <button
              onClick={handleSwitchToShannon}
              disabled={switchToShannonMutation.isPending}
              className="bg-black text-white px-4 py-2 rounded border-2 border-white font-medium hover:bg-gray-800"
              style={{
                backgroundColor: 'black',
                color: 'white',
                padding: '8px 16px',
                border: '2px solid white',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              {switchToShannonMutation.isPending ? 'Switching...' : '🔧 View Shannon'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}