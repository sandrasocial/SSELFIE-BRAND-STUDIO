import React, { useState } from 'react';
import { useLocation } from 'wouter';

interface AdminNavigationProps {
  transparent?: boolean;
}

export function AdminNavigation({ transparent = false }: AdminNavigationProps) {
  const [, setLocation] = useLocation();
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [preLoginDropdownOpen, setPreLoginDropdownOpen] = useState(false);

  const adminPages = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/analytics', label: 'Analytics' },
  ];

  const memberPages = [
    { path: '/workspace', label: 'Studio' },
    { path: '/ai-training', label: 'Train' },
    { path: '/maya', label: 'Photoshoot' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/flatlay-library', label: 'Flatlays' },
    { path: '/profile', label: 'Profile' },
  ];

  const preLoginPages = [
    { path: '/', label: 'Landing' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/about', label: 'About' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/blog', label: 'Blog' },
    { path: '/faq', label: 'FAQ' },
    { path: '/contact', label: 'Contact' },
    { path: '/terms', label: 'Terms' },
    { path: '/privacy', label: 'Privacy' },
  ];

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${
      transparent ? 'bg-transparent' : 'bg-white border-b border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setLocation("/admin")}
            className={`font-serif text-xl font-light tracking-wide transition-opacity duration-300 ${
              transparent ? 'text-white hover:opacity-70' : 'text-black hover:opacity-70'
            }`}
          >
            SSELFIE ADMIN
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {/* Admin Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setAdminDropdownOpen(!adminDropdownOpen);
                  setMemberDropdownOpen(false);
                  setPreLoginDropdownOpen(false);
                }}
                className={`text-xs uppercase tracking-[0.4em] transition-all duration-300 ${
                  transparent ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                Admin
              </button>
              {adminDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg">
                  {adminPages.map((page) => (
                    <button
                      key={page.path}
                      onClick={() => {
                        setLocation(page.path);
                        setAdminDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {page.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Member Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setMemberDropdownOpen(!memberDropdownOpen);
                  setAdminDropdownOpen(false);
                  setPreLoginDropdownOpen(false);
                }}
                className={`text-xs uppercase tracking-[0.4em] transition-all duration-300 ${
                  transparent ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                Member
              </button>
              {memberDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg">
                  {memberPages.map((page) => (
                    <button
                      key={page.path}
                      onClick={() => {
                        setLocation(page.path);
                        setMemberDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {page.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pre-Login Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setPreLoginDropdownOpen(!preLoginDropdownOpen);
                  setAdminDropdownOpen(false);
                  setMemberDropdownOpen(false);
                }}
                className={`text-xs uppercase tracking-[0.4em] transition-all duration-300 ${
                  transparent ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                Public
              </button>
              {preLoginDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg max-h-64 overflow-y-auto">
                  {preLoginPages.map((page) => (
                    <button
                      key={page.path}
                      onClick={() => {
                        setLocation(page.path);
                        setPreLoginDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {page.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={`text-xs uppercase tracking-[0.4em] transition-all duration-300 ${
                transparent ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}