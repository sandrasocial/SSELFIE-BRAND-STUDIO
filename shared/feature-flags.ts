import { z } from 'zod';

// Feature flag type definitions
export const FeatureFlagSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
  scope: z.enum(['global', 'user', 'beta']),
  dependencies: z.array(z.string()).optional(),
});

export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;

// Infrastructure feature flags
export const infrastructureFlags = {
  NEW_ERROR_BOUNDARY: 'new-error-boundary-system',
  NEW_STORAGE_SYSTEM: 'new-storage-system',
  NEW_NOTIFICATION_SYSTEM: 'new-notification-system',
} as const;

// Type-safe feature flag configuration
export const featureFlags: Record<string, FeatureFlag> = {
  [infrastructureFlags.NEW_ERROR_BOUNDARY]: {
    name: 'New Error Boundary System',
    enabled: false,
    scope: 'global',
  },
  [infrastructureFlags.NEW_STORAGE_SYSTEM]: {
    name: 'New Storage System',
    enabled: false,
    scope: 'global',
  },
  [infrastructureFlags.NEW_NOTIFICATION_SYSTEM]: {
    name: 'New Notification System',
    enabled: false,
    scope: 'global',
    dependencies: [infrastructureFlags.NEW_ERROR_BOUNDARY],
  },
};