import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { executeQuery } from '../../../lib/db';
import { generateTokens } from '../../../middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user
    const result = await executeQuery(
      'SELECT id, email, password_hash, role, subscription_tier FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const tokens = generateTokens(user.id, user.email, user.role);

    // Update refresh token and last login
    await executeQuery(
      'UPDATE users SET refresh_token = $1, last_login = CURRENT_TIMESTAMP WHERE id = $2',
      [tokens.refreshToken, user.id]
    );

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        subscription_tier: user.subscription_tier
      },
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}