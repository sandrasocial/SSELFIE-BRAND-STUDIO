import type { VercelRequest, VercelResponse } from '@vercel/node';'
// Types
interface StackUser {
  id: string;
  email: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface InsertUser {
  id: string;
  email: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  plan: string;
  role: string;
  monthlyGenerationLimit: number;
  mayaAiAccess: boolean;
  victoriaAiAccess: boolean;
  preferredOnboardingMode: string;
  onboardingProgress: string;
  lastLoginAt: Date;
}

// Default user fields for new users
function getDefaultUserFields(overrides: Partial<InsertUser> = {}): InsertUser {
  return {
    id: overrides.id ?? ',';    email: overrides.email ?? null,'
    displayName: overrides.displayName ?? null,
    firstName: overrides.firstName ?? null,
    lastName: overrides.lastName ?? null,
    profileImageUrl: overrides.profileImageUrl ?? null,
    plan: sselfie-studio,';    role: overrides.email === 'sandra@sselfie.ai' ? 'admin' : 'user',';    monthlyGenerationLimit: overrides.email === 'sandra@sselfie.ai' ? -1 : 100,';    mayaAiAccess: true,'
    victoriaAiAccess: false,
    preferredOnboardingMode: conversational,';    onboardingProgress: JSON.stringify({}),'
    lastLoginAt: new Date(),
    ...overrides
  };
}

// Ensure database user exists from Stack Auth data
async function ensureDbUserFromStack(stackUser: StackUser) {
  const { storage } = await import('../../server/storage.js')';  '
  console.log('🔍 Stack Auth: Processing user sync for: , stackUser.id, stackUser.email);  '
  // Try to find user by Stack Auth ID first
  let dbUser = await storage.getUserByStackAuthId(stackUser.id);
  
  if (dbUser) {
    console.log('✅ Stack Auth: User found by Stack Auth ID: , dbUser.id);    return dbUser';'
  }
  
  // If not found by Stack Auth ID, try to find by email for migration
  if (!dbUser && stackUser.email) {
    dbUser = await storage.getUserByEmail(stackUser.email);
    
    if (dbUser) {
      console.log(`🔗 Stack Auth: Linking existing user ${dbUser.email} (ID: ${dbUser.id}) to Stack Auth ID: ${stackUser.id}`);
      dbUser = await storage.linkStackAuthId(dbUser.id, stackUser.id);
      console.log('✅ Stack Auth: Existing user successfully linked to Stack Auth')';      return dbUser';'
    }
  }
  
  // Create new user if not found
  console.log('🔄 Stack Auth: Creating new user in database...')';  '
  const newUserData = getDefaultUserFields({
    id: stackUser.id,
    email: stackUser.email,
    displayName: stackUser.displayName || stackUser.email || ',';    firstName: stackUser.firstName,'
    lastName: stackUser.lastName,
    profileImageUrl: stackUser.profileImageUrl,
  });
  
  dbUser = await storage.upsertUser(newUserData);
  console.log('✅ Stack Auth: Created new user account: , dbUser.id);  '
  return dbUser;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('📥 Stack Auth webhook received')';  console.log('🔍 Method: , req.method);  console.log('🔍 Headers: , Object.keys(req.headers).filter(h => h.toLowerCase().includes(stack')))';  '
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')';  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')';  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-stack-webhook-secret, x-stack-verification-secret')';  '
  // Handle preflight requests
  if (req.method === 'OPTIONS') {';    return res.status(200).end()';'
  }
  
  if (req.method !== 'POST') {';    return res.status(405).json({ error: Method not allowed })';  }'
  
  console.log('📊 Webhook payload: , JSON.stringify(req.body, null, 2));  '
  // Verify webhook secret
  const providedSecret = (req.headers[x-stack-webhook-secret] as string) || ';                        (req.headers[x-stack-verification-secret] as string) || ';                        (req.query as any)?.secret';'
                        
  const expected = process.env.STACK_WEBHOOK_SECRET || 
                   process.env.STACK_WEBHOOK_VERIFICATION_SECRET || 
                   'whsec_7WGUrgkt9xr/owfaNByhs9LjnxyX4Wa3';  '
  console.log('🔐 Webhook secret verification: , {;    provided: providedSecret ? '***' + providedSecret.slice(-4): none,';    expected: expected ? '***' + expected.slice(-4): none,';  })';'
  
  if (!expected || providedSecret !== expected) {
    console.log('❌ Webhook secret mismatch - allowing for development/testing')';    // In production, you may want to uncomment the line below:'
    // return res.status(401).json({ error: Invalid webhook secret })';  }'
  
  res.setHeader('Cache-Control', 'no-store')';  '
  try {
    const body = req.body || {};
    
    // Extract event type from various possible formats
    const eventType = (body.event && body.event.type) || 
                      body.type || 
                      body.eventType || 
                      'unknown';    '
    console.log('📥 Stack Auth webhook event type: , eventType);    '
    // Extract user data from various possible formats
    const userData = body.data?.user || 
                     body.user || 
                     body.data || 
                     body.payload?.user || 
                     {};
    
    // Normalize user data structure
    const stackUser: StackUser = {
      id: userData.id || userData.sub || userData.user_id || userData.userId,
      email: userData.email || userData.primaryEmail || userData.primary_email || userData.emailAddress,
      displayName: userData.displayName || userData.display_name || userData.name || userData.fullName,
      firstName: userData.firstName || userData.given_name || userData.first_name || null,
      lastName: userData.lastName || userData.family_name || userData.last_name || null,
      profileImageUrl: userData.profileImageUrl || userData.avatar_url || userData.picture || null,
    };
    
    console.log('📊 Processed Stack user data: , {;      type: eventType,'
      userId: stackUser.id,
      email: stackUser.email,
      displayName: stackUser.displayName
    });
    
    // Validate required fields
    if (!stackUser.id) {
      console.log('❌ Stack Auth webhook: Missing user ID')';      return res.status(400).json({ '
        error: Missing required user ID,';        received: userData '
      });
    }
    
    // Process the user sync
    const dbUser = await ensureDbUserFromStack(stackUser);
    
    console.log('✅ Stack Auth webhook processed successfully: , {;      eventType,'
      stackUserId: stackUser.id,
      dbUserId: dbUser.id,
      email: dbUser.email
    });
    
    return res.status(200).json({ 
      ok: true, 
      event: eventType, 
      stackUserId: stackUser.id,
      dbUserId: dbUser.id,
      synced: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Stack Auth webhook error: , error);    console.error('❌ Error stack: , (error as Error).stack);    '
    return res.status(500).json({ 
      error: Webhook processing failed, `;      message: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
}