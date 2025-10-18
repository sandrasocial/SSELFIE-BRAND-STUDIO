// Centralized UI class presets derived from the SSELFIE artifact
// Minimal, utility-first friendly. No Tailwind config changes required.
// Usage: <div className={`${UI.cards.glass} ${UI.radii.xl}`}>...</div>

export const UI = {
  // Background surfaces and containers
  surfaces: {
    glassContainer: 'bg-white/30 backdrop-blur-3xl border border-white/40',
    glassPill: 'bg-white/60 backdrop-blur-xl border border-white/40 rounded-full',
    softPanel: 'bg-stone-100/50 border border-stone-200/40',
  },

  // Card shells
  cards: {
    glass: 'bg-white/50 backdrop-blur-2xl border border-white/60 shadow-xl shadow-stone-900/10',
    glassStrong: 'bg-white/60 backdrop-blur-2xl border border-white/70 shadow-2xl shadow-stone-900/20',
    soft: 'bg-stone-100/50 border border-stone-200/40',
  },

  // Buttons (shape + behaviors). Compose with sizing below.
  buttons: {
    primary: 'group relative bg-stone-950 text-white font-semibold tracking-wide transition-all duration-300 hover:shadow-2xl hover:shadow-stone-900/40 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-600/40',
    secondary: 'bg-white/60 backdrop-blur-xl text-stone-950 border border-white/70 transition-all duration-300 hover:bg-white/80 hover:border-white/90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none',
    subtle: 'bg-white/40 backdrop-blur-xl border border-white/60 text-stone-700 hover:bg-white/60',
    // Rounded shapes (compose):
    roundedLg: 'rounded-xl',
    roundedXl: 'rounded-[1.25rem]',
    rounded2Xl: 'rounded-[1.5rem]',
  },

  // Standard paddings/heights for buttons (compose with buttons above)
  size: {
    btnSm: 'px-4 py-3 min-h-[44px] text-xs',
    btnMd: 'px-6 py-4 min-h-[52px] text-sm',
    btnLg: 'px-8 py-5 min-h-[60px] text-sm',
  },

  // Typography presets from artifact
  text: {
    h1Brand: 'font-serif font-extralight uppercase tracking-[0.3em] text-stone-950',
    h2Brand: 'font-serif font-extralight uppercase tracking-[0.2em] text-stone-950',
    captionUpper: 'text-[10px] tracking-[0.15em] uppercase font-light text-stone-500',
    labelUpper: 'text-xs tracking-[0.15em] uppercase font-light text-stone-500',
  },

  // Radius helpers used across components
  radii: {
    lg: 'rounded-xl',
    xl: 'rounded-[1.25rem]',
    xxl: 'rounded-[1.5rem]',
    xxxl: 'rounded-[1.75rem]',
    pill: 'rounded-full',
    containerLg: 'rounded-[2rem]',
    containerXl: 'rounded-[2.5rem]',
    container2Xl: 'rounded-[3rem]',
  },

  // Navigation shells
  nav: {
    bottomBar: 'bg-white/20 backdrop-blur-3xl border border-white/40 px-2 py-4 shadow-2xl shadow-stone-900/20',
    tabActiveHalo: 'bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-2xl border border-white/60',
    tabIconActive: 'bg-stone-950 shadow-lg shadow-stone-900/30 text-white',
    tabIconIdle: 'bg-white/40 backdrop-blur-xl text-stone-600',
  },

  // Badges / Pills
  badge: {
    smallPill: 'inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 backdrop-blur-xl border border-stone-200 rounded-full',
  },

  // Micro effects
  effects: {
    scaleOnHover: 'hover:scale-[1.02] active:scale-95',
    activeScale: 'transform scale-105',
    shadowSoft: 'shadow-xl shadow-stone-900/10',
  },
} as const;

export type UIKeys = typeof UI;

