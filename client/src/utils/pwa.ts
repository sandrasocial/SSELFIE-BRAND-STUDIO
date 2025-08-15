// PWA Installation and Management Utilities
// Handles app installation prompts and PWA features

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;

  constructor() {
    this.init();
  }

  private init() {
    // Check if already installed
    this.checkInstallStatus();
    
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.showInstallBanner();
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('SSELFIE Studio: PWA installed successfully');
      this.isInstalled = true;
      this.hideInstallBanner();
      this.trackInstallation();
    });

    // Register service worker
    this.registerServiceWorker();
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SSELFIE Studio: Service Worker registered', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable();
              }
            });
          }
        });
      } catch (error) {
        console.log('SSELFIE Studio: Service Worker registration failed', error);
      }
    }
  }

  private checkInstallStatus() {
    // Check if running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }
    
    // Check if running in TWA (Trusted Web Activity)
    if (document.referrer.includes('android-app://')) {
      this.isInstalled = true;
    }
  }

  public async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('SSELFIE Studio: User accepted install prompt');
        return true;
      } else {
        console.log('SSELFIE Studio: User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('SSELFIE Studio: Install prompt failed', error);
      return false;
    }
  }

  private showInstallBanner() {
    // Create elegant install banner
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #0a0a0a;
        color: white;
        padding: 16px 24px;
        border-radius: 0;
        z-index: 10000;
        font-family: 'Times New Roman', serif;
        font-size: 14px;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        max-width: 320px;
        text-align: center;
        animation: slideUp 0.3s ease-out;
      ">
        <div style="margin-bottom: 12px; font-weight: 300;">
          Install SSELFIE Studio
        </div>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="pwa-install-btn" style="
            background: white;
            color: #0a0a0a;
            border: none;
            padding: 8px 16px;
            font-size: 11px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            cursor: pointer;
            font-family: inherit;
          ">Install</button>
          <button id="pwa-dismiss-btn" style="
            background: transparent;
            color: white;
            border: 1px solid white;
            padding: 8px 16px;
            font-size: 11px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            cursor: pointer;
            font-family: inherit;
          ">Later</button>
        </div>
      </div>
      <style>
        @keyframes slideUp {
          from { transform: translate(-50%, 100px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      </style>
    `;

    document.body.appendChild(banner);

    // Handle install button
    document.getElementById('pwa-install-btn')?.addEventListener('click', () => {
      this.showInstallPrompt();
      this.hideInstallBanner();
    });

    // Handle dismiss button
    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      this.hideInstallBanner();
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      this.hideInstallBanner();
    }, 10000);
  }

  private hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.style.animation = 'slideDown 0.3s ease-out forwards';
      setTimeout(() => banner.remove(), 300);
    }
  }

  private showUpdateAvailable() {
    // Simple update notification
    console.log('SSELFIE Studio: Update available');
    
    // Could show a toast notification here
    if (window.location.pathname === '/') {
      const updateBanner = document.createElement('div');
      updateBanner.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #0a0a0a;
          color: white;
          padding: 12px;
          text-align: center;
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          z-index: 10001;
        ">
          New version available. Refresh to update.
        </div>
      `;
      document.body.appendChild(updateBanner);
    }
  }

  private trackInstallation() {
    // Track PWA installation for analytics
    console.log('SSELFIE Studio: PWA installation tracked');
    
    // Could send to analytics service here
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install', {
        event_category: 'engagement',
        event_label: 'PWA installed'
      });
    }
  }

  public get canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled;
  }

  public get isAppInstalled(): boolean {
    return this.isInstalled;
  }
}

// Export singleton instance
export const pwaManager = new PWAManager();