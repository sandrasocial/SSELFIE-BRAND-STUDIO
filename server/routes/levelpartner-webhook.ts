import { Router } from 'express';
import { optionalStackAuth } from '../stack-auth';

const router = Router();

interface LevelPartnerSignupRequest {
  name: string;
  email: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

interface LevelPartnerApiPayload {
  name: string;
  email: string;
  source: string;
  campaign_data: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    referrer_url?: string;
    landing_page?: string;
    signup_timestamp: string;
  };
}

/**
 * LevelPartner Webhook Endpoint
 * Handles signups from Hair Experience landing page and sends data to LevelPartner
 * Tracks UTM parameters for campaign attribution
 */
router.post('/levelpartner-signup', optionalStackAuth, async (req, res) => {
  try {
    const { name, email, source = 'hair-landing' }: LevelPartnerSignupRequest = req.body;
    
    // Extract UTM parameters from query string and body
    const utm_source = req.query.utm_source as string || req.body.utm_source || 'organic';
    const utm_medium = req.query.utm_medium as string || req.body.utm_medium || 'direct';
    const utm_campaign = req.query.utm_campaign as string || req.body.utm_campaign || 'hair-experience';
    const utm_term = req.query.utm_term as string || req.body.utm_term;
    const utm_content = req.query.utm_content as string || req.body.utm_content;
    
    console.log('🎯 LevelPartner signup received:', {
      name,
      email,
      source,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content
    });

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        error: 'Name and email are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Prepare payload for LevelPartner API
    const levelPartnerPayload: LevelPartnerApiPayload = {
      name,
      email,
      source,
      campaign_data: {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        referrer_url: req.headers.referer || req.headers.referrer as string,
        landing_page: source === 'hair-landing' ? '/hair' : '/business',
        signup_timestamp: new Date().toISOString()
      }
    };

    console.log('📤 Sending to LevelPartner:', levelPartnerPayload);

    // Send to LevelPartner API
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
      
      // Try to get error details
      let errorDetails = 'Unknown error';
      try {
        const errorResponse = await levelPartnerResponse.json();
        errorDetails = errorResponse.message || errorResponse.error || errorDetails;
      } catch (parseError) {
        errorDetails = levelPartnerResponse.statusText;
      }

      // Still return success to user but log the error
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

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Hair Experience signup successful',
      levelpartner_status: 'success',
      campaign_data: {
        utm_source,
        utm_medium,
        utm_campaign,
        source
      }
    });

  } catch (error) {
    console.error('💥 LevelPartner webhook error:', error);
    
    // Return error but don't break user experience
    res.status(500).json({ 
      error: 'Signup processing failed',
      code: 'INTERNAL_ERROR',
      message: 'Please try again or contact support if the issue persists'
    });
  }
});

/**
 * Health check endpoint for LevelPartner webhook
 */
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
  } catch (error) {
    console.error('LevelPartner status check error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Status check failed'
    });
  }
});

/**
 * UTM Parameter Testing Endpoint (development only)
 */
if (process.env.NODE_ENV !== 'production') {
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