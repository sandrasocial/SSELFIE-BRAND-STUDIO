import React, { useState } from 'react';
import { StudioPage } from '../pages/StudioPage';
import SSELFIEGallery from '../pages/sselfie-gallery';
import { AppTopNav } from './AppTopNav';

function MobileTabLayout() {
  const [activeTab, setActiveTab] = useState('studio');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'studio':
        return <StudioPage />;
      case 'gallery':
        return <SSELFIEGallery hideMemberNav />;
      case 'account':
        return <div className="editorial-card">
          <h2 className="editorial-text-header text-heading-1 mb-4">ACCOUNT</h2>
          <p className="editorial-text-body">Account features coming soon</p>
        </div>;
      default:
        return <StudioPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
      <AppTopNav />
      <main 
        className="flex-1 pb-24 pt-20"
        style={{
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          minHeight: 'calc(100vh - 6rem)'
        }}
        role="main" 
        aria-label="Main content"
      >
        {renderActiveTab()}
      </main>
      {/* Editorial Luxury Floating Tab Bar */}
      <nav 
        role="navigation" 
        aria-label="Mobile navigation"
        className="fixed bottom-6 left-4 right-4 z-50"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        <div className="editorial-floating-tab p-3">
          <div className="flex">
            {/* Studio Tab */}
            <button 
              onClick={() => setActiveTab('studio')} 
              aria-label="Studio tab"
              aria-pressed={activeTab === 'studio'}
              role="tab"
              tabIndex={activeTab === 'studio' ? 0 : -1}
              className={`flex-1 p-4 rounded-xl transition-all duration-300 ease-sophisticated min-h-[56px] flex items-center justify-center editorial-headline ${
                activeTab === 'studio' 
                  ? 'bg-neutral-800/60 text-neutral-200' 
                  : 'text-neutral-500 hover:bg-neutral-800/30 hover:text-neutral-300'
              }`}
              style={{ 
                fontSize: '11px',
                letterSpacing: '0.3em',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              STUDIO
            </button>
            
            {/* Gallery Tab */}
            <button 
              onClick={() => setActiveTab('gallery')} 
              aria-label="Gallery tab"
              aria-pressed={activeTab === 'gallery'}
              role="tab"
              tabIndex={activeTab === 'gallery' ? 0 : -1}
              className={`flex-1 p-4 rounded-xl transition-all duration-300 ease-sophisticated min-h-[56px] flex items-center justify-center editorial-headline ${
                activeTab === 'gallery' 
                  ? 'bg-neutral-800/60 text-neutral-200' 
                  : 'text-neutral-500 hover:bg-neutral-800/30 hover:text-neutral-300'
              }`}
              style={{ 
                fontSize: '11px',
                letterSpacing: '0.3em',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              GALLERY
            </button>
            
            {/* Account Tab */}
            <button 
              onClick={() => setActiveTab('account')} 
              aria-label="Account tab"
              aria-pressed={activeTab === 'account'}
              role="tab"
              tabIndex={activeTab === 'account' ? 0 : -1}
              className={`flex-1 p-4 rounded-xl transition-all duration-300 ease-sophisticated min-h-[56px] flex items-center justify-center editorial-headline ${
                activeTab === 'account' 
                  ? 'bg-neutral-800/60 text-neutral-200' 
                  : 'text-neutral-500 hover:bg-neutral-800/30 hover:text-neutral-300'
              }`}
              style={{ 
                fontSize: '11px',
                letterSpacing: '0.3em',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              ACCOUNT
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

export { MobileTabLayout };