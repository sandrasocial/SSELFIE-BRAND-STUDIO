import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

export const Navigation: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  // Check if user is admin (Sandra)
  const isAdmin = user?.email === 'ssa@ssasocial.com';

  // Member navigation - updated SSELFIE workflow
  const memberNavItems = [
    { path: '/studio', label: 'STUDIO' },
    { path: '/ai-training', label: 'TRAIN AI' },
    { path: '/sandra-photoshoot', label: 'PHOTOSHOOT' },
    { path: '/custom-photoshoot-library', label: 'LIBRARY' },
    { path: '/gallery', label: 'GALLERY' },
    { path: '/profile', label: 'PROFILE' },
    ...(isAdmin ? [{ path: '/admin', label: 'ADMIN' }] : []),
  ];

  // Pre-login navigation - public pages
  const publicNavItems = [
    { path: '/', label: 'HOME' },
    { path: '/about', label: 'ABOUT' },
    { path: '/how-it-works', label: 'HOW IT WORKS' },
    { path: '/blog', label: 'BLOG' },
    { path: '/pricing', label: 'PRICING' },
  ];

  const navItems = isAuthenticated ? memberNavItems : publicNavItems;

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleLogout = () => {
    // Simple GET logout - most reliable method
    window.location.href = '/api/logout';
  };

  if (isLoading) {
    return (
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e5e5',
        padding: '20px 0',
        transition: 'all 300ms ease'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontFamily: 'Times New Roman, serif',
            fontSize: '20px',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            color: '#0a0a0a'
          }}>
            SSELFIE
          </div>
          <div style={{
            width: '20px',
            height: '20px',
            background: '#f5f5f5',
            borderRadius: '2px'
          }} />
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e5e5',
        padding: '20px 0',
        transition: 'all 300ms ease'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <Link href="/">
            <div style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: '20px',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              color: '#0a0a0a',
              cursor: 'pointer',
              transition: 'opacity 300ms ease'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.6'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}>
              SSELFIE
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '40px'
          }}
          className="nav-desktop-only">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span style={{
                  color: isActive(item.path) ? '#0a0a0a' : '#666666',
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 300ms ease',
                  opacity: isActive(item.path) ? 1 : 0.8
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = isActive(item.path) ? '1' : '0.8'}>
                  {item.label}
                </span>
              </Link>
            ))}
            
            {/* Auth Button */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    style={{
                      width: '32px',
                      height: '32px',
                      objectFit: 'cover',
                      border: '1px solid #e5e5e5'
                    }}
                  />
                )}
                <button 
                  onClick={handleLogout}
                  style={{
                    color: '#666666',
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 300ms ease',
                    opacity: 0.8
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '1'}
                  onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                style={{
                  display: 'inline-block',
                  padding: '16px 32px',
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  border: '1px solid #0a0a0a',
                  color: '#0a0a0a',
                  background: 'transparent',
                  transition: 'all 300ms ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#0a0a0a';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#0a0a0a';
                }}
              >
                LOGIN
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            style={{
              color: '#0a0a0a',
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 300ms ease',
              opacity: 0.8
            }}
            className="nav-mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.8'}
          >
            MENU
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          background: '#ffffff',
          padding: '100px 40px 40px 40px'
        }}
        className="nav-mobile-only">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
            textAlign: 'center'
          }}>
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span 
                  style={{
                    color: isActive(item.path) ? '#0a0a0a' : '#666666',
                    fontSize: '16px',
                    fontWeight: 400,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 300ms ease',
                    display: 'block',
                    padding: '20px 0',
                    borderBottom: '1px solid #e5e5e5'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </span>
              </Link>
            ))}
            
            <div style={{ marginTop: '40px' }}>
              {isAuthenticated ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                  {user?.profileImageUrl && (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      style={{
                        width: '64px',
                        height: '64px',
                        objectFit: 'cover',
                        border: '1px solid #e5e5e5'
                      }}
                    />
                  )}
                  <button 
                    onClick={handleLogout}
                    style={{
                      color: '#666666',
                      fontSize: '14px',
                      fontWeight: 400,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      background: 'transparent',
                      border: '1px solid #666666',
                      padding: '16px 32px',
                      cursor: 'pointer',
                      transition: 'all 300ms ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#666666';
                      e.target.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#666666';
                    }}
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  style={{
                    display: 'inline-block',
                    padding: '20px 40px',
                    fontSize: '14px',
                    fontWeight: 400,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    border: '1px solid #0a0a0a',
                    color: '#0a0a0a',
                    background: 'transparent',
                    transition: 'all 300ms ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#0a0a0a';
                    e.target.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#0a0a0a';
                  }}
                >
                  LOGIN
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* CSS for responsive classes */}
      <style>{`
        @media (max-width: 1024px) {
          .nav-desktop-only { display: none !important; }
          .nav-mobile-only { display: block !important; }
        }
        
        @media (min-width: 1025px) {
          .nav-desktop-only { display: flex !important; }
          .nav-mobile-only { display: none !important; }
        }
      `}</style>
    </>
  );
};