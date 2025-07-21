// pages/AdminDashboard.tsx - Updated with Hero Integration
import React from 'react';
import { useAuth } from "@/hooks/use-auth";
import { AdminHeroSection } from "@/components/admin/AdminHeroSection";

export default function AdminDashboard() {
  const { user } = useAuth();

  // Mock data - Zara will connect to real analytics
  const dashboardStats = {
    totalUsers: 1247,
    activeBuilds: 89,
    userName: user?.name || 'Sandra'
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Full-bleed Hero Section */}
      <AdminHeroSection />
      
      {/* Additional Dashboard Content */}
      <div className="px-8 lg:px-16 py-16">
        {/* Quinn will ensure this meets luxury standards */}
        <div className="max-w-6xl mx-auto">
          <h2 className="font-['Times_New_Roman'] text-3xl text-white mb-8">
            Command Center
          </h2>
          {/* Future dashboard components will go here */}
        </div>
      </div>
    </div>
  );
}