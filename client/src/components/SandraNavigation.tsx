import React from 'react';
import { Link, useLocation } from 'wouter';

export default function SandraNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: '/sandra-ai', label: 'Personal Brand Mentor', description: 'Strategic guidance & coaching' },
    { path: '/sandra-photoshoot', label: 'AI Photographer', description: 'Pinterest-style photoshoots' },
    { path: '/workspace', label: 'Studio Workspace', description: 'Complete business platform' }
  ];

  return (
    <nav className="bg-white border-b border-[#e0e0e0]">
      <div className="max-w-6xl mx-auto px-8 py-6">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/workspace">
            <h1 className="font-times text-[clamp(2rem,4vw,3rem)] leading-none font-extralight tracking-[0.2em] uppercase text-black cursor-pointer hover:opacity-70 transition-opacity">
              SSELFIE STUDIO
            </h1>
          </Link>
          <p className="text-xs font-light tracking-[0.4em] uppercase text-gray-600 mt-2">
            AI-Powered Personal Branding Platform
          </p>
        </div>

        {/* Navigation Menu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 max-w-4xl mx-auto">
          {navItems.map((item) => {
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div className={`p-6 border border-[#e0e0e0] text-center cursor-pointer transition-all duration-200 ${
                  isActive 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black hover:bg-[#f5f5f5]'
                }`}>
                  <div className="font-times text-lg font-extralight tracking-[0.1em] uppercase mb-2">
                    {item.label}
                  </div>
                  <div className={`text-xs font-light tracking-[0.05em] uppercase ${
                    isActive ? 'text-white/70' : 'text-gray-600'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}