import type { KeyLike } from 'jose';

export type LocalJWKSet = (protectedHeader?: Record<string, unknown>) => Promise<KeyLike>;