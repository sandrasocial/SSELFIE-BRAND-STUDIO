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
    const { email, password, subscription_tier = 'creator' } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const result = await executeQuery(
      'INSERT INTO users (email, password_hash, subscription_tier) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, passwordHash, subscription_tier]
    );

    const user = result.rows[0];
    const tokens = generateTokens(user.id, user.email, user.role);

    // Update refresh token
    await executeQuery(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [tokens.refreshToken, user.id]
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        subscription_tier
      },
      ...tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}