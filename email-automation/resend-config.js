// SSELFIE STUDIO - RESEND API CONFIGURATION
// Invisible Empire Email Infrastructure
// Target: €67/month luxury conversions with 87% profit margins

import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// 🎯 LUXURY BRAND CONFIGURATION
export const SSELFIE_EMAIL_CONFIG = {
  from: 'SSELFIE Studio <studio@sselfie.app>',
  replyTo: 'support@sselfie.app',
  
  // Brand styling for consistent luxury experience
  brandColors: {
    primary: '#FF69B4',    // Signature pink
    secondary: '#8A2BE2',  // Luxury purple
    accent: '#FFD700',     // Gold highlights
    text: '#2D1B69',       // Deep luxury
    background: '#FFFFFF'  // Clean premium
  },
  
  // Template base for all emails
  baseTemplate: {
    font: 'system-ui, -apple-system, sans-serif',
    maxWidth: '600px',
    padding: '20px',
    backgroundColor: '#FFFFFF'
  }
};

// SUBSCRIPTION TIER CONFIGURATION
export const SUBSCRIPTION_TIERS = {
  BASIC: {
    price: 29,
    currency: 'EUR',
    generationLimit: 100,
    features: ['Basic AI Training', 'Standard Templates', 'Email Support']
  },
  FULL_ACCESS: {
    price: 67,
    currency: 'EUR', 
    generationLimit: 500,
    features: ['Advanced AI Training', 'Premium Templates', 'Priority Support', 'Collaboration Tools', 'Analytics Dashboard']
  }
};

// 🎪 EMAIL SEQUENCE TIMING CONFIGURATION
export const SEQUENCE_TIMING = {
  WELCOME_SEQUENCE: {
    email1: 0,        // Immediate
    email2: 1440,     // 24 hours (Day 1)
    email3: 4320,     // 72 hours (Day 3)
    email4: 7200,     // 120 hours (Day 5)
    email5: 10080     // 168 hours (Day 7)
  },
  
  LIMIT_ALERTS: {
    warning75: 0.75,  // 75% of limit
    warning90: 0.90,  // 90% of limit
    reached100: 1.0   // 100% reached
  },
  
  REENGAGEMENT: {
    inactive7: 10080,   // 7 days
    inactive14: 20160,  // 14 days
    inactive30: 43200   // 30 days
  }
};

export { resend };