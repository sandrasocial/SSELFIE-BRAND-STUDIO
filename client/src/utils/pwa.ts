// PWA utilities for install functionality
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
}

export const pwaManager = {
  isInstallable(): boolean {
    return 'serviceWorker' in navigator && 'BeforeInstallPrompt' in window;
  },
  
  showInstallPrompt(event: BeforeInstallPromptEvent): void {
    event.prompt();
  },
  
  isIOSDevice(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },
  
  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches;
  }
};

export function isPWAInstallable(): boolean {
  return pwaManager.isInstallable();
}

export function showInstallPrompt(event: BeforeInstallPromptEvent): void {
  return pwaManager.showInstallPrompt(event);
}

export function isIOSDevice(): boolean {
  return pwaManager.isIOSDevice();
}

export function isStandalone(): boolean {
  return pwaManager.isStandalone();
}