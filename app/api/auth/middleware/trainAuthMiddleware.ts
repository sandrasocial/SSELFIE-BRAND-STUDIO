import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { getSession } from 'next-auth/react';

// Rate limiting for training endpoints
const trainLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 training sessions per window
  message: 'Too many training attempts, please try again later'
});

export async function validateTrainSession(
  request: NextRequest,
  response: NextResponse
) {
  try {
    // 1. Verify session exists
    const session = await getSession({ req: request });
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }

    // 2. Verify JWT token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      if (!decoded) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid token' },
          { status: 401 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { error: 'Unauthorized - Token validation failed' },
        { status: 401 }
      );
    }

    // 3. Check training quotas and limits
    const userTrainingCount = await getUserTrainingCount(session.user.id);
    if (userTrainingCount >= 5) { // 5 training sessions per day
      return NextResponse.json(
        { error: 'Training quota exceeded for today' },
        { status: 429 }
      );
    }

    // 4. All checks passed
    return NextResponse.next();
  } catch (error) {
    console.error('Train auth middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getUserTrainingCount(userId: string): Promise<number> {
  // Implementation to check training count from database
  // This will be implemented when we set up the training tracking table
  return 0;
}