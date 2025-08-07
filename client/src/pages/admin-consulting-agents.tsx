import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { MemberNavigation } from '@/components/member-navigation';
import { GlobalFooter } from '@/components/global-footer';
import { Button } from '@/components/ui/button';

export default function AdminConsultingAgents() {
  const [location, setLocation] = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    setLocation('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberNavigation />
      
      {/* Zara's Test Button */}
      <div className="flex justify-center mt-8 mb-8">
        <Button 
          variant="default"
          size="lg"
          onClick={() => alert('Hey Sandra! Zara here - Button is working! 🎉')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
        >
          Zara's Test Button
        </Button>
      </div>

      <GlobalFooter />
    </div>
  );
}