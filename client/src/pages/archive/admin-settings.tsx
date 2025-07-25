import React, { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";

export default function AdminSettings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Secure admin access - Only Sandra can access
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.email !== 'ssa@ssasocial.com')) {
      setLocation('/');
      return;
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || user?.email !== 'ssa@ssasocial.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="font-serif text-4xl font-light mb-2">Platform Settings</h1>
          <p className="text-gray-600">Configure platform settings and API keys</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6">
            <h3 className="font-serif text-xl mb-4">API Keys Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span>Anthropic API</span>
                <span className="text-sm font-medium text-green-600">CONNECTED</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>OpenAI API</span>
                <span className="text-sm font-medium text-green-600">CONNECTED</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Replicate API</span>
                <span className="text-sm font-medium text-green-600">CONNECTED</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Stripe API</span>
                <span className="text-sm font-medium text-green-600">CONNECTED</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>AWS S3</span>
                <span className="text-sm font-medium text-green-600">CONNECTED</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Resend Email</span>
                <span className="text-sm font-medium text-green-600">CONNECTED</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6">
            <h3 className="font-serif text-xl mb-4">Platform Configuration</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 border border-gray-200">
                <h4 className="font-medium mb-2">Pricing Plans</h4>
                <div className="text-sm space-y-1">
                  <div>FREE: 5 AI images/month</div>
                  <div>SSELFIE Studio: €67/month - 100 images</div>
                </div>
              </div>
              
              <div className="bg-white p-4 border border-gray-200">
                <h4 className="font-medium mb-2">AI Agents</h4>
                <div className="text-sm space-y-1">
                  <div>Maya AI: Available to all users</div>
                  <div>Victoria AI: Premium only (coming soon)</div>
                </div>
              </div>

              <div className="bg-white p-4 border border-gray-200">
                <h4 className="font-medium mb-2">Admin Account</h4>
                <div className="text-sm space-y-1">
                  <div>Email: ssa@ssasocial.com</div>
                  <div>Access: Unlimited generations</div>
                  <div>Permissions: Full platform control</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminNavigation() {
  return (
    <nav className="bg-black text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/admin">
            <div className="font-serif text-lg letter-spacing-wide">SSELFIE ADMIN</div>
          </Link>
          <div className="flex space-x-6">
            <Link href="/admin" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Dashboard
            </Link>
            <Link href="/admin/users" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Users
            </Link>
            <Link href="/admin/emails" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Emails
            </Link>
            <Link href="/admin/settings" className="text-sm uppercase tracking-wide hover:text-gray-300 text-white">
              Settings
            </Link>
            <Link href="/admin/ai-models" className="text-sm uppercase tracking-wide hover:text-gray-300">
              AI Models
            </Link>
            <Link href="/admin/progress" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Progress
            </Link>
            <Link href="/admin/roadmap" className="text-sm uppercase tracking-wide hover:text-gray-300">
              Roadmap
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/workspace" className="text-sm uppercase tracking-wide hover:text-gray-300">
            Back to Platform
          </Link>
          <a href="/api/logout" className="text-sm uppercase tracking-wide hover:text-gray-300">
            Logout
          </a>
        </div>
      </div>
    </nav>
  );
}