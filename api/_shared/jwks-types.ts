import type { JWK } from 'jose';

export type LocalJWKSet = (protectedHeader?: Record<string, unknown>) => Promise<CryptoKey | JWK>;