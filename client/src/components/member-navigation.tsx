import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface MemberNavigationProps {
  transparent?: boolean;
}

export function MemberNavigation({ transparent = true }: MemberNavigationProps) {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

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
    if (path === '/workspace' && (location === '/workspace' || location === '/studio')) return true;
    if (path !== '/workspace' && location.startsWith(path)) return true;
    return false;
  };

  // Check if user is admin (Sandra)
  const isAdmin = user?.email === 'ssa@ssasocial.com';

  // Member navigation items
  const navItems = [
    { path: '/workspace', label: 'Studio' },
    { path: '/ai-training', label: 'Train' },
    { path: '/maya', label: 'Photoshoot' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/flatlay-library', label: 'Flatlays' },
    { path: '/profile', label: 'Profile' },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin' }] : []),
  ];

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
            onClick={() => setLocation("/workspace")}
            className="font-serif text-xl font-light tracking-wide text-white hover:opacity-70 transition-opacity duration-300"
          >
            SSELFIE
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
            MENU
          </button>
        </div>
      </div>
      
      {/* Mobile Menu - Full Screen Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 right-0 bottom-0 z-[999] bg-white">
          <div className="flex flex-col gap-10 text-center pt-[100px] px-10">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  setLocation(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`text-base uppercase tracking-[0.3em] transition-colors py-5 border-b border-gray-200 ${
                  isActive(item.path)
                    ? 'text-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="text-base uppercase tracking-[0.3em] text-gray-600 hover:text-black transition-colors py-5"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}