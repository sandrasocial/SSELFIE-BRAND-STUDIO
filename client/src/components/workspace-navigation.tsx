import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

export const WorkspaceNavigation: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ensure pages start at top
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

  // Workspace navigation items - minimalistic
  const navItems = [
    { path: '/workspace', label: 'STUDIO' },
    { path: '/ai-training', label: 'TRAIN AI' },
    { path: '/sandra-photoshoot', label: 'PHOTOSHOOT' },
    { path: '/custom-photoshoot-library', label: 'LIBRARY' },
    { path: '/gallery', label: 'GALLERY' },
    { path: '/profile', label: 'PROFILE' },
    ...(isAdmin ? [{ path: '/admin', label: 'ADMIN' }] : []),
  ];

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <>
      {/* Fixed Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: 'blur(10px)',
        borderBottom: scrolled ? '1px solid #e5e5e5' : 'none',
        padding: 'clamp(16px, 3vh, 24px) 0',
        transition: 'all 300ms ease'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 clamp(20px, 4vw, 40px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <Link href="/workspace">
            <div style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(18px, 3vw, 22px)',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              color: scrolled ? '#0a0a0a' : '#ffffff',
              cursor: 'pointer',
              transition: 'color 300ms ease, opacity 300ms ease'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.6'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}>
              SSELFIE
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(24px, 3vw, 40px)'
          }}>
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span style={{
                  color: scrolled ? (isActive(item.path) ? '#0a0a0a' : '#666666') : (isActive(item.path) ? '#ffffff' : '#ffffff80'),
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
            
            {/* Profile & Logout */}
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
                  color: scrolled ? '#666666' : '#ffffff80',
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
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            style={{
              color: scrolled ? '#0a0a0a' : '#ffffff',
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
        <div className="lg:hidden" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          background: '#ffffff',
          padding: '100px clamp(20px, 4vw, 40px) 40px clamp(20px, 4vw, 40px)',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(30px, 5vh, 40px)',
            textAlign: 'center',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span 
                  style={{
                    color: isActive(item.path) ? '#0a0a0a' : '#666666',
                    fontSize: 'clamp(14px, 3.5vw, 18px)',
                    fontWeight: 400,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 300ms ease',
                    display: 'block',
                    padding: 'clamp(16px, 4vw, 24px) 0',
                    borderBottom: '1px solid #e5e5e5'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                  onTouchStart={(e) => e.target.style.opacity = '0.6'}
                  onTouchEnd={(e) => e.target.style.opacity = '1'}
                >
                  {item.label}
                </span>
              </Link>
            ))}
            
            <div style={{ marginTop: '40px' }}>
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};