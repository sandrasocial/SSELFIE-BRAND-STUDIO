/**
 * Mobile Optimization Utilities
 * Ensures proper mobile rendering and touch interactions
 */

/**
 * Set up mobile viewport and prevent zoom on input focus
 */
export function setupMobileViewport() {
  // Add viewport meta tag if it doesn't exist
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    document.head.appendChild(viewport);
  }

  // Prevent zoom on input focus (iOS Safari)
  const preventZoom = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      }
    }
  };

  const restoreZoom = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
      }
    }
  };

  document.addEventListener('focusin', preventZoom);
  document.addEventListener('focusout', restoreZoom);

  return () => {
    document.removeEventListener('focusin', preventZoom);
    document.removeEventListener('focusout', restoreZoom);
  };
}

/**
 * Add touch-friendly styles to buttons and interactive elements
 */
export function addTouchStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Touch-friendly button styles */
    button, [role="button"], [role="tab"] {
      min-height: 44px;
      min-width: 44px;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }

    /* Prevent text selection on buttons */
    button, [role="button"], [role="tab"] {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    /* Smooth scrolling */
    html {
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }

    /* Prevent horizontal scroll */
    body {
      overflow-x: hidden;
    }

    /* Safe area handling for iPhone */
    .safe-area-top {
      padding-top: env(safe-area-inset-top);
    }

    .safe-area-bottom {
      padding-bottom: env(safe-area-inset-bottom);
    }

    .safe-area-left {
      padding-left: env(safe-area-inset-left);
    }

    .safe-area-right {
      padding-right: env(safe-area-inset-right);
    }

    /* Mobile-specific input styles */
    input, textarea, select {
      font-size: 16px; /* Prevents zoom on iOS */
      -webkit-appearance: none;
      border-radius: 0;
    }

    /* Remove default iOS styling */
    input[type="text"],
    input[type="email"],
    input[type="password"],
    textarea {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }

    /* Touch feedback for interactive elements */
    .touch-feedback:active {
      transform: scale(0.98);
      transition: transform 0.1s ease;
    }

    /* Prevent pull-to-refresh on mobile */
    body {
      overscroll-behavior-y: contain;
    }

    /* Optimize images for mobile */
    img {
      max-width: 100%;
      height: auto;
    }

    /* Mobile navigation improvements */
    @media (max-width: 768px) {
      /* Ensure proper spacing for mobile navigation */
      .mobile-nav {
        padding-bottom: env(safe-area-inset-bottom);
      }

      /* Improve touch targets */
      .touch-target {
        min-height: 44px;
        min-width: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Prevent horizontal scroll */
      * {
        max-width: 100%;
        box-sizing: border-box;
      }
    }
  `;
  
  document.head.appendChild(style);
}

/**
 * Detect mobile device and add appropriate classes
 */
export function detectMobileDevice() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  if (isMobile) {
    document.body.classList.add('mobile-device');
  }
  if (isIOS) {
    document.body.classList.add('ios-device');
  }
  if (isAndroid) {
    document.body.classList.add('android-device');
  }

  return { isMobile, isIOS, isAndroid };
}

/**
 * Handle mobile-specific gestures and interactions
 */
export function setupMobileGestures() {
  let startY = 0;
  let startX = 0;

  const handleTouchStart = (e: TouchEvent) => {
    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = startY - currentY;
    const diffX = startX - currentX;

    // Prevent horizontal scroll on vertical swipes
    if (Math.abs(diffY) > Math.abs(diffX)) {
      e.preventDefault();
    }
  };

  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });

  return () => {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
  };
}

/**
 * Optimize images for mobile devices
 */
export function optimizeImagesForMobile() {
  const images = document.querySelectorAll('img');
  
  images.forEach((img) => {
    // Add loading="lazy" for better performance
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }

    // Add proper alt text if missing
    if (!img.alt) {
      img.alt = 'Image';
    }

    // Ensure images are responsive
    if (!img.style.maxWidth) {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    }
  });
}

/**
 * Initialize all mobile optimizations
 */
export function initializeMobileOptimization() {
  const cleanup = [
    setupMobileViewport(),
    setupMobileGestures()
  ];

  addTouchStyles();
  detectMobileDevice();
  optimizeImagesForMobile();

  return () => {
    cleanup.forEach(cleanupFn => cleanupFn?.());
  };
}

export default {
  setupMobileViewport,
  addTouchStyles,
  detectMobileDevice,
  setupMobileGestures,
  optimizeImagesForMobile,
  initializeMobileOptimization
};
