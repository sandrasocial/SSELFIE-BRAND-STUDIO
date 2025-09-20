import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { UserButton } from '@stackframe/react';

interface MemberNavigationProps {
  transparent?: boolean;
  darkText?: boolean;
}

export function MemberNavigation({ transparent = true, darkText = false }: MemberNavigationProps) {
  const [location, setLocation] = useLocation();
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

  // Check if user is admin (Sandra) or if we're in impersonation mode
  const isAdmin = user?.email === 'ssa@ssasocial.com';
  const isImpersonating = user?.email === 'shannon@soulresets.com' && user?.role === 'user';

  // Member navigation items - SIMPLIFIED TO STUDIO, GALLERY, ACCOUNT SETTINGS, LOGOUT  
  const navItems = [
    { path: '/maya', label: 'Studio' },
    { path: '/sselfie-gallery', label: 'Gallery' },
    { path: '/account-settings', label: 'Account' },
  ];

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };



  return (
    <nav 
      role="navigation" 
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-sophisticated ${
        scrolled || !transparent ? 'editorial-glass' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={(e) => {
              e.preventDefault();
              // If already on maya/studio, just scroll to top instead of navigating
              if (location === '/maya' || location === '/studio') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setLocation("/maya");
              }
            }}
            aria-label="SSELFIE home page"
            className={`editorial-headline text-xl font-light tracking-extra-wide ${darkText ? 'text-neutral-900' : 'text-neutral-200'} hover:opacity-70 transition-all duration-300 ease-sophisticated`}
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            SSELFIE
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" role="menubar">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                role="menuitem"
                aria-current={isActive(item.path) ? 'page' : undefined}
                aria-label={`Navigate to ${item.label}`}
                className={`editorial-headline text-xs tracking-wide font-light transition-all duration-300 ease-sophisticated ${
                  isActive(item.path)
                    ? `${darkText ? 'text-neutral-900 border-b border-neutral-700/50' : 'text-neutral-200 border-b border-neutral-500/50'} pb-1`
                    : `${darkText ? 'text-neutral-600 hover:text-neutral-900' : 'text-neutral-400 hover:text-neutral-200'} hover:tracking-extra-wide`
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Stack Auth UserButton with Maya's luxury styling */}
            <div className="flex items-center" role="menuitem">
              <UserButton 
                showUserInfo={false}
                extraItems={[
                  {
                    text: 'Subscription & Billing',
                    icon: <span className="text-sm" aria-hidden="true">💳</span>,
                    onClick: () => setLocation('/account-settings?tab=billing')
                  },
                  {
                    text: 'Business Profile', 
                    icon: <span className="text-sm" aria-hidden="true">👤</span>,
                    onClick: () => setLocation('/profile')
                  }
                ]}
              />
            </div>

            {isImpersonating && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/stop-impersonation', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'x-admin-token': 'sandra-admin-2025'
                      }
                    });
                    if (response.ok) {
                      window.location.href = '/admin-dashboard';
                    }
                  } catch (error) {
                    console.error('Failed to stop impersonation:', error);
                  }
                }}
                aria-label="Stop impersonation and return to admin dashboard"
                className={`text-xs uppercase tracking-[0.3em] font-light ${darkText ? 'text-black/70 hover:text-black' : 'text-white/70 hover:text-white'} hover:tracking-[0.4em] transition-all duration-300`}
              >
                Back to Admin
              </button>
            )}

            <button
              onClick={handleLogout}
              aria-label="Logout from account"
              className={`editorial-headline text-xs tracking-wide px-6 py-2 font-light transition-all duration-300 ease-sophisticated rounded-xl ${
                darkText 
                  ? 'text-neutral-900 border border-neutral-300 hover:bg-neutral-900 hover:text-neutral-200' 
                  : 'text-neutral-200 border border-neutral-600/30 hover:bg-neutral-200 hover:text-neutral-900'
              }`}
            >
              LOGOUT
            </button>
          </div>
          
          {/* Mobile Menu Button - Editorial luxury styling */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className={`md:hidden editorial-headline text-xs tracking-extra-wide ${darkText ? 'text-neutral-600 hover:text-neutral-900' : 'text-neutral-400 hover:text-neutral-200'} transition-all duration-300 ease-sophisticated`}
          >
            MENU
          </button>
        </div>
      </div>
      
      {/* Editorial Mobile Menu - Sophisticated overlay */}
      {mobileMenuOpen && (
        <div 
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="md:hidden fixed top-0 left-0 right-0 bottom-0 z-[999] editorial-glass"
          style={{ background: 'rgba(0, 0, 0, 0.97)' }}
        >
          <div className="flex flex-col items-center justify-center h-full space-y-8 px-6" role="menu">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  setLocation(item.path);
                  setMobileMenuOpen(false);
                }}
                role="menuitem"
                aria-current={isActive(item.path) ? 'page' : undefined}
                aria-label={`Navigate to ${item.label}`}
                className={`editorial-headline text-sm tracking-extra-wide transition-all duration-300 ease-sophisticated ${
                  isActive(item.path)
                    ? 'text-neutral-200'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {item.label}
              </button>
            ))}

            {isImpersonating && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/stop-impersonation', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'x-admin-token': 'sandra-admin-2025'
                      }
                    });
                    if (response.ok) {
                      window.location.href = '/admin-dashboard';
                    }
                  } catch (error) {
                    console.error('Failed to stop impersonation:', error);
                  }
                  setMobileMenuOpen(false);
                }}
                className={`text-sm uppercase tracking-[0.4em] ${darkText ? 'text-black/70 hover:text-black' : 'text-white/70 hover:text-white'} transition-all duration-300 mt-8`}
              >
                Back to Admin
              </button>
            )}

            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="editorial-headline text-sm tracking-extra-wide text-neutral-400 hover:text-neutral-200 transition-all duration-300 ease-sophisticated mt-8"
            >
              LOGOUT
            </button>
            
            {/* Close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 editorial-headline text-xs tracking-extra-wide text-neutral-400 hover:text-neutral-200 transition-all duration-300 ease-sophisticated"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}