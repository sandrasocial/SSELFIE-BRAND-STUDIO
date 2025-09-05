import { WebClient } from '@slack/web-api';

// Slack notification service for agent-to-admin communication
export class SlackNotificationService {
  private static client: WebClient | null = null;
  private static channelId: string;

  static initialize() {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.warn('⚠️ SLACK: SLACK_BOT_TOKEN not found - notifications disabled');
      return false;
    }
    
    if (!process.env.SLACK_CHANNEL_ID) {
      console.warn('⚠️ SLACK: SLACK_CHANNEL_ID not found - notifications disabled');
      return false;
    }

    this.client = new WebClient(process.env.SLACK_BOT_TOKEN);
    this.channelId = process.env.SLACK_CHANNEL_ID;
    
    console.log('✅ SLACK: Agent notification service initialized');
    return true;
  }

  // Send agent insight notification to Sandra
  static async sendAgentInsight(
    agentName: string,
    insightType: 'strategic' | 'technical' | 'operational' | 'urgent',
    title: string,
    message: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<boolean> {
    if (!this.client) {
      console.log('📧 SLACK: Service not initialized, logging insight locally');
      console.log(`🤖 ${agentName}: [${insightType.toUpperCase()}] ${title} - ${message}`);
      return false;
    }

    try {
      const emoji = this.getAgentEmoji(agentName);
      const priorityEmoji = priority === 'high' ? '🔥' : priority === 'medium' ? '💡' : '📝';
      const typeEmoji = this.getInsightTypeEmoji(insightType);

      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} ${agentName} - ${typeEmoji} ${insightType.toUpperCase()} INSIGHT`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${priorityEmoji} ${title}*\n\n${message}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Priority: ${priority.toUpperCase()} | Agent: ${agentName} | Time: ${new Date().toLocaleString()}`
            }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: `Chat with ${agentName}`
              },
              url: `https://sselfie.ai/admin-consulting-agents?agent=${agentName.toLowerCase()}`,
              style: 'primary'
            }
          ]
        }
      ];

      await this.client.chat.postMessage({
        channel: this.channelId,
        blocks,
        text: `${agentName}: ${title}` // Fallback text for notifications
      });

      console.log(`✅ SLACK: Sent ${insightType} insight from ${agentName}`);
      return true;

    } catch (error) {
      console.error('❌ SLACK: Failed to send notification:', error);
      return false;
    }
  }

  // Quick notification for urgent agent requests
  static async sendUrgentRequest(
    agentName: string,
    requestType: string,
    context: string
  ): Promise<boolean> {
    if (!this.client) {
      console.log(`🚨 URGENT: ${agentName} - ${requestType}: ${context}`);
      return false;
    }

    try {
      const emoji = this.getAgentEmoji(agentName);
      
      await this.client.chat.postMessage({
        channel: this.channelId,
        text: `🚨 *URGENT REQUEST*`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `🚨 ${emoji} ${agentName} - URGENT REQUEST`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Request Type:* ${requestType}\n\n*Context:* ${context}\n\n*Action Required:* Immediate attention needed`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: `Respond to ${agentName}`
                },
                url: `https://sselfie.ai/admin-consulting-agents?agent=${agentName.toLowerCase()}`,
                style: 'danger'
              }
            ]
          }
        ]
      });

      console.log(`🚨 SLACK: Sent urgent request from ${agentName}`);
      return true;

    } catch (error) {
      console.error('❌ SLACK: Failed to send urgent request:', error);
      return false;
    }
  }

  // Get agent-specific emoji
  private static getAgentEmoji(agentName: string): string {
    const emojiMap: Record<string, string> = {
      'elena': '👑',     // Strategic Leader
      'aria': '🎨',      // Designer
      'zara': '⚡',      // Technical
      'maya': '✨',      // AI Stylist
      'victoria': '📊',  // UX Strategist
      'rachel': '✍️',    // Copywriter
      'ava': '🤖',       // Automation
      'quinn': '🔍',     // QA
      'sophia': '📱',    // Social Media
      'martha': '📈',    // Marketing
      'diana': '📋',     // Coordinator
      'wilma': '⚙️',     // Workflow
      'olga': '🗂️',      // Organization
      'flux': '🎯'       // Image Generation
    };
    return emojiMap[agentName.toLowerCase()] || '🤖';
  }

  // Get insight type emoji
  private static getInsightTypeEmoji(type: string): string {
    const typeMap: Record<string, string> = {
      'strategic': '🧠',
      'technical': '⚡',
      'operational': '⚙️',
      'urgent': '🚨'
    };
    return typeMap[type] || '💡';
  }

  // Test connection
  static async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.auth.test();
      console.log('✅ SLACK: Connection test successful');
      return true;
    } catch (error) {
      console.error('❌ SLACK: Connection test failed:', error);
      return false;
    }
  }
}

// Initialize service on import
SlackNotificationService.initialize();