import { WebClient } from '@slack/web-api';
export class SlackNotificationService {
    static client = null;
    static channelId;
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
    static async sendAgentInsight(agentName, insightType, title, message, priority = 'medium') {
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
                text: `${agentName}: ${title}`
            });
            console.log(`✅ SLACK: Sent ${insightType} insight from ${agentName}`);
            return true;
        }
        catch (error) {
            console.error('❌ SLACK: Failed to send notification:', error);
            return false;
        }
    }
    static async sendUrgentRequest(agentName, requestType, context) {
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
        }
        catch (error) {
            console.error('❌ SLACK: Failed to send urgent request:', error);
            return false;
        }
    }
    static getAgentEmoji(agentName) {
        const emojiMap = {
            'elena': '👑',
            'aria': '🎨',
            'zara': '⚡',
            'maya': '✨',
            'victoria': '📊',
            'rachel': '✍️',
            'ava': '📧',
            'quinn': '🔍',
            'sophia': '📱',
            'martha': '📈',
            'diana': '📋',
            'wilma': '⚙️',
            'olga': '🗂️',
            'flux': '🎯'
        };
        return emojiMap[agentName.toLowerCase()] || '🤖';
    }
    static getInsightTypeEmoji(type) {
        const typeMap = {
            'strategic': '🧠',
            'technical': '⚡',
            'operational': '⚙️',
            'urgent': '🚨'
        };
        return typeMap[type] || '💡';
    }
    static async testConnection() {
        if (!this.client) {
            return false;
        }
        try {
            await this.client.auth.test();
            console.log('✅ SLACK: Connection test successful');
            return true;
        }
        catch (error) {
            console.error('❌ SLACK: Connection test failed:', error);
            return false;
        }
    }
}
SlackNotificationService.initialize();
//# sourceMappingURL=slack-notification-service.js.map