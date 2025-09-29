// Premium Animation System for SSELFIE Brand Studio
// Luxury micro-interactions and smooth transitions

export const PremiumAnimations = {
  // Timing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    luxury: 'cubic-bezier(0.23, 1, 0.32, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  },

  // Durations (milliseconds)
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms'
  },

  // Delays
  delay: {
    none: '0ms',
    short: '100ms',
    medium: '200ms',
    long: '300ms'
  }
} as const;

// Animation utility classes
export const AnimationClasses = {
  // Basic transitions
  transition: `transition-all duration-300 ease-out`,
  transitionFast: `transition-all duration-150 ease-out`,
  transitionSlow: `transition-all duration-500 ease-out`,
  transitionLuxury: `transition-all duration-700 cubic-bezier(0.23, 1, 0.32, 1)`,

  // Hover effects
  hoverScale: `hover:scale-105 transition-transform duration-300 ease-out`,
  hoverScaleSmall: `hover:scale-102 transition-transform duration-200 ease-out`,
  hoverFloat: `hover:-translate-y-1 transition-transform duration-300 ease-out`,

  // Focus effects
  focusRing: `focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2`,
  focusScale: `focus:scale-105 transition-transform duration-200 ease-out`,

  // Loading states
  pulse: `animate-pulse`,
  spin: `animate-spin`,
  bounce: `animate-bounce`,

  // Entrance animations
  fadeIn: `animate-fade-in`,
  slideUp: `animate-slide-up`,
  slideDown: `animate-slide-down`,
  slideLeft: `animate-slide-left`,
  slideRight: `animate-slide-right`,
  scaleIn: `animate-scale-in`,

  // Stagger delays for lists
  stagger1: `animation-delay-100`,
  stagger2: `animation-delay-200`,
  stagger3: `animation-delay-300`,
  stagger4: `animation-delay-400`,
} as const;

// Component-specific animations
export const ComponentAnimations = {
  tabButton: {
    base: `transition-all duration-300 ease-in-out`,
    active: `transform scale-105`,
    hover: `hover:scale-102 hover:bg-stone-200/40`,
    focus: `focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2`
  },

  statusBar: {
    indicator: `animate-pulse duration-2000`,
    transition: `transition-all duration-500 ease-out`
  },

  floatingTab: {
    container: `backdrop-blur-3xl transition-all duration-300 ease-out`,
    button: `transition-all duration-300 ease-in-out min-h-[56px] sm:min-h-[64px]`,
    icon: `transition-all duration-300`,
    label: `transition-all duration-300`
  },

  mainContent: {
    enter: `animate-fade-in duration-500`,
    loading: `animate-pulse`,
    error: `animate-shake`
  }
} as const;

// Keyframe animations for custom effects
export const KeyframeAnimations = {
  // Fade in from bottom
  fadeInUp: {
    from: {
      opacity: 0,
      transform: 'translateY(2rem)'
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)'
    }
  },

  // Scale in
  scaleIn: {
    from: {
      opacity: 0,
      transform: 'scale(0.9)'
    },
    to: {
      opacity: 1,
      transform: 'scale(1)'
    }
  },

  // Subtle glow effect
  glow: {
    '0%, 100%': {
      opacity: 1,
      transform: 'scale(1)'
    },
    '50%': {
      opacity: 0.8,
      transform: 'scale(1.02)'
    }
  },

  // Smooth slide up
  slideUp: {
    from: {
      opacity: 0,
      transform: 'translateY(1rem)'
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)'
    }
  },

  // Gentle shake for errors
  shake: {
    '0%, 100%': {
      transform: 'translateX(0)'
    },
    '10%, 30%, 50%, 70%, 90%': {
      transform: 'translateX(-2px)'
    },
    '20%, 40%, 60%, 80%': {
      transform: 'translateX(2px)'
    }
  }
} as const;

// Animation presets for common UI patterns
export const AnimationPresets = {
  // Page transitions
  pageEnter: `animate-fade-in duration-500 ease-out`,
  pageExit: `animate-fade-out duration-300 ease-in`,

  // Modal animations
  modalEnter: `animate-scale-in duration-300 ease-out`,
  modalBackdropEnter: `animate-fade-in duration-200 ease-out`,

  // Button interactions
  buttonPress: `active:scale-95 transition-transform duration-100 ease-out`,
  buttonHover: `hover:scale-105 hover:shadow-lg transition-all duration-200 ease-out`,

  // Card interactions
  cardHover: `hover:scale-102 hover:shadow-xl transition-all duration-300 ease-out`,
  cardPress: `active:scale-98 transition-transform duration-100 ease-out`,

  // Loading states
  skeletonPulse: `animate-pulse bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 bg-size-200 animate-shimmer`,
  loadingSpinner: `animate-spin duration-1000 linear infinite`,

  // Status indicators
  onlineIndicator: `animate-pulse duration-2000 ease-in-out infinite`,
  notificationBadge: `animate-bounce duration-1000 ease-in-out infinite`
} as const;

export default PremiumAnimations;