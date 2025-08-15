import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';

interface AdminNavigationProps {
  transparent?: boolean;
}

export function AdminNavigation({ transparent = true }: AdminNavigationProps) {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ensure page starts at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isActive = (path: string) => {
    if (path === '/admin-dashboard' && location === '/admin-dashboard') return true;
    if (path !== '/admin-dashboard' && location.startsWith(path)) return true;
    return false;
  };
  
  // Use actual authenticated user without fallback to prevent auth conflicts
  const currentAccount = user?.email;

  // Admin navigation items
  const navItems = [
    { path: '/workspace', label: 'Workspace' },
    { path: '/visual-editor', label: 'Visual Editor' },
    { path: '/analytics', label: 'Analytics' },
  ];

  // Removed account switching to prevent auth conflicts

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || !transparent ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={(e) => {
              e.preventDefault();
              if (location === '/admin-dashboard') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setLocation("/admin-dashboard");
              }
            }}
            className="font-serif text-xl font-light tracking-wide text-white hover:opacity-70 transition-opacity duration-300"
          >
            SSELFIE ADMIN
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-10">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`text-xs uppercase tracking-[0.4em] transition-all duration-300 ${
                  isActive(item.path)
                    ? 'text-white'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* User Display */}
            <div className="flex items-center space-x-2">
              <div className="w-px h-4 bg-white/20"></div>
              <div className="text-xs text-white/60">
                {currentAccount ? currentAccount.split('@')[0] : 'Admin'}
              </div>
              <div className="w-px h-4 bg-white/20"></div>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
            >
              Logout
            </button>
          </div>
          
          {/* Mobile Menu Button - Minimalistic MENU text */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300"
          >
            Menu
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    setLocation(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left text-xs uppercase tracking-[0.4em] transition-all duration-300 ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile User Display */}
              <div className="pt-4 border-t border-white/10">
                <div className="text-xs text-white/60">
                  {currentAccount ? currentAccount.split('@')[0] : 'Admin'}
                </div>
              </div>
              
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all duration-300 pt-4 border-t border-white/10"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}