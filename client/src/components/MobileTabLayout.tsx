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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, paddingBottom: '80px' }}>
        {renderActiveTab()}
      </main>
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        borderTop: '1px solid #e0e0e0',
        display: 'flex', zIndex: 100, backdropFilter: 'blur(10px)'
      }}>
        <button onClick={() => setActiveTab('studio')} style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'studio' ? '#f5f5f5' : 'transparent', textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '11px', cursor: 'pointer' }}>
          Studio
        </button>
        <button onClick={() => setActiveTab('gallery')} style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'gallery' ? '#f5f5f5' : 'transparent', textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '11px', cursor: 'pointer' }}>
          Gallery
        </button>
        <button onClick={() => setActiveTab('account')} style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'account' ? '#f5f5f5' : 'transparent', textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '11px', cursor: 'pointer' }}>
          Account
        </button>
      </div>
    </div>
  );
}

export { MobileTabLayout };