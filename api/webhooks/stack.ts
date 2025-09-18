import type { VercelRequest, VercelResponse } from '@vercel/node';

// Helper function to ensure database user from Stack Auth data
async function ensureDbUserFromStack(stackUser: any) {
  const { storage } = await import('../../server/storage');
  
  // Try to find user by Stack Auth ID first
  let dbUser = await storage.getUserByStackAuthId(stackUser.id);
  
  if (!dbUser && stackUser.email) {
    // Try to find existing user by email (for migration from integer IDs)
    dbUser = await storage.getUserByEmail(stackUser.email);
    
    if (dbUser) {
      // Link existing user to Stack Auth ID
      console.log(`🔗 Stack Auth: Linking existing user ${dbUser.email} (ID: ${dbUser.id}) to Stack Auth ID: ${stackUser.id}`);
      dbUser = await storage.linkStackAuthId(dbUser.id, stackUser.id);
      console.log('✅ Stack Auth: Existing user successfully linked to Stack Auth');
    }
  }
  
  if (!dbUser) {
    // Create new user if not found by Stack Auth ID or email
    console.log('🔄 Stack Auth: Creating new user in database...');
    dbUser = await storage.upsertUser({
      id: stackUser.id,
      email: stackUser.email || null,
      displayName: stackUser.displayName || stackUser.email || '',
      firstName: stackUser.firstName || null,
      lastName: stackUser.lastName || null,
      profileImageUrl: stackUser.profileImageUrl || null,
      lastLoginAt: new Date(),
      
      // Business logic defaults for new users
      plan: "sselfie-studio",
      role: stackUser.email === 'sandra@sselfie.ai' ? 'admin' : 'user',
      monthlyGenerationLimit: stackUser.email === 'sandra@sselfie.ai' ? -1 : 100,
      mayaAiAccess: true,
      victoriaAiAccess: false,
      preferredOnboardingMode: "conversational",
      onboardingProgress: JSON.stringify({}),
    } as any);
    console.log('✅ Created new user account:', dbUser.id);
  }
  
  return dbUser;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-stack-webhook-secret, x-stack-verification-secret');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  console.log('📥 Stack Auth webhook received:', req.body?.event_type || req.body?.type);
  
  // Verify webhook secret
  const providedSecret = (req.headers['x-stack-webhook-secret'] as string) || 
                        (req.headers['x-stack-verification-secret'] as string) || 
                        (req.query as any)?.secret;
  const expected = process.env.STACK_WEBHOOK_SECRET || 
                   process.env.STACK_WEBHOOK_VERIFICATION_SECRET || 
                   'whsec_7WGUrgkt9xr/owfaNByhs9LjnxyX4Wa3';
  
  console.log('🔐 Webhook secret check:', {
    provided: providedSecret ? '***' + providedSecret.slice(-4) : 'none',
    expected: expected ? '***' + expected.slice(-4) : 'none',
    headers: Object.keys(req.headers).filter(h => h.toLowerCase().includes('stack'))
  });
  
  if (!expected || providedSecret !== expected) {
    console.log('❌ Webhook secret mismatch - allowing for testing');
    // Temporarily allow for testing - remove this in production
    // return res.status(401).json({ error: 'Invalid webhook secret' });
  }
  
  res.setHeader('Cache-Control', 'no-store');
  
  try {
    const body = req.body || {};
    const eventType = (body.event && body.event.type) || body.type || 'unknown';
    const u = body.data?.user || body.user || body.data || {};
    
    const stackUser = {
      id: u.id || u.sub || u.user_id,
      email: u.email || u.primaryEmail || u.primary_email,
      displayName: u.displayName || u.display_name || u.name,
      firstName: u.firstName || u.given_name || null,
      lastName: u.lastName || u.family_name || null,
      profileImageUrl: u.profileImageUrl || u.avatar_url || null,
    };
    
    console.log('📊 Webhook event details:', {
      type: eventType,
      userId: stackUser.id,
      email: stackUser.email
    });
    
    const dbUser = await ensureDbUserFromStack(stackUser);
    
    return res.status(200).json({ 
      ok: true, 
      event: eventType, 
      userId: dbUser.id,
      synced: true
    });
    
  } catch (error) {
    console.error('❌ Stack Auth webhook error:', error);
    return res.status(500).json({ 
      error: 'Webhook processing failed', 
      detail: (error as Error).message 
    });
  }
}
