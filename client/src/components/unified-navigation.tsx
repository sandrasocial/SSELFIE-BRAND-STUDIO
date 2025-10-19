import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth.js';
import { UserButton } from '@stackframe/react';
import { Menu, X, Home, Camera, User, CreditCard, LogOut, Shield } from 'lucide-react';
import { TypographyClasses, ComponentTypography } from '../styles/premium-typography.js';

interface UnifiedNavigationProps {
  transparent?: boolean;
  darkText?: boolean;
  showAuth?: boolean;
}

export function UnifiedNavigation({
  transparent = true,
  darkText = false,
  showAuth = true
}: UnifiedNavigationProps) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth({ silent: true });

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
    if (path === '/maya' && (location === '/maya' || location === '/studio')) return true;
    if (path !== '/maya' && location.startsWith(path)) return true;
    return false;
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Navigation Items with Icons - conditional based on auth state
  const navItems = user ? [
    // Authenticated users see member navigation
    { path: '/maya', label: 'Studio', icon: Home },
    { path: '/sselfie-gallery', label: 'Gallery', icon: Camera },
    { path: '/account-settings', label: 'Account', icon: User },
  ] : [
    // Unauthenticated users see business navigation
    // Empty array - no navigation items for business landing
  ];

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  // Unified logo styling using design system
  const logoClasses = `
    ${ComponentTypography.brand.primary}
    cursor-pointer
    touch-manipulation
    transition-all
    duration-300
    ease-sophisticated
    select-none
  `;

  // Unified navigation background
  const navBackground = scrolled || !transparent || mobileMenuOpen
    ? 'bg-black/90 backdrop-blur-md'
    : 'bg-transparent';

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-sophisticated ${navBackground}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Unified Logo */}
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
            className={logoClasses}
            style={{
              fontFamily: "Times New Roman, serif",
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center'
            }}
            itemProp="publisher"
            itemScope
            itemType="https://schema.org/Organization"
          >
            <span itemProp="name">SSELFIE</span>
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
                className={`
                  ${TypographyClasses.caption}
                  flex items-center gap-2
                  transition-all duration-300 ease-sophisticated
                  px-3 py-2 rounded-lg
                  ${isActive(item.path)
                    ? 'text-white bg-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <item.icon size={16} strokeWidth={1.2} />
                {item.label}
              </button>
            ))}

            {/* Auth Section */}
            {showAuth && (
              <div className="flex items-center gap-4" role="menuitem">
                {user ? (
                  <>
                    {/* Authenticated users see UserButton and logout */}
                    <UserButton
                      showUserInfo={false}
                      extraItems={[
                        {
                          text: 'Subscription & Billing',
                          icon: <CreditCard size={16} strokeWidth={1.2} />,
                          onClick: () => setLocation('/account-settings?tab=billing')
                        },
                        {
                          text: 'Business Profile',
                          icon: <User size={16} strokeWidth={1.2} />,
                          onClick: () => setLocation('/profile')
                        }
                      ]}
                    />

                    <button
                      onClick={handleLogout}
                      aria-label="Logout from account"
                      className={`
                        ${TypographyClasses.button}
                        text-white border border-white/30 hover:bg-white hover:text-black
                        transition-all duration-300 ease-sophisticated
                        px-6 py-2 rounded-lg
                        min-h-[44px]
                      `}
                    >
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <>
                    {/* Unauthenticated users see login button */}
                    <button
                      onClick={() => window.location.href = '/handler/sign-in'}
                      aria-label="Sign in to account"
                      className={`
                        ${TypographyClasses.button}
                        text-white border border-white/30 hover:bg-white hover:text-black
                        transition-all duration-300 ease-sophisticated
                        px-6 py-2 rounded-lg
                        min-h-[44px]
                      `}
                    >
                      LOGIN
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className={`
              md:hidden
              ${TypographyClasses.caption}
              text-white/70 hover:text-white
              transition-all duration-300 ease-sophisticated
              p-2 rounded-lg hover:bg-white/5
            `}
          >
            {mobileMenuOpen ? (
              <X size={20} strokeWidth={1.5} />
            ) : (
              <Menu size={20} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Unified overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="md:hidden fixed top-0 left-0 right-0 bottom-0 z-[999] bg-black/97 backdrop-blur-md"
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
                className={`
                  ${TypographyClasses.body}
                  text-white
                  flex items-center gap-3
                  transition-all duration-300 ease-sophisticated
                  px-4 py-3 rounded-lg
                  ${isActive(item.path)
                    ? 'bg-white/10'
                    : 'hover:bg-white/5'
                  }
                `}
              >
                <item.icon size={18} strokeWidth={1.2} />
                {item.label}
              </button>
            ))}

            {showAuth && (
              <>
                {user ? (
                  <>
                    {/* Authenticated mobile menu items */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        ${TypographyClasses.button}
                        text-white border border-white/30 hover:bg-white hover:text-black
                        transition-all duration-300 ease-sophisticated
                        mt-8 px-6 py-3 rounded-lg
                      `}
                    >
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <>
                    {/* Unauthenticated mobile menu items */}
                    <button
                      onClick={() => {
                        window.location.href = '/handler/sign-in';
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        ${TypographyClasses.button}
                        text-white border border-white/30 hover:bg-white hover:text-black
                        transition-all duration-300 ease-sophisticated
                        px-6 py-3 rounded-lg
                      `}
                    >
                      LOGIN
                    </button>
                  </>
                )}
              </>
            )}

            {/* Close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className={`
                absolute top-6 right-6
                ${TypographyClasses.caption}
                text-white/70 hover:text-white
                transition-all duration-300 ease-sophisticated
                p-2 rounded-lg hover:bg-white/5
              `}
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}