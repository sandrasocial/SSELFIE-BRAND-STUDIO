import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  requiresAuth?: boolean;
}

interface AutonomousNavigationProps {
  items?: NavigationItem[];
  className?: string;
}

const AutonomousNavigation: React.FC<AutonomousNavigationProps> = ({ 
  items = defaultNavItems,
  className = ''
}) => {
  const router = useRouter();
  const [activeRoute, setActiveRoute] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Navigation validation and state management
  useEffect(() => {
    setActiveRoute(router.pathname);
  }, [router.pathname]);

  const handleNavigation = async (item: NavigationItem) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Autonomous validation
      if (item.requiresAuth && !isAuthenticated()) {
        await router.push('/login');
        return;
      }
      
      // Navigate with state management
      await router.push(item.path);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = (): boolean => {
    // Placeholder authentication check
    return typeof window !== 'undefined' && localStorage.getItem('auth-token') !== null;
  };

  return (
    <nav className={`autonomous-nav ${className}`}>
      <style jsx>{`
        .autonomous-nav {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #e5e5e5;
          margin-bottom: 2rem;
        }
        
        .nav-item {
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: 1px solid #e5e5e5;
          color: #666666;
          text-decoration: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        
        .nav-item:hover {
          background: #f8f8f8;
          border-color: #d0d0d0;
          color: #333333;
        }
        
        .nav-item.active {
          background: #0a0a0a;
          color: #ffffff;
          border-color: #0a0a0a;
        }
        
        .nav-item.loading {
          opacity: 0.6;
          pointer-events: none;
        }
        
        .nav-item.loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .nav-status {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          color: #0c4a6e;
          font-size: 0.875rem;
          border-radius: 4px;
        }
      `}</style>
      
      {items.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${activeRoute === item.path ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
          onClick={() => handleNavigation(item)}
          disabled={isLoading}
        >
          {item.icon && <span>{item.icon}</span>}
          {item.label}
        </button>
      ))}
      
      <div className="nav-status">
        🎯 Autonomous Navigation Active | Current: {activeRoute || 'Unknown'} | 
        Auth: {isAuthenticated() ? '✅' : '❌'}
      </div>
    </nav>
  );
};

// Default navigation configuration
const defaultNavItems: NavigationItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: '🏠' },
  { id: 'workspace', label: 'Workspace', path: '/workspace', icon: '⚡', requiresAuth: true },
  { id: 'gallery', label: 'Gallery', path: '/gallery', icon: '📸', requiresAuth: true },
  { id: 'pricing', label: 'Pricing', path: '/pricing', icon: '💎' },
  { id: 'about', label: 'About', path: '/about', icon: '✨' }
];

export default AutonomousNavigation;