import React from 'react';
import { MemberNavigation } from '../member-navigation';

interface MayaLayoutProps {
  children: React.ReactNode;
}

export function MayaLayout({ children }: MayaLayoutProps) {
  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="flex-1 flex flex-col overflow-hidden">
        <MemberNavigation />
        
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Stylish Header */}
            <div className="px-4 py-6 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Your AI Style Session
              </h1>
              <p className="mt-2 text-gray-300">
                Let's create stunning photos that tell your unique story ✨
              </p>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden px-4">
              <div className="h-full rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}