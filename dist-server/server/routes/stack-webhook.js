import { storage } from "../storage.js";
export function setupStackWebhook(app) {
    console.log('🔧 Setting up Stack Auth webhook...');
    app.post('/api/webhooks/stack', async (req, res) => {
        try {
            console.log('📥 Stack Auth webhook received:', req.body?.event_type);
            const event = req.body;
            const eventType = event.event_type;
            const userData = event.data;
            console.log('📊 Webhook event details:', {
                type: eventType,
                userId: userData?.id,
                email: userData?.primary_email
            });
            switch (eventType) {
                case 'user.created':
                case 'user.updated':
                    await handleUserUpsert(userData);
                    break;
                case 'user.deleted':
                    await handleUserDeletion(userData);
                    break;
                default:
                    console.log(`⚠️ Unhandled Stack Auth event type: ${eventType}`);
            }
            res.status(200).json({ success: true, processed: eventType });
        }
        catch (error) {
            console.error('❌ Stack Auth webhook error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to process webhook'
            });
        }
    });
    console.log('✅ Stack Auth webhook handler setup complete at /api/webhooks/stack');
}
async function handleUserUpsert(stackUser) {
    try {
        console.log('🔄 Processing user upsert for:', stackUser.id);
        const userData = {
            id: stackUser.id,
            email: stackUser.primary_email || stackUser.email,
            firstName: stackUser.display_name?.split(' ')[0] ||
                stackUser.given_name ||
                stackUser.primary_email?.split('@')[0] || '',
            lastName: stackUser.display_name?.split(' ').slice(1).join(' ') ||
                stackUser.family_name || '',
            displayName: stackUser.display_name || stackUser.primary_email || '',
            profileImageUrl: stackUser.profile_image_url || stackUser.picture,
            lastLoginAt: new Date(),
            plan: "sselfie-studio",
            role: stackUser.primary_email === 'sandra@sselfie.ai' ? 'admin' : 'user',
            monthlyGenerationLimit: stackUser.primary_email === 'sandra@sselfie.ai' ? -1 : 100,
            mayaAiAccess: true,
            victoriaAiAccess: false,
            preferredOnboardingMode: "conversational",
            onboardingProgress: JSON.stringify({}),
        };
        const user = await storage.upsertUser(userData);
        console.log('✅ User synced successfully:', {
            id: user.id,
            email: user.email,
            plan: user.plan
        });
        return user;
    }
    catch (error) {
        console.error('❌ Failed to upsert user from Stack Auth:', error);
        throw error;
    }
}
async function handleUserDeletion(stackUser) {
    try {
        console.log('🗑️ Processing user deletion for:', stackUser.id);
        console.log('⚠️ User deletion received - implement based on business requirements');
    }
    catch (error) {
        console.error('❌ Failed to process user deletion:', error);
        throw error;
    }
}
//# sourceMappingURL=stack-webhook.js.map