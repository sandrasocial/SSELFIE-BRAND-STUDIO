// =============================================================================
// MANUAL TYPE OVERRIDES FOR DRIZZLE ORM
// =============================================================================
// Due to corrupted type definitions in Drizzle ORM versions 0.33.0-0.44.6,
// we need to manually define the types that should be automatically inferred.
export {};
// =============================================================================
// EXPORT OVERRIDES TO REPLACE BROKEN DRIZZLE TYPES
// =============================================================================
// These interfaces are already exported above and will override the broken
// Drizzle ORM inferred types when imported in other files.
