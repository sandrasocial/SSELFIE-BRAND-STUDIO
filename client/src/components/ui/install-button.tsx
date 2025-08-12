import React, { useState, useEffect } from 'react';
import { pwaManager } from '../../utils/pwa';

interface InstallButtonProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

export function InstallButton({ variant = 'default', className = '' }: InstallButtonProps) {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check install status on mount and periodically
    const checkStatus = () => {
      setCanInstall(pwaManager.canInstall);
      setIsInstalled(pwaManager.isAppInstalled);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleInstall = async () => {
    const success = await pwaManager.showInstallPrompt();
    if (success) {
      setCanInstall(false);
      setIsInstalled(true);
    }
  };

  // Don't show button if already installed or can't install
  if (isInstalled || !canInstall) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleInstall}
        className={`text-xs text-gray-600 hover:text-black transition-colors underline ${className}`}
      >
        Install App
      </button>
    );
  }

  return (
    <button
      onClick={handleInstall}
      className={`
        bg-black text-white px-6 py-3
        font-serif text-sm letter-spacing-wider uppercase
        border-0 hover:bg-gray-800 transition-colors
        ${className}
      `}
    >
      Install SSELFIE Studio
    </button>
  );
}