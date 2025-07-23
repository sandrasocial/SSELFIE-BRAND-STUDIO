// @/pages/admin/dashboard.tsx - Updated integration
import React from 'react';
import { AdminHeroSection } from '@/components/admin/AdminHeroSection';
import { useAuth } from '@/hooks/use-auth';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Mock data - Zara will integrate with real user stats
  const userStats = {
    totalPhotos: 247,
    aiCredits: 128
  };
  
  return (
    <div className="min-h-screen bg-gray-950">
      <AdminHeroSection 
        userName={user?.name || "Sandra"}
        totalPhotos={userStats.totalPhotos}
        aiCredits={userStats.aiCredits}
      />
      
      {/* Rest of admin dashboard content flows naturally below */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Additional admin sections will go here */}
      </div>
    </div>
  );
}