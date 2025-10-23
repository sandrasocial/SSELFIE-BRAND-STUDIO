/**
 * Diagnostic Endpoint - Complete User Journey Test
 * Tests all critical paths for both new and existing users
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../server/_middleware/auth.js';
import type { AuthenticatedRequest } from '../../server/_shared/auth-types.js';
import { storage } from '../../server/storage.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
  memory: 3008
};

interface DiagnosticResult {
  timestamp: string;
  authenticated: boolean;
  userId?: string;
  email?: string;
  tests: {
    name: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    result?: any;
    error?: string;
  }[];
  summary: {
    passed: number;
    failed: number;
    skipped: number;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    const result: DiagnosticResult = {
      timestamp: new Date().toISOString(),
      authenticated: !!req.user,
      userId: req.user?.id,
      email: req.user?.email,
      tests: [],
      summary: { passed: 0, failed: 0, skipped: 0 }
    };

    try {
      // Test 1: Database Connection
      try {
        const count = await storage.getUserCount();
        result.tests.push({
          name: 'Database Connection',
          status: 'PASS',
          result: { userCount: count }
        });
        result.summary.passed++;
      } catch (error) {
        result.tests.push({
          name: 'Database Connection',
          status: 'FAIL',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        result.summary.failed++;
      }

      // Test 2: User Lookup
      try {
        if (!req.user?.id) throw new Error('No user ID');
        const user = await storage.getUser(req.user.id);
        result.tests.push({
          name: 'User Lookup',
          status: user ? 'PASS' : 'FAIL',
          result: user ? { id: user.id, email: user.email, plan: user.plan } : null,
          error: user ? undefined : 'User not found in database'
        });
        if (user) result.summary.passed++;
        else result.summary.failed++;
      } catch (error) {
        result.tests.push({
          name: 'User Lookup',
          status: 'FAIL',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        result.summary.failed++;
      }

      // Test 3: User Model Status
      try {
        if (!req.user?.id) throw new Error('No user ID');
        const model = await storage.getUserModel(req.user.id);
        result.tests.push({
          name: 'User Model Status',
          status: 'PASS',
          result: model ? { 
            id: model.id, 
            trainingStatus: model.trainingStatus,
            modelName: model.modelName 
          } : { trainingStatus: 'not_started' }
        });
        result.summary.passed++;
      } catch (error) {
        result.tests.push({
          name: 'User Model Status',
          status: 'FAIL',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        result.summary.failed++;
      }

      // Test 4: Gallery Images
      try {
        if (!req.user?.id) throw new Error('No user ID');
        const images = await storage.getAIImages(req.user.id);
        result.tests.push({
          name: 'Gallery Images',
          status: 'PASS',
          result: { count: images.length }
        });
        result.summary.passed++;
      } catch (error) {
        result.tests.push({
          name: 'Gallery Images',
          status: 'FAIL',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        result.summary.failed++;
      }

      // Test 5: Maya Chats
      try {
        if (!req.user?.id) throw new Error('No user ID');
        const chats = await storage.getMayaChats(req.user.id);
        result.tests.push({
          name: 'Maya Chats',
          status: 'PASS',
          result: { count: chats.length }
        });
        result.summary.passed++;
      } catch (error) {
        result.tests.push({
          name: 'Maya Chats',
          status: 'FAIL',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        result.summary.failed++;
      }

      // Test 6: Generated Images
      try {
        if (!req.user?.id) throw new Error('No user ID');
        const images = await storage.getGeneratedImages(req.user.id);
        result.tests.push({
          name: 'Generated Images',
          status: 'PASS',
          result: { count: images.length }
        });
        result.summary.passed++;
      } catch (error) {
        result.tests.push({
          name: 'Generated Images',
          status: 'FAIL',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        result.summary.failed++;
      }

    } catch (error) {
      result.tests.push({
        name: 'Overall Test Suite',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      result.summary.failed++;
    }

    return res.status(200).json(result);
  }, { optional: false });
}

