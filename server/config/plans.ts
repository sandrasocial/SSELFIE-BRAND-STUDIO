// Single source of truth for all subscription plans
export const PLANS = {
  sselfieStudio: {
    key: 'sselfie-studio',
    publicName: 'Personal Brand Studio',
    priceCents: 4700,
    monthlyGenerations: 100,
    description: '100 AI generations/month + Maya',
  },
} as const;

// Type definitions for type safety
export type PlanKey = typeof PLANS.sselfieStudio.key;
export type Plan = typeof PLANS[keyof typeof PLANS];