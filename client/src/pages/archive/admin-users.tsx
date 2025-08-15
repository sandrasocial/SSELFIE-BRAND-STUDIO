import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../lib/auth/use-auth";
import { Link, useLocation } from "wouter";

export default function AdminUsers() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Secure admin access - Only Sandra can access
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.email !== 'ssa@ssasocial.com')) {
      setLocation('/');
      return;
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated && user?.email === 'ssa@ssasocial.com',
  });

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
          <h1 className="font-serif text-4xl font-light mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts and subscriptions</p>
        </header>

        <div className="bg-gray-50 p-6">
          <h3 className="font-serif text-xl mb-4">All Users</h3>
          <div className="space-y-3">
            {users?.map((user: any) => (
              <div key={user.id} className="bg-white p-4 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-gray-500">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      Plan: {user.plan || 'free'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-gray-500 text-center py-8">No users found</div>
            )}
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
            <Link href="/admin/users" className="text-sm uppercase tracking-wide hover:text-gray-300 text-white">
              Users
            </Link>
            <Link href="/admin/emails" className="text-sm uppercase tracking-wide hover:text-gray-300">
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