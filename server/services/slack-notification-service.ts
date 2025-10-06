// 🔔 Slack Notification Service for SSELFIE Studio
// Handles agent insights and system notifications via Slack

export class SlackNotificationService {
  private static webhookUrl: string | null = null;

  // Initialize with Slack webhook URL from environment
  static initialize(): void {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || null;
  }

  // Send agent insight notification to Slack
  static async sendAgentInsight(
    agentName: string,
    insightType: 'operational' | 'strategic' | 'alert' | 'success',
    title: string,
    message: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<boolean> {
    try {
      if (!this.webhookUrl) {
        console.log(`📱 Slack notification skipped (no webhook configured): ${title}`);
        return false;
      }

      // Format agent name
      const agentEmoji = this.getAgentEmoji(agentName);
      const priorityEmoji = this.getPriorityEmoji(priority);
      const typeEmoji = this.getTypeEmoji(insightType);

      // Create Slack message payload
      const payload = {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${agentEmoji} ${title}`,
              emoji: true
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${typeEmoji} *${insightType.toUpperCase()}* | ${priorityEmoji} *${priority.toUpperCase()} PRIORITY*\n\n${message}`
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `🤖 Agent: ${agentName} | 📅 ${new Date().toISOString()}`
              }
            ]
          }
        ]
      };

      // Send to Slack
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error(`❌ Slack notification failed: ${response.status} ${response.statusText}`);
        return false;
      }

      console.log(`✅ Slack notification sent: ${title}`);
      return true;

    } catch (error) {
      console.error('❌ Slack notification error:', error);
      return false;
    }
  }

  // Send system alert notification
  static async sendSystemAlert(
    title: string,
    message: string,
    severity: 'critical' | 'warning' | 'info' = 'info'
  ): Promise<boolean> {
    try {
      if (!this.webhookUrl) {
        console.log(`📱 System alert skipped (no webhook configured): ${title}`);
        return false;
      }

      const severityEmoji = this.getSeverityEmoji(severity);

      const payload = {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${severityEmoji} SYSTEM ALERT: ${title}`,
              emoji: true
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Severity:* ${severity.toUpperCase()}\n\n${message}`
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `🖥️ System | 📅 ${new Date().toISOString()}`
              }
            ]
          }
        ]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error(`❌ System alert failed: ${response.status} ${response.statusText}`);
        return false;
      }

      console.log(`✅ System alert sent: ${title}`);
      return true;

    } catch (error) {
      console.error('❌ System alert error:', error);
      return false;
    }
  }

  // Helper methods for emojis
  private static getAgentEmoji(agentName: string): string {
    const emojiMap: Record<string, string> = {
      'maya': '🎨',
      'ava': '📧',
      'victoria': '📸',
      'sandra': '👩‍💼',
      'system': '🖥️',
      'default': '🤖'
    };
    return emojiMap[agentName.toLowerCase()] || emojiMap.default;
  }

  private static getPriorityEmoji(priority: string): string {
    const emojiMap: Record<string, string> = {
      'high': '🔴',
      'medium': '🟡',
      'low': '🟢'
    };
    return emojiMap[priority] || '⚪';
  }

  private static getTypeEmoji(insightType: string): string {
    const emojiMap: Record<string, string> = {
      'operational': '⚙️',
      'strategic': '🎯',
      'alert': '🚨',
      'success': '✅'
    };
    return emojiMap[insightType] || '💡';
  }

  private static getSeverityEmoji(severity: string): string {
    const emojiMap: Record<string, string> = {
      'critical': '🚨',
      'warning': '⚠️',
      'info': 'ℹ️'
    };
    return emojiMap[severity] || '📢';
  }
}

// Initialize on module load
SlackNotificationService.initialize();