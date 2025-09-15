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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !transparent ? 'bg-black/90 backdrop-blur-md' : 'bg-transparent'
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
            className={`font-serif text-xl font-light tracking-wide ${darkText ? 'text-black' : 'text-white'} hover:opacity-70 transition-opacity duration-300`}
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
                className={`text-xs uppercase tracking-[0.3em] font-light transition-all duration-300 ${
                  isActive(item.path)
                    ? `${darkText ? 'text-black border-b border-black/50' : 'text-white border-b border-white/50'} pb-1`
                    : `${darkText ? 'text-black/70 hover:text-black' : 'text-white/70 hover:text-white'} hover:tracking-[0.4em]`
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
              className={`${darkText ? 'text-black border border-black/30 hover:bg-black hover:text-white' : 'text-white border border-white/30 hover:bg-white hover:text-black'} transition-colors duration-300 text-xs tracking-[0.3em] uppercase px-6 py-2 font-light`}
            >
              Logout
            </button>
          </div>
          
          {/* Mobile Menu Button - Minimalistic MENU text */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className={`md:hidden text-xs uppercase tracking-[0.4em] ${darkText ? 'text-black/80 hover:text-black' : 'text-white/80 hover:text-white'} transition-all duration-300`}
          >
            MENU
          </button>
        </div>
      </div>
      
      {/* Mobile Menu - Minimalistic Black Overlay */}
      {mobileMenuOpen && (
        <div 
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="md:hidden fixed top-0 left-0 right-0 bottom-0 z-[999] bg-black/95 backdrop-blur-md"
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
                className={`text-sm uppercase tracking-[0.4em] transition-all duration-300 ${
                  isActive(item.path)
                    ? `${darkText ? 'text-black' : 'text-white'}`
                    : `${darkText ? 'text-black/70 hover:text-black' : 'text-white/70 hover:text-white'}`
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
              className={`text-sm uppercase tracking-[0.4em] ${darkText ? 'text-black/70 hover:text-black' : 'text-white/70 hover:text-white'} transition-all duration-300 mt-8`}
            >
              Logout
            </button>
            
            {/* Close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className={`absolute top-6 right-6 text-xs uppercase tracking-[0.4em] ${darkText ? 'text-black/80 hover:text-black' : 'text-white/80 hover:text-white'} transition-all duration-300`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}