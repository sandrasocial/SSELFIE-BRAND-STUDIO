import { FC } from 'react';
import { Link } from 'wouter';
import { InstallButton } from './ui/install-button';

export const GlobalFooter: FC = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div 
              className="font-serif text-2xl font-light mb-4 tracking-wide"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              SSELFIE STUDIO
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6 font-light">
              Professional photography from your selfies. Transform personal content into editorial brand imagery.
            </p>
            <InstallButton 
              className="bg-white text-black hover:bg-gray-100 text-xs uppercase tracking-[0.3em] px-6 py-3 font-light transition-colors duration-300"
            />
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.3em] font-light text-white/80 mb-6">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/simple-training" className="text-white/60 hover:text-white transition-colors text-sm font-light">
                  Train AI
                </Link>
              </li>
              <li>
                <Link href="/maya" className="text-white/60 hover:text-white transition-colors text-sm font-light">
                  Maya Photoshoot
                </Link>
              </li>
              <li>
                <Link href="/sselfie-gallery" className="text-white/60 hover:text-white transition-colors text-sm font-light">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/workspace" className="text-white/60 hover:text-white transition-colors text-sm font-light">
                  Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.3em] font-light text-white/80 mb-6">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:hello@sselfie.ai" className="text-white/60 hover:text-white transition-colors text-sm font-light">
                  hello@sselfie.ai
                </a>
              </li>
              <li>
                <a href="https://sselfie.ai" className="text-white/60 hover:text-white transition-colors text-sm font-light">
                  sselfie.ai
                </a>
              </li>
              <li>
                <a href="https://instagram.com/sandra.social" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm font-light">
                  @sandra.social
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.3em] font-light text-white/80 mb-6">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-white/60 hover:text-white transition-colors text-sm font-light">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/60 hover:text-white transition-colors text-sm font-light">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-white/60 hover:text-white transition-colors text-sm font-light">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/40 text-xs font-light tracking-wide">
              © 2025 SSELFIE STUDIO. All rights reserved.
            </p>
            <p className="text-white/40 text-xs font-light mt-4 md:mt-0 italic" style={{ fontFamily: "Times New Roman, serif" }}>
              Professional photography, redefined.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};