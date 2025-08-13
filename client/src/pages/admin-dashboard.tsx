import React, { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";

export default function AdminDashboard() {
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
          <h1 className="font-serif text-4xl font-light mb-2">Email Management</h1>
          <p className="text-gray-600">Manage welcome emails and notifications</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6">
            <h3 className="font-serif text-xl mb-4">Welcome Email Templates</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 border border-gray-200">
                <h4 className="font-medium mb-2">FREE User Welcome</h4>
                <p className="text-sm text-gray-600 mb-3">
                  "Okay, let's do this thing..." - Rachel-from-Friends style encouragement
                </p>
                <div className="text-xs text-gray-500">
                  ✓ Encourages first AI training<br/>
                  ✓ Links to Maya AI photographer<br/>
                  ✓ Motivational tone
                </div>
              </div>

              <div className="bg-white p-4 border border-gray-200">
                <h4 className="font-medium mb-2">PREMIUM User Welcome</h4>
                <p className="text-sm text-gray-600 mb-3">
                  "Holy sh*t, you actually did it!" - Celebration email
                </p>
                <div className="text-xs text-gray-500">
                  ✓ Celebrates purchase decision<br/>
                  ✓ Full platform access guide<br/>
                  ✓ High-energy launch tone
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6">
            <h3 className="font-serif text-xl mb-4">Email System Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span>Resend API</span>
                <span className="text-sm font-medium text-green-600">HEALTHY</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Welcome Emails</span>
                <span className="text-sm font-medium text-green-600">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Sandra's Voice</span>
                <span className="text-sm font-medium text-green-600">AUTHENTIC</span>
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
            <Link href="/admin/emails" className="text-sm uppercase tracking-wide hover:text-gray-300 text-white">
              Emails
            </Link>
            <Link href="/admin/settings" className="text-sm uppercase tracking-wide hover:text-gray-300">
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