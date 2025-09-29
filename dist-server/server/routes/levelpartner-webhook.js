import { Router } from 'express';
import { optionalStackAuth } from '../stack-auth.js';
import { db } from '../db.js';
import { liveSessions, liveEvents } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
const router = Router();
router.post('/levelpartner-signup', optionalStackAuth, async (req, res) => {
    try {
        const { name, email, source = 'hair-landing', sessionId } = req.body;
        const utm_source = req.query.utm_source || req.body.utm_source || 'organic';
        const utm_medium = req.query.utm_medium || req.body.utm_medium || 'direct';
        const utm_campaign = req.query.utm_campaign || req.body.utm_campaign || 'hair-experience';
        const utm_term = req.query.utm_term || req.body.utm_term;
        const utm_content = req.query.utm_content || req.body.utm_content;
        console.log('🎯 LevelPartner signup received:', {
            name,
            email,
            source,
            sessionId,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_term,
            utm_content
        });
        let sessionData = null;
        if (sessionId) {
            try {
                const sessionResult = await db
                    .select()
                    .from(liveSessions)
                    .where(eq(liveSessions.id, sessionId))
                    .limit(1);
                if (sessionResult.length > 0) {
                    sessionData = sessionResult[0];
                    console.log('📊 Stage Mode session found:', {
                        id: sessionData.id,
                        title: sessionData.title,
                        createdAt: sessionData.createdAt
                    });
                }
            }
            catch (error) {
                console.warn('⚠️ Failed to fetch session data:', error.message);
            }
        }
        if (!name || !email) {
            return res.status(400).json({
                error: 'Name and email are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format',
                code: 'INVALID_EMAIL'
            });
        }
        const levelPartnerPayload = {
            name,
            email,
            source,
            campaign_data: {
                utm_source,
                utm_medium,
                utm_campaign,
                utm_term,
                utm_content,
                referrer_url: req.headers.referer || req.headers.referrer,
                landing_page: source === 'hair-landing' ? '/hair' : '/business',
                signup_timestamp: new Date().toISOString(),
                ...(sessionData && {
                    stage_mode: {
                        session_id: sessionData.id,
                        session_title: sessionData.title,
                        engagement_type: utm_source === 'stage' ? 'live_session' : 'hair_experience'
                    }
                })
            }
        };
        console.log('📤 Sending to LevelPartner:', levelPartnerPayload);
        const levelPartnerResponse = await fetch(process.env.LEVELPARTNER_API_URL || 'https://api.levelpartner.com/v1/subscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LEVELPARTNER_API_KEY}`,
                'User-Agent': 'SSELFIE-Studio/1.0'
            },
            body: JSON.stringify(levelPartnerPayload)
        });
        if (!levelPartnerResponse.ok) {
            console.error('❌ LevelPartner API error:', {
                status: levelPartnerResponse.status,
                statusText: levelPartnerResponse.statusText
            });
            let errorDetails = 'Unknown error';
            try {
                const errorResponse = await levelPartnerResponse.json();
                errorDetails = errorResponse.message || errorResponse.error || errorDetails;
            }
            catch (parseError) {
                errorDetails = levelPartnerResponse.statusText;
            }
            console.error('⚠️ LevelPartner integration failed, but proceeding with signup:', errorDetails);
            return res.status(200).json({
                success: true,
                message: 'Signup received successfully',
                levelpartner_status: 'failed',
                levelpartner_error: errorDetails
            });
        }
        const levelPartnerResult = await levelPartnerResponse.json();
        console.log('✅ LevelPartner success:', levelPartnerResult);
        if (sessionId) {
            try {
                await db.insert(liveEvents).values({
                    sessionId,
                    eventType: 'signup_success',
                    meta: {
                        name,
                        email,
                        levelpartner_response: levelPartnerResult,
                        signup_source: source
                    },
                    utmSource: utm_source,
                    utmCampaign: utm_campaign,
                    utmMedium: utm_medium,
                    utmContent: utm_content,
                    utmTerm: utm_term,
                    userAgent: req.headers['user-agent'],
                    ipAddress: req.ip || req.connection.remoteAddress,
                });
                console.log('📊 Signup success event tracked for session:', sessionId);
            }
            catch (error) {
                console.warn('⚠️ Failed to track signup success event:', error.message);
            }
        }
        res.status(200).json({
            success: true,
            message: 'Hair Experience signup successful',
            levelpartner_status: 'success',
            campaign_data: {
                utm_source,
                utm_medium,
                utm_campaign,
                source,
                ...(sessionData && {
                    stage_mode: {
                        session_id: sessionData.id,
                        session_title: sessionData.title
                    }
                })
            }
        });
    }
    catch (error) {
        console.error('💥 LevelPartner webhook error:', error);
        res.status(500).json({
            error: 'Signup processing failed',
            code: 'INTERNAL_ERROR',
            message: 'Please try again or contact support if the issue persists'
        });
    }
});
router.get('/levelpartner-status', async (req, res) => {
    try {
        const hasApiKey = !!process.env.LEVELPARTNER_API_KEY;
        const hasApiUrl = !!process.env.LEVELPARTNER_API_URL;
        res.json({
            status: 'operational',
            timestamp: new Date().toISOString(),
            configuration: {
                api_key_configured: hasApiKey,
                api_url_configured: hasApiUrl,
                default_campaign: 'hair-experience'
            }
        });
    }
    catch (error) {
        console.error('LevelPartner status check error:', error);
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Status check failed'
        });
    }
});
if (process.env['NODE_ENV'] !== 'production') {
    router.get('/levelpartner-test-utm', (req, res) => {
        res.json({
            message: 'UTM Parameter Test Endpoint',
            query_params: req.query,
            headers: {
                referer: req.headers.referer || req.headers.referrer,
                user_agent: req.headers['user-agent']
            },
            timestamp: new Date().toISOString()
        });
    });
}
export default router;
//# sourceMappingURL=levelpartner-webhook.js.map