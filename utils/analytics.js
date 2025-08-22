// Analytics Configuration
const ANALYTICS_CONFIG = {
  // Google Analytics ID
  GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_ID,
  
  // Social Media Conversion Events
  CONVERSION_EVENTS: {
    SIGNUP_STARTED: 'signup_started',
    SIGNUP_COMPLETED: 'signup_completed',
    PRICING_CALCULATOR_USED: 'pricing_calculator_used',
    EARLY_BIRD_REGISTERED: 'early_bird_registered'
  },

  // UTM Parameter tracking
  UTM_PARAMS: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
};

// Track Page Views
export const trackPageView = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', ANALYTICS_CONFIG.GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track Social Media Conversions
export const trackSocialConversion = (eventName, eventData = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...eventData,
      source: getUTMParams()
    });
  }
};

// Get UTM Parameters
const getUTMParams = () => {
  if (typeof window === 'undefined') return {};
  
  const urlParams = new URLSearchParams(window.location.search);
  const utmData = {};
  
  ANALYTICS_CONFIG.UTM_PARAMS.forEach(param => {
    const value = urlParams.get(param);
    if (value) utmData[param] = value;
  });
  
  return utmData;
};

// Track Early Bird Signups
export const trackEarlyBirdSignup = (plan) => {
  trackSocialConversion(ANALYTICS_CONFIG.CONVERSION_EVENTS.EARLY_BIRD_REGISTERED, {
    plan_type: plan,
    timestamp: new Date().toISOString()
  });
};

// Track Pricing Calculator Usage
export const trackCalculatorUsage = (currentCost, selectedPlan, savings) => {
  trackSocialConversion(ANALYTICS_CONFIG.CONVERSION_EVENTS.PRICING_CALCULATOR_USED, {
    current_cost: currentCost,
    selected_plan: selectedPlan,
    calculated_savings: savings
  });
};

export default {
  trackPageView,
  trackSocialConversion,
  trackEarlyBirdSignup,
  trackCalculatorUsage,
  ANALYTICS_CONFIG
};