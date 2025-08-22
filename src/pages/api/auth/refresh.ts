import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../../../lib/db';
import { generateTokens } from '../../../middleware/auth';

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

    // Get user
    const result = await executeQuery(
      'SELECT id, email, role, refresh_token FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    const user = result.rows[0];
    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id, user.email, user.role);

    // Update refresh token
    await executeQuery(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [tokens.refreshToken, user.id]
    );

    res.status(200).json(tokens);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}