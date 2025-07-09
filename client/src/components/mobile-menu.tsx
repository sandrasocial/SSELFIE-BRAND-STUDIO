import React from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  user?: any;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  user
}) => {
  if (!isOpen) return null;

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="fixed inset-0 z-[1001] bg-black bg-opacity-95 backdrop-blur-sm">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <span className="text-white text-sm tracking-[0.3em] uppercase font-inter font-light">
            SSELFIE STUDIO
          </span>
          <button
            onClick={onClose}
            className="text-white text-2xl hover:opacity-70 transition-opacity"
          >
            ×
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 flex flex-col justify-center px-6">
          <ul className="space-y-8">
            {isAuthenticated ? (
              <>
                <li>
                  <Link href="/workspace" onClick={onClose}>
                    <span className="text-white text-2xl tracking-[0.2em] uppercase font-inter font-light hover:opacity-70 transition-opacity">
                      STUDIO
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/ai-generator" onClick={onClose}>
                    <span className="text-white text-2xl tracking-[0.2em] uppercase font-inter font-light hover:opacity-70 transition-opacity">
                      AI GENERATOR
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/brandbook-designer" onClick={onClose}>
                    <span className="text-white text-2xl tracking-[0.2em] uppercase font-inter font-light hover:opacity-70 transition-opacity">
                      BRANDBOOK
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/landing-builder" onClick={onClose}>
                    <span className="text-white text-2xl tracking-[0.2em] uppercase font-inter font-light hover:opacity-70 transition-opacity">
                      LANDING PAGES
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/onboarding" onClick={onClose}>
                    <span className="text-white text-2xl tracking-[0.2em] uppercase font-inter font-light hover:opacity-70 transition-opacity">
                      AI TRAINING
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/profile" onClick={onClose}>
                    <span className="text-white text-2xl tracking-[0.2em] uppercase font-inter font-light hover:opacity-70 transition-opacity">
                      PROFILE
                    </span>
                  </Link>
                </li>
                {user?.email === 'ssa@ssasocial.com' && (
                  <li>
                    <Link href="/admin" onClick={onClose}>
                      <span className="text-white text-2xl tracking-[0.2em] uppercase font-inter font-light hover:opacity-70 transition-opacity">
                        ADMIN
                      </span>
                    </Link>
                  </li>
                )}
              </>
            ) : (
              <>
                <li>
                  <Link href="/about" onClick={onClose}>
                    <span className="text-white text-2xl tracking-[0.2em] uppercase font-inter font-light hover:opacity-70 transition-opacity">
                      About
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" onClick={onClose}>
                    <span className="text-white text-2xl tracking-[0.2em] uppercase font-inter font-light hover:opacity-70 transition-opacity">
                      How It Works
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/blog" onClick={onClose}>
                    <span className="text-white text-2xl tracking-[0.2em] uppercase font-inter font-light hover:opacity-70 transition-opacity">
                      Blog
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" onClick={onClose}>
                    <span className="text-white text-2xl tracking-[0.2em] uppercase font-inter font-light hover:opacity-70 transition-opacity">
                      Pricing
                    </span>
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Auth Actions */}
          <div className="mt-12 pt-8 border-t border-white/10">
            {isAuthenticated ? (
              <div className="space-y-4">
                {user && (
                  <div className="text-white/60 text-sm font-inter">
                    {user.email}
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-white text-lg tracking-[0.2em] uppercase font-inter font-light hover:opacity-70 transition-opacity"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full text-left text-white text-lg tracking-[0.2em] uppercase font-inter font-light hover:opacity-70 transition-opacity"
              >
                Login
              </button>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};