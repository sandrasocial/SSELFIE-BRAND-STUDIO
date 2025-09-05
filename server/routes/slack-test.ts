import { Router } from 'express';
import { WebClient } from '@slack/web-api';

const router = Router();
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const channelId = process.env.SLACK_CHANNEL_ID;

// 🧪 Test Slack Integration (admin only)
router.post('/test-slack', async (req, res) => {
  try {
    if (!channelId) {
      return res.status(400).json({ error: 'SLACK_CHANNEL_ID not configured' });
    }

    console.log('🧪 TESTING SLACK INTEGRATION...');

    // Send test message with interactive buttons
    const testMessage = await slack.chat.postMessage({
      channel: channelId,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🧪 Slack Integration Test'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Testing direct Slack agent conversations (NO WEB REDIRECTS)*\n\nClick the buttons below to test direct chat functionality:'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: '👑 Chat with Elena' },
              action_id: 'chat_with_agent',
              value: 'elena',
              style: 'primary'
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: '✨ Chat with Maya' },
              action_id: 'chat_with_agent',
              value: 'maya'
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: '📊 Chat with Victoria' },
              action_id: 'chat_with_agent',
              value: 'victoria'
            }
          ]
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '✅ If buttons work → Direct Slack chat enabled\n❌ If redirected to web → Check webhook configuration'
            }
          ]
        }
      ],
      text: 'Slack integration test'
    });

    console.log('✅ SLACK TEST MESSAGE SENT:', testMessage.ts);

    res.json({
      success: true,
      message: 'Test message sent to Slack with interactive buttons',
      messageId: testMessage.ts,
      channel: channelId,
      instructions: [
        '1. Click the agent buttons in Slack',
        '2. If they start direct conversations → SUCCESS!',
        '3. If they redirect to web → Configure webhook URLs',
        '4. Webhook URLs needed:',
        '   - Events: https://sselfie.ai/api/slack/events',
        '   - Interactivity: https://sselfie.ai/api/slack/interactivity'
      ]
    });

  } catch (error) {
    console.error('❌ SLACK TEST ERROR:', error);
    res.status(500).json({ 
      error: 'Failed to send test message',
      details: error.message,
      troubleshooting: [
        'Check SLACK_BOT_TOKEN is valid',
        'Check SLACK_CHANNEL_ID exists',
        'Verify bot has chat:write permissions',
        'Configure webhook URLs in Slack app settings'
      ]
    });
  }
});

// 📊 Check Slack configuration status
router.get('/slack-status', async (req, res) => {
  try {
    const status = {
      botToken: !!process.env.SLACK_BOT_TOKEN,
      channelId: !!process.env.SLACK_CHANNEL_ID,
      signingSecret: !!process.env.SLACK_SIGNING_SECRET,
      botTokenValid: false,
      channelExists: false,
      webhookUrls: {
        events: 'https://sselfie.ai/api/slack/events',
        interactivity: 'https://sselfie.ai/api/slack/interactivity'
      }
    };

    // Test bot token validity
    if (process.env.SLACK_BOT_TOKEN) {
      try {
        const authTest = await slack.auth.test();
        status.botTokenValid = !!authTest.ok;
      } catch (error) {
        console.warn('Invalid bot token:', error.message);
      }
    }

    // Test channel access
    if (channelId && status.botTokenValid) {
      try {
        const channelInfo = await slack.conversations.info({ channel: channelId });
        status.channelExists = !!channelInfo.ok;
      } catch (error) {
        console.warn('Channel access failed:', error.message);
      }
    }

    res.json({
      status,
      ready: status.botToken && status.channelId && status.botTokenValid && status.channelExists,
      nextSteps: status.botToken && status.channelId && status.botTokenValid && status.channelExists ? [
        'Configuration complete!',
        'Use /api/slack/test-slack to test interactive buttons'
      ] : [
        'Configure Slack app webhook URLs:',
        '1. Events: https://sselfie.ai/api/slack/events',
        '2. Interactivity: https://sselfie.ai/api/slack/interactivity',
        '3. Install app to workspace',
        '4. Test with /api/slack/test-slack'
      ]
    });

  } catch (error) {
    console.error('❌ SLACK STATUS ERROR:', error);
    res.status(500).json({ error: 'Failed to check Slack status' });
  }
});

export default router;