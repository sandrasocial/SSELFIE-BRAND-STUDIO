import React from 'react';
import { Link } from 'wouter';

export const GlobalFooter: React.FC = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="font-serif text-2xl font-light mb-4">
              SSELFIE STUDIO
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              The world's first AI-powered personal branding platform. Transform selfies into complete business launches.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.3em] text-white/80 mb-6">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/ai-training" className="text-white/60 hover:text-white transition-colors text-sm">
                  Train AI
                </Link>
              </li>
              <li>
                <Link href="/maya" className="text-white/60 hover:text-white transition-colors text-sm">
                  Maya Photoshoot
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-white/60 hover:text-white transition-colors text-sm">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/flatlay-library" className="text-white/60 hover:text-white transition-colors text-sm">
                  Flatlay Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.3em] text-white/80 mb-6">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/how-it-works" className="text-white/60 hover:text-white transition-colors text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/60 hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/60 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-white/60 hover:text-white transition-colors text-sm">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.3em] text-white/80 mb-6">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-white/60 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/60 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="/api/logout" className="text-white/60 hover:text-white transition-colors text-sm">
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/40 text-xs">
              © 2025 SSELFIE STUDIO. All rights reserved.
            </p>
            <p className="text-white/40 text-xs mt-4 md:mt-0">
              Built with ♥ for personal brand creators
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};