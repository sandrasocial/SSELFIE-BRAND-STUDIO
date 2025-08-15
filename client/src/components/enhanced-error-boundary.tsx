import React from 'react';
import { PreLoginNavigationUnified } from '@/components/pre-login-navigation-unified';
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { SandraImages } from '@/lib/sandra-images';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class EnhancedErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white">
          <PreLoginNavigationUnified />
          
          <HeroFullBleed
            backgroundImage={SandraImages.editorial.luxury1}
            tagline="Something went wrong"
            title="ERROR"
            ctaText="Try Again"
            onCtaClick={() => window.location.reload()}
            fullHeight={false}
          />

          <main className="max-w-4xl mx-auto px-8 py-16">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                We're fixing this right now
              </h2>
              <p className="text-lg text-[#666666] max-w-2xl mx-auto font-light leading-relaxed">
                Something unexpected happened. Don't worry - this doesn't affect your account 
                or any work you've saved. Try refreshing the page.
              </p>
            </div>

            <div className="bg-[#f5f5f5] p-12 text-center">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Quick Solutions
                  </h3>
                  <div className="space-y-4 max-w-md mx-auto">
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full bg-[#0a0a0a] text-white px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#333] transition-colors"
                    >
                      Refresh Page
                    </button>
                    <button
                      onClick={() => window.location.href = '/workspace'}
                      className="w-full border border-[#0a0a0a] text-[#0a0a0a] px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#0a0a0a] hover:text-white transition-colors"
                    >
                      Back to STUDIO
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#666666] pt-4 border-t border-[#e5e5e5]">
                  If this keeps happening, contact us at hello@sselfie.com
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}