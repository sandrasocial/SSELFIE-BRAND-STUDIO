/**
 * Pure Serverless Authentication Helpers
 * 
 * Replaces Express middleware with direct function calls for auth validation.
 * No Express types, no middleware chain - just pure functions.
 */

import type { VercelRequest } from '@vercel/node';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { storage } from '../storage.js';
import { STACK_PROJECT_ID, STACK_JWKS_URL, STACK_ISSUER } from '../config/env.js';

// JWKS resolver (uses centralized environment configuration)
const remoteJwks = createRemoteJWKSet(new URL(STACK_JWKS_URL));

/**
 * Verify JWT token and get payload
 */
async function verifyJWTToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, remoteJwks, {
      issuer: STACK_ISSUER,
      audience: STACK_PROJECT_ID,
    });
    return payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract and validate user from Bearer token in request headers
 * @returns User object if authenticated, null otherwise
 */
/**
 * Enhanced Authentication Helpers
 * Centralized user authentication and linking logic for SSELFIE Studio
 */

import { getDatabase, type IStorage } from '../../shared/database-provider.js';
import type { User } from '../../shared/types-override.js';

const db = getDatabase();

/**
 * Enhanced user resolution that handles Stack Auth ID linking automatically
 * @param stackAuthId - Stack Auth user ID from JWT
 * @returns Database user object with proper linking
 */
export async function resolveUserWithAutoLinking(stackAuthId: string): Promise<any> {
  try {
    // First try to find user by Stack Auth ID
    let user = await db.getUserByStackAuthId(stackAuthId);

    if (!user) {
      console.log(`🔍 AUTH: User not found by Stack Auth ID: ${stackAuthId}, attempting auto-linking...`);

      // Try to find user by the Stack Auth ID as primary ID (legacy users)
      user = await db.getUser(stackAuthId);

      if (user) {
        // Link the Stack Auth ID to this user
        console.log(`🔗 AUTH: Linking Stack Auth ID ${stackAuthId} to existing user ${user.id}`);
        user = await db.linkStackAuthId(user.id, stackAuthId);
        console.log(`✅ AUTH: Successfully linked user ${user.id} with Stack Auth ID ${stackAuthId}`);
      } else {
        console.warn(`❌ AUTH: No user found for Stack Auth ID: ${stackAuthId}`);
        throw new Error(`User not found. Please complete registration.`);
      }
    }

    return user;
  } catch (error) {
    console.error('❌ AUTH: Failed to resolve user:', error);
    throw error;
  }
}

/**
 * Get authenticated user from request with enhanced error handling
 * @param req - Vercel request object
 * @returns Database user object
 */
export async function getUserFromRequest(req: any): Promise<User> {
  try {
    // Extract user from Stack Auth JWT
    const stackAuthUser = req.user?.claims?.sub;

    if (!stackAuthUser) {
      console.warn('❌ AUTH: No Stack Auth user found in request');
      throw new Error('Authentication required');
    }

    console.log(`🔍 AUTH: Resolving user for Stack Auth ID: ${stackAuthUser}`);
    return await resolveUserWithAutoLinking(stackAuthUser);
  } catch (error) {
    console.error('❌ AUTH: Failed to get user from request:', error);
    throw error;
  }
}

/**
 * Validate user has access to Maya features
 * @param user - Database user object
 * @returns Maya profile if access granted
 */
export async function validateMayaAccess(user: User) {
  try {
    // Get or create Maya profile
    const profile = await db.getMayaProfile(user.id);

    if (!profile) {
      console.log(`🔍 MAYA: Creating new profile for user ${user.id}`);
      // Profile will be created by getOrCreateUserProfile in MayaService
      return null;
    }

    // Check feature access
    if (!(profile.featureAccess as any)?.basicGeneration) {
      console.warn(`❌ MAYA: User ${user.id} does not have Maya access`);
      throw new Error('Maya AI features are not available for this account');
    }

    return profile;
  } catch (error) {
    console.error('❌ MAYA: Access validation failed:', error);
    throw error;
  }
}

/**
 * Validate user has completed model training for generation
 * @param user - Database user object
 * @returns User model if available and trained
 */
export async function validateUserModel(user: any) {
  try {
    const userModel = await db.getUserModel(user.id);

    if (!userModel) {
      console.warn(`❌ MODEL: No model found for user ${user.id}`);
      throw new Error('Please complete your model training before generating images');
    }

    if (userModel.trainingStatus !== 'completed') {
      console.warn(`❌ MODEL: Model training not complete for user ${user.id}, status: ${userModel.trainingStatus}`);
      throw new Error(`Model training is ${userModel.trainingStatus}. Please wait for completion.`);
    }

    if (!userModel.replicateVersionId) {
      console.error(`❌ MODEL: Model missing version ID for user ${user.id}`);
      throw new Error('Model training completed but version ID is missing. Please contact support.');
    }

    return userModel;
  } catch (error) {
    console.error('❌ MODEL: Validation failed:', error);
    throw error;
  }
}

/**
 * Require authentication - throws if user is null
 * Use this for protected endpoints
 */
export function requireAuth<T>(user: T | null): asserts user is T {
  if (!user) {
    throw new Error('Authentication required');
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(user: any): boolean {
  return user?.role === 'admin' || user?.email?.includes('@ssasocial.com');
}

/**
 * Require admin access - throws if user is not admin
 */
export function requireAdmin(user: any): void {
  requireAuth(user);
  if (!isAdmin(user)) {
    throw new Error('Admin access required');
  }
}
