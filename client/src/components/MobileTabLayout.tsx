import React, { useState } from 'react';
import { StudioPage } from '../pages/StudioPage';
import SSELFIEGallery from '../pages/sselfie-gallery';

function MobileTabLayout() {
  const [activeTab, setActiveTab] = useState('studio');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'studio':
        return <StudioPage />;
      case 'gallery':
        return <SSELFIEGallery />;
      case 'account':
        return <div style={{ padding: '20px' }}>Account Page Coming Soon</div>;
      default:
        return <StudioPage />;
    }
  };

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        overflowX: 'hidden', // Prevent horizontal scroll
        WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
      }}
    >
      <main 
        style={{ 
          flex: 1, 
          paddingBottom: '80px',
          paddingTop: 'env(safe-area-inset-top)', // Handle iPhone notch
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          minHeight: 'calc(100vh - 80px)'
        }} 
        role="main" 
        aria-label="Main content"
      >
        {renderActiveTab()}
      </main>
      <nav 
        role="navigation" 
        aria-label="Mobile navigation"
        style={{
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          borderTop: '1px solid #e0e0e0',
          display: 'flex', 
          zIndex: 100, 
          backdropFilter: 'blur(10px)',
          paddingBottom: 'env(safe-area-inset-bottom)', // Handle iPhone home indicator
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        <button 
          onClick={() => setActiveTab('studio')} 
          aria-label="Studio tab"
          aria-pressed={activeTab === 'studio'}
          role="tab"
          tabIndex={activeTab === 'studio' ? 0 : -1}
          style={{ 
            flex: 1, 
            padding: '16px 8px', 
            border: 'none', 
            background: activeTab === 'studio' ? '#f5f5f5' : 'transparent', 
            textTransform: 'uppercase', 
            letterSpacing: '0.3em', 
            fontSize: '11px', 
            cursor: 'pointer',
            minHeight: '44px', // Minimum touch target size
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            WebkitTapHighlightColor: 'transparent', // Remove tap highlight on iOS
            touchAction: 'manipulation' // Optimize touch interactions
          }}
          onTouchStart={(e) => {
            // Add visual feedback on touch
            e.currentTarget.style.background = activeTab === 'studio' ? '#e5e5e5' : '#f0f0f0';
          }}
          onTouchEnd={(e) => {
            // Remove visual feedback
            e.currentTarget.style.background = activeTab === 'studio' ? '#f5f5f5' : 'transparent';
          }}
        >
          Studio
        </button>
        <button 
          onClick={() => setActiveTab('gallery')} 
          aria-label="Gallery tab"
          aria-pressed={activeTab === 'gallery'}
          role="tab"
          tabIndex={activeTab === 'gallery' ? 0 : -1}
          style={{ 
            flex: 1, 
            padding: '16px 8px', 
            border: 'none', 
            background: activeTab === 'gallery' ? '#f5f5f5' : 'transparent', 
            textTransform: 'uppercase', 
            letterSpacing: '0.3em', 
            fontSize: '11px', 
            cursor: 'pointer',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.background = activeTab === 'gallery' ? '#e5e5e5' : '#f0f0f0';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.background = activeTab === 'gallery' ? '#f5f5f5' : 'transparent';
          }}
        >
          Gallery
        </button>
        <button 
          onClick={() => setActiveTab('account')} 
          aria-label="Account tab"
          aria-pressed={activeTab === 'account'}
          role="tab"
          tabIndex={activeTab === 'account' ? 0 : -1}
          style={{ 
            flex: 1, 
            padding: '16px 8px', 
            border: 'none', 
            background: activeTab === 'account' ? '#f5f5f5' : 'transparent', 
            textTransform: 'uppercase', 
            letterSpacing: '0.3em', 
            fontSize: '11px', 
            cursor: 'pointer',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.background = activeTab === 'account' ? '#e5e5e5' : '#f0f0f0';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.background = activeTab === 'account' ? '#f5f5f5' : 'transparent';
          }}
        >
          Account
        </button>
      </nav>
    </div>
  );
}

export { MobileTabLayout };