/**
 * Logout Handler
 * POST /api/logout
 * 
 * Clears authentication cookies and logs out the user
 * This is a public endpoint (no authentication required)
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { logoutSetCookieHeaders } from '../../_shared/cookies.js';

export default async function logoutHandler(req: VercelRequest, res: VercelResponse) {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get logout cookies
    const expired = logoutSetCookieHeaders();

    // Set cookies to clear authentication
    res.setHeader('Set-Cookie', expired);
    res.setHeader('Cache-Control', 'no-store');

    // Return success response
    return res.status(200).json({
      ok: true,
      loggedOut: true,
      message: 'Successfully logged out'
    });
  } catch (error) {
    console.error('❌ Error in logout handler:', error);
    return res.status(500).json({
      error: 'Failed to logout',
      message: (error as Error).message
    });
  }
}

