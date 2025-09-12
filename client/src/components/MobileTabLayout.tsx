import React from 'react';
import { FiHome, FiImage, FiUser } from 'react-icons/fi';

interface MobileTabLayoutProps {
  activeTab: 'studio' | 'gallery' | 'account';
  onTabChange: (tab: 'studio' | 'gallery' | 'account') => void;
  children: React.ReactNode;
}

export const MobileTabLayout: React.FC<MobileTabLayoutProps> = ({ activeTab, onTabChange, children }) => {
  return (
    <div className="mobile-tab-layout">
      <div className="mobile-tab-content">{children}</div>
      <nav className="mobile-tab-bar">
        <button
          className={`mobile-tab-button${activeTab === 'studio' ? ' active' : ''}`}
          onClick={() => onTabChange('studio')}
          aria-label="Studio"
        >
          <FiHome size={22} />
          <span>Studio</span>
        </button>
        <button
          className={`mobile-tab-button${activeTab === 'gallery' ? ' active' : ''}`}
          onClick={() => onTabChange('gallery')}
          aria-label="Gallery"
        >
          <FiImage size={22} />
          <span>Gallery</span>
        </button>
        <button
          className={`mobile-tab-button${activeTab === 'account' ? ' active' : ''}`}
          onClick={() => onTabChange('account')}
          aria-label="Account"
        >
          <FiUser size={22} />
          <span>Account</span>
        </button>
      </nav>
      <style jsx>{`
        .mobile-tab-layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .mobile-tab-content {
          flex: 1;
          overflow-y: auto;
        }
        .mobile-tab-bar {
          display: flex;
          border-top: 1px solid #e0e0e0;
          background: #fff;
          box-shadow: 0 -2px 12px rgba(0,0,0,0.04);
        }
        .mobile-tab-button {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px 0 6px 0;
          background: none;
          border: none;
          font-size: 11px;
          color: #666;
          transition: color 0.2s;
        }
        .mobile-tab-button.active {
          color: #000;
        }
        .mobile-tab-button span {
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
};
