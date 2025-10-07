import type { Request, Response } from 'express';
import { userSyncRepair } from '../user-sync-repair.js';
import { authenticateAdmin } from '../stack-auth.js';

/**
 * Admin endpoint to repair user synchronization issues
 * POST /api/admin/repair-users
 */
export async function repairUsers(req: Request, res: Response) {
  try {
    // Ensure admin authentication
    await new Promise<void>((resolve, reject) => {
      authenticateAdmin(req, res, (err?: unknown) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const { action = 'check', userIdentifier } = req.body;

    switch (action) {
      case 'check': {
        // Just check status without making changes
        const status = await userSyncRepair.checkUserSyncStatus();
        return res.json({
          success: true,
          status,
          message: `Found ${status.issuesFound.length} synchronization issues`
        });
      }

      case 'repair-all': {
        // Repair all users
        const result = await userSyncRepair.repairAllUsers();
        return res.json({
          success: true,
          result,
          message: `Repaired ${result.repaired} users with ${result.errors.length} errors`
        });
      }

      case 'repair-user': {
        // Repair specific user
        if (!userIdentifier) {
          return res.status(400).json({
            success: false,
            message: 'userIdentifier required for repair-user action'
          });
        }

        const success = await userSyncRepair.repairUser(userIdentifier);
        return res.json({
          success,
          message: success 
            ? `User ${userIdentifier} repaired successfully`
            : `Failed to repair user ${userIdentifier}`
        });
      }

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use: check, repair-all, or repair-user'
        });
    }

  } catch (error) {
    console.error('❌ User repair endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'User repair operation failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}