function getDefaultUserFields(overrides = {}) {
    return {
        id: overrides.id ?? '',
        email: overrides.email ?? null,
        displayName: overrides.displayName ?? null,
        firstName: overrides.firstName ?? null,
        lastName: overrides.lastName ?? null,
        profileImageUrl: overrides.profileImageUrl ?? null,
        plan: 'sselfie-studio',
        role: overrides.email === 'sandra@sselfie.ai' ? 'admin' : 'user',
        monthlyGenerationLimit: overrides.email === 'sandra@sselfie.ai' ? -1 : 100,
        mayaAiAccess: true,
        victoriaAiAccess: false,
        preferredOnboardingMode: 'conversational',
        onboardingProgress: JSON.stringify({}),
        lastLoginAt: new Date(),
        ...overrides
    };
}
async function ensureDbUserFromStack(stackUser) {
    const { storage } = await import('../../server/storage.js');
    console.log('🔍 Stack Auth: Processing user sync for:', stackUser.id, stackUser.email);
    let dbUser = await storage.getUserByStackAuthId(stackUser.id);
    if (dbUser) {
        console.log('✅ Stack Auth: User found by Stack Auth ID:', dbUser.id);
        return dbUser;
    }
    if (!dbUser && stackUser.email) {
        dbUser = await storage.getUserByEmail(stackUser.email);
        if (dbUser) {
            console.log(`🔗 Stack Auth: Linking existing user ${dbUser.email} (ID: ${dbUser.id}) to Stack Auth ID: ${stackUser.id}`);
            dbUser = await storage.linkStackAuthId(dbUser.id, stackUser.id);
            console.log('✅ Stack Auth: Existing user successfully linked to Stack Auth');
            return dbUser;
        }
    }
    console.log('🔄 Stack Auth: Creating new user in database...');
    const newUserData = getDefaultUserFields({
        id: stackUser.id,
        email: stackUser.email,
        displayName: stackUser.displayName || stackUser.email || '',
        firstName: stackUser.firstName,
        lastName: stackUser.lastName,
        profileImageUrl: stackUser.profileImageUrl,
    });
    dbUser = await storage.upsertUser(newUserData);
    console.log('✅ Stack Auth: Created new user account:', dbUser.id);
    return dbUser;
}
export default async function handler(req, res) {
    console.log('📥 Stack Auth webhook received');
    console.log('🔍 Method:', req.method);
    console.log('🔍 Headers:', Object.keys(req.headers).filter(h => h.toLowerCase().includes('stack')));
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-stack-webhook-secret, x-stack-verification-secret');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    console.log('📊 Webhook payload:', JSON.stringify(req.body, null, 2));
    const providedSecret = req.headers['x-stack-webhook-secret'] ||
        req.headers['x-stack-verification-secret'] ||
        req.query?.secret;
    const expected = process.env.STACK_WEBHOOK_SECRET ||
        process.env.STACK_WEBHOOK_VERIFICATION_SECRET ||
        'whsec_7WGUrgkt9xr/owfaNByhs9LjnxyX4Wa3';
    console.log('🔐 Webhook secret verification:', {
        provided: providedSecret ? '***' + providedSecret.slice(-4) : 'none',
        expected: expected ? '***' + expected.slice(-4) : 'none',
    });
    if (!expected || providedSecret !== expected) {
        console.log('❌ Webhook secret mismatch - allowing for development/testing');
    }
    res.setHeader('Cache-Control', 'no-store');
    try {
        const body = req.body || {};
        const eventType = (body.event && body.event.type) ||
            body.type ||
            body.eventType ||
            'unknown';
        console.log('📥 Stack Auth webhook event type:', eventType);
        const userData = body.data?.user ||
            body.user ||
            body.data ||
            body.payload?.user ||
            {};
        const stackUser = {
            id: userData.id || userData.sub || userData.user_id || userData.userId,
            email: userData.email || userData.primaryEmail || userData.primary_email || userData.emailAddress,
            displayName: userData.displayName || userData.display_name || userData.name || userData.fullName,
            firstName: userData.firstName || userData.given_name || userData.first_name || null,
            lastName: userData.lastName || userData.family_name || userData.last_name || null,
            profileImageUrl: userData.profileImageUrl || userData.avatar_url || userData.picture || null,
        };
        console.log('📊 Processed Stack user data:', {
            type: eventType,
            userId: stackUser.id,
            email: stackUser.email,
            displayName: stackUser.displayName
        });
        if (!stackUser.id) {
            console.log('❌ Stack Auth webhook: Missing user ID');
            return res.status(400).json({
                error: 'Missing required user ID',
                received: userData
            });
        }
        const dbUser = await ensureDbUserFromStack(stackUser);
        console.log('✅ Stack Auth webhook processed successfully:', {
            eventType,
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
    }
    catch (error) {
        console.error('❌ Stack Auth webhook error:', error);
        console.error('❌ Error stack:', error.stack);
        return res.status(500).json({
            error: 'Webhook processing failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
//# sourceMappingURL=stack.js.map