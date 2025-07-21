// Checking AdminDashboard.tsx for luxury design standards
import React from 'react';
import { Link } from 'wouter';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-white">
      {/* Luxury header with Times New Roman */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-serif text-black">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage SSELFIE Studio operations with luxury precision
            </p>
          </div>
        </div>
      </div>

      {/* Responsive grid with luxury spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* User Management Card */}
          <Link href="/admin/users" className="group">
            <div className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif text-black mb-2">
                    User Management
                  </h3>
                  <p className="text-sm text-gray-600">
                    Manage premium memberships and user accounts
                  </p>
                </div>
                <div className="text-2xl">👥</div>
              </div>
            </div>
          </Link>

          {/* Model Training Card */}
          <Link href="/admin/models" className="group">
            <div className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif text-black mb-2">
                    AI Model Training
                  </h3>
                  <p className="text-sm text-gray-600">
                    Monitor individual model training quality
                  </p>
                </div>
                <div className="text-2xl">🎯</div>
              </div>
            </div>
          </Link>

          {/* Analytics Card */}
          <Link href="/admin/analytics" className="group">
            <div className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif text-black mb-2">
                    Platform Analytics
                  </h3>
                  <p className="text-sm text-gray-600">
                    Revenue, usage, and quality metrics
                  </p>
                </div>
                <div className="text-2xl">📊</div>
              </div>
            </div>
          </Link>

          {/* Content Management Card */}
          <Link href="/admin/content" className="group">
            <div className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif text-black mb-2">
                    Content Quality
                  </h3>
                  <p className="text-sm text-gray-600">
                    Editorial standards and image quality control
                  </p>
                </div>
                <div className="text-2xl">✨</div>
              </div>
            </div>
          </Link>

          {/* System Status Card */}
          <Link href="/admin/system" className="group">
            <div className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif text-black mb-2">
                    System Health
                  </h3>
                  <p className="text-sm text-gray-600">
                    Performance monitoring and luxury standards
                  </p>
                </div>
                <div className="text-2xl">🔍</div>
              </div>
            </div>
          </Link>

          {/* Settings Card */}
          <Link href="/admin/settings" className="group">
            <div className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif text-black mb-2">
                    Platform Settings
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configure luxury experience parameters
                  </p>
                </div>
                <div className="text-2xl">⚙️</div>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}