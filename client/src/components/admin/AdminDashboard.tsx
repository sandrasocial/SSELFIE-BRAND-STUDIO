import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Settings, Eye } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  // Check if user is Sandra (admin access required)
  if (!user || (user.email !== 'ssa@ssasocial.com' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-white mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Admin Access Required
          </h1>
          <p className="text-gray-400">Only Sandra can access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl font-light text-black mb-4 tracking-wider"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            ADMIN COMMAND CENTER
          </h1>
          <div className="w-24 h-px bg-black mx-auto"></div>
        </div>

        {/* Essential Admin Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Visual Editor */}
          <Card className="bg-white border-2 border-black hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => window.open('/admin/visual-editor', '_blank')}>
            <CardHeader className="text-center pb-4">
              <Eye className="w-12 h-12 mx-auto text-black mb-4" />
              <CardTitle 
                className="text-xl font-light tracking-wider text-black"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                VISUAL EDITOR
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">Access your agent coordination workspace</p>
              <Button 
                variant="outline" 
                className="border-black text-black hover:bg-black hover:text-white"
              >
                Open Visual Editor
              </Button>
            </CardContent>
          </Card>

          {/* Agent Communication */}
          <Card className="bg-white border-2 border-black hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <MessageSquare className="w-12 h-12 mx-auto text-black mb-4" />
              <CardTitle 
                className="text-xl font-light tracking-wider text-black"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                AGENT STATUS
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">All agents operational and ready</p>
              <div className="space-y-2 text-sm text-gray-700">
                <div>✅ Elena - Workflow Coordinator</div>
                <div>✅ Aria - Luxury Designer</div>
                <div>✅ Zara - Technical Architect</div>
                <div>✅ Rachel - Voice & Copy</div>
                <div>✅ All Agents Active</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <h2 
            className="text-2xl font-light text-black mb-6 tracking-wider"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            QUICK ACCESS
          </h2>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => window.open('/admin/visual-editor', '_blank')}
              className="bg-black text-white hover:bg-gray-800"
            >
              Open Visual Editor
            </Button>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white"
            >
              Back to Platform
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}