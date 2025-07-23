import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Upload, Database, Activity, Settings, Eye } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalUploads: number;
  storageUsed: string;
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl" style={{ fontFamily: 'Times New Roman, serif' }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Editorial Design */}
      <div className="relative bg-black py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 
            className="text-6xl font-light text-white uppercase tracking-wide mb-4"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Admin Dashboard
          </h1>
          <p 
            className="text-xl text-gray-300 font-light italic max-w-2xl"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Command center for SSELFIE Studio platform management
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle 
                className="text-sm font-medium text-gray-300"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div 
                className="text-3xl font-light text-white"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                {stats?.totalUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle 
                className="text-sm font-medium text-gray-300"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Active Users
              </CardTitle>
              <Activity className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div 
                className="text-3xl font-light text-white"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                {stats?.activeUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle 
                className="text-sm font-medium text-gray-300"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Total Uploads
              </CardTitle>
              <Upload className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div 
                className="text-3xl font-light text-white"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                {stats?.totalUploads || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle 
                className="text-sm font-medium text-gray-300"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Storage Used
              </CardTitle>
              <Database className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div 
                className="text-3xl font-light text-white"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                {stats?.storageUsed || '0 GB'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-900 border-gray-800 mb-12">
          <CardHeader>
            <CardTitle 
              className="text-xl font-light text-white"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity?.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <div className="text-white font-medium">{activity.user}</div>
                    <div className="text-gray-400 text-sm">{activity.action}</div>
                  </div>
                  <div className="text-gray-500 text-sm">{activity.timestamp}</div>
                </div>
              )) || (
                <div className="text-gray-400 text-center py-8">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle 
                className="text-lg font-light text-white flex items-center"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                <Users className="mr-2 h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">Manage user accounts and permissions</p>
              <Button className="w-full bg-white text-black hover:bg-gray-200">
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle 
                className="text-lg font-light text-white flex items-center"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                <Settings className="mr-2 h-5 w-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">Configure platform settings</p>
              <Button className="w-full bg-white text-black hover:bg-gray-200">
                Open Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle 
                className="text-lg font-light text-white flex items-center"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                <Eye className="mr-2 h-5 w-5" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">View detailed analytics</p>
              <Button className="w-full bg-white text-black hover:bg-gray-200">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}