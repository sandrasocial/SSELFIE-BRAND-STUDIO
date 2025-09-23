import { SlackNotificationService } from './slack-notification-service';
export class InstagramIntegration {
    baseUrl = 'https://graph.facebook.com/v18.0';
    manyChatBaseUrl = 'https://api.manychat.com/fb';
    constructor() {
        if (!process.env.INSTAGRAM_ACCESS_TOKEN || !process.env.META_APP_ID) {
            console.warn('⚠️ Instagram credentials not configured. Instagram DM processing will be limited.');
        }
        if (!process.env.MANYCHAT_API_TOKEN) {
            console.warn('⚠️ ManyChat credentials not configured. ManyChat processing will be limited.');
        }
    }
    // 📱 Fetch Instagram DMs via Instagram Basic Display API
    async fetchInstagramMessages(limit = 50) {
        if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
            throw new Error('Instagram access token not configured');
        }
        try {
            // Note: Instagram Basic Display API has limited DM access
            // For production, you'd need Instagram Business API with proper permissions
            console.log('📱 Fetching Instagram messages...');
            // This is a simplified implementation - actual Instagram Business API would be more complex
            const response = await fetch(`${this.baseUrl}/me/conversations?access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Instagram API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log(`📱 Instagram: Found ${data.data?.length || 0} conversations`);
            return data.data || [];
        }
        catch (error) {
            console.error('❌ Instagram API error:', error);
            return [];
        }
    }
    // 🤖 Fetch ManyChat conversations
    async fetchManyChatMessages(limit = 100) {
        if (!process.env.MANYCHAT_API_TOKEN) {
            throw new Error('ManyChat API token not configured');
        }
        try {
            console.log('🤖 Fetching ManyChat messages...');
            const response = await fetch(`${this.manyChatBaseUrl}/subscriber/getSubscribers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.MANYCHAT_API_TOKEN}`
                },
                body: JSON.stringify({
                    page_size: limit,
                    page_token: null
                })
            });
            if (!response.ok) {
                throw new Error(`ManyChat API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log(`🤖 ManyChat: Found ${data.data?.length || 0} subscribers`);
            // Fetch recent messages for each subscriber
            const messages = [];
            if (data.data) {
                for (const subscriber of data.data.slice(0, 10)) { // Limit to avoid rate limits
                    try {
                        const messagesResponse = await this.fetchSubscriberMessages(subscriber.id);
                        messages.push(...messagesResponse);
                    }
                    catch (error) {
                        console.error(`Failed to fetch messages for subscriber ${subscriber.id}:`, error);
                    }
                }
            }
            return messages;
        }
        catch (error) {
            console.error('❌ ManyChat API error:', error);
            return [];
        }
    }
    // 📨 Fetch messages for specific ManyChat subscriber
    async fetchSubscriberMessages(subscriberId) {
        try {
            const response = await fetch(`${this.manyChatBaseUrl}/subscriber/getMessages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.MANYCHAT_API_TOKEN}`
                },
                body: JSON.stringify({
                    subscriber_id: subscriberId,
                    count: 10 // Last 10 messages per subscriber
                })
            });
            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            return data.data || [];
        }
        catch (error) {
            console.error(`❌ Failed to fetch messages for subscriber ${subscriberId}:`, error);
            return [];
        }
    }
    // 🧠 Process and categorize Instagram messages with AI
    async processInstagramMessages(userId) {
        try {
            console.log('🧠 Starting Instagram message processing for user:', userId);
            // Fetch messages from both platforms
            const [instagramMessages, manyChatMessages] = await Promise.all([
                this.fetchInstagramMessages(50),
                this.fetchManyChatMessages(100)
            ]);
            const allMessages = [];
            // Process Instagram messages
            for (const msg of instagramMessages) {
                const processed = await this.categorizeInstagramMessage(msg, 'instagram');
                allMessages.push(processed);
            }
            // Process ManyChat messages
            for (const msg of manyChatMessages) {
                const processed = await this.categorizeManyChatMessage(msg);
                allMessages.push(processed);
            }
            // Generate insights
            await this.generateInstagramInsights(allMessages, userId);
            console.log(`🧠 Processed ${allMessages.length} Instagram/ManyChat messages`);
            return allMessages;
        }
        catch (error) {
            console.error('❌ Instagram message processing error:', error);
            return [];
        }
    }
    // 🏷️ Categorize Instagram message
    async categorizeInstagramMessage(message, platform) {
        const messageText = message.message || '';
        const fromUsername = message.from?.username || 'unknown';
        return {
            id: message.id,
            platform,
            fromUsername,
            fromId: message.from?.id || '',
            message: messageText,
            messageType: this.detectMessageType(message),
            receivedAt: new Date(message.created_time),
            category: this.categorizeInstagramContent(messageText, fromUsername),
            priority: this.determinePriority(messageText, fromUsername),
            sentiment: this.analyzeSentiment(messageText),
            needsResponse: this.needsResponse(messageText),
            isBusinessOpportunity: this.isBusinessOpportunity(messageText),
            tags: this.generateTags(messageText, platform),
            aiSummary: messageText.length > 100 ? `${messageText.substring(0, 100)}...` : messageText,
            suggestedResponse: this.generateSuggestedResponse(messageText, 'instagram')
        };
    }
    // 🏷️ Categorize ManyChat message
    async categorizeManyChatMessage(message) {
        const messageText = message.content || '';
        return {
            id: message.id,
            platform: 'manychat',
            fromUsername: message.subscriber_id,
            fromId: message.subscriber_id,
            message: messageText,
            messageType: message.type || 'text',
            receivedAt: new Date(message.sent_at),
            category: this.categorizeInstagramContent(messageText, message.subscriber_id),
            priority: this.determinePriority(messageText, message.subscriber_id),
            sentiment: this.analyzeSentiment(messageText),
            needsResponse: message.direction === 'incoming' && this.needsResponse(messageText),
            isBusinessOpportunity: this.isBusinessOpportunity(messageText),
            tags: this.generateTags(messageText, 'manychat'),
            aiSummary: messageText.length > 100 ? `${messageText.substring(0, 100)}...` : messageText,
            suggestedResponse: message.direction === 'incoming' ? this.generateSuggestedResponse(messageText, 'manychat') : undefined
        };
    }
    // 🎯 Categorization logic for Instagram content
    categorizeInstagramContent(message, username) {
        const lowerMessage = message.toLowerCase();
        // Customer inquiry keywords
        if (this.containsKeywords(lowerMessage, ['price', 'cost', 'buy', 'purchase', 'order', 'available', 'question', 'help', 'support'])) {
            return 'customer_inquiry';
        }
        // Collaboration keywords
        if (this.containsKeywords(lowerMessage, ['collab', 'collaboration', 'partnership', 'sponsor', 'brand', 'pr', 'influencer'])) {
            return 'collaboration';
        }
        // Urgent keywords
        if (this.containsKeywords(lowerMessage, ['urgent', 'asap', 'important', 'emergency', 'deadline'])) {
            return 'urgent';
        }
        // Spam detection
        if (this.containsKeywords(lowerMessage, ['follow back', 'follow for follow', 'like for like', 'free money', 'click here'])) {
            return 'spam';
        }
        return 'general';
    }
    // 🔥 Priority determination
    determinePriority(message, username) {
        const lowerMessage = message.toLowerCase();
        // High priority conditions
        if (this.containsKeywords(lowerMessage, ['urgent', 'asap', 'important', 'buy', 'purchase', 'collaboration', 'sponsor'])) {
            return 'high';
        }
        // Medium priority for questions and inquiries
        if (this.containsKeywords(lowerMessage, ['?', 'question', 'help', 'how', 'when', 'what', 'price', 'available'])) {
            return 'medium';
        }
        return 'low';
    }
    // 💭 Sentiment analysis
    analyzeSentiment(message) {
        const lowerMessage = message.toLowerCase();
        const positiveWords = ['love', 'amazing', 'great', 'awesome', 'beautiful', 'perfect', 'thanks', 'thank you'];
        const negativeWords = ['hate', 'terrible', 'awful', 'bad', 'worst', 'disappointed', 'angry', 'mad'];
        const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
        if (negativeCount > positiveCount)
            return 'negative';
        if (positiveCount > negativeCount)
            return 'positive';
        return 'neutral';
    }
    // ❓ Determine if message needs response
    needsResponse(message) {
        const lowerMessage = message.toLowerCase();
        return this.containsKeywords(lowerMessage, ['?', 'question', 'help', 'how', 'when', 'what', 'where', 'why', 'price', 'available', 'can you']);
    }
    // 💼 Detect business opportunities
    isBusinessOpportunity(message) {
        const lowerMessage = message.toLowerCase();
        return this.containsKeywords(lowerMessage, ['buy', 'purchase', 'order', 'collab', 'collaboration', 'sponsor', 'partnership', 'brand', 'price', 'cost']);
    }
    // 🏷️ Generate message tags
    generateTags(message, platform) {
        const tags = [platform];
        const lowerMessage = message.toLowerCase();
        if (this.containsKeywords(lowerMessage, ['buy', 'purchase', 'order']))
            tags.push('sales');
        if (this.containsKeywords(lowerMessage, ['collab', 'collaboration']))
            tags.push('collaboration');
        if (this.containsKeywords(lowerMessage, ['question', 'help']))
            tags.push('support');
        if (this.containsKeywords(lowerMessage, ['photo', 'picture', 'image']))
            tags.push('content');
        if (message.includes('?'))
            tags.push('question');
        return tags;
    }
    // 💬 Generate suggested response
    generateSuggestedResponse(message, platform) {
        const lowerMessage = message.toLowerCase();
        if (this.containsKeywords(lowerMessage, ['price', 'cost'])) {
            return "Thanks for your interest! I'll send you the pricing details right away. 💕";
        }
        if (this.containsKeywords(lowerMessage, ['collab', 'collaboration'])) {
            return "Hi! Thank you for reaching out about collaboration. I'd love to learn more about your brand! 🤝";
        }
        if (this.containsKeywords(lowerMessage, ['love', 'amazing', 'beautiful'])) {
            return "Thank you so much! That means the world to me! 🥰✨";
        }
        return "Thanks for your message! I'll get back to you soon 💕";
    }
    // 🔍 Helper method to check for keywords
    containsKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }
    // 📊 Detect message type
    detectMessageType(message) {
        if (message.attachments?.some(att => att.type === 'image'))
            return 'image';
        if (message.attachments?.some(att => att.type === 'video'))
            return 'video';
        return 'text';
    }
    // 💡 Generate insights for Slack
    async generateInstagramInsights(messages, userId) {
        const customerInquiries = messages.filter(m => m.category === 'customer_inquiry');
        const businessOpportunities = messages.filter(m => m.isBusinessOpportunity);
        const urgentMessages = messages.filter(m => m.priority === 'high');
        const needResponse = messages.filter(m => m.needsResponse);
        let insightMessage = `📱 **Instagram DM Processing Complete**\n\n`;
        insightMessage += `📊 **Overview:**\n`;
        insightMessage += `• Processed ${messages.length} Instagram messages\n`;
        insightMessage += `• ${customerInquiries.length} customer inquiries\n`;
        insightMessage += `• ${businessOpportunities.length} business opportunities\n`;
        insightMessage += `• ${urgentMessages.length} urgent messages\n`;
        insightMessage += `• ${needResponse.length} messages need responses\n\n`;
        if (urgentMessages.length > 0) {
            insightMessage += `🔥 **Urgent Messages:**\n`;
            urgentMessages.slice(0, 3).forEach(msg => {
                insightMessage += `• @${msg.fromUsername}: ${msg.aiSummary}\n`;
            });
            insightMessage += `\n`;
        }
        if (businessOpportunities.length > 0) {
            insightMessage += `💼 **Business Opportunities:**\n`;
            businessOpportunities.slice(0, 3).forEach(msg => {
                insightMessage += `• @${msg.fromUsername}: ${msg.aiSummary}\n`;
            });
            insightMessage += `\n`;
        }
        insightMessage += `💡 **Next Steps:**\n`;
        insightMessage += `• Respond to urgent messages first\n`;
        insightMessage += `• Follow up on business opportunities\n`;
        insightMessage += `• Use suggested responses for efficiency\n`;
        await SlackNotificationService.sendAgentInsight('ava', 'strategic', 'Instagram DM Analysis Complete', insightMessage, urgentMessages.length > 0 ? 'high' : 'medium');
    }
    // 📱 Get processed messages for user (for dashboard)
    async getProcessedMessages(userId) {
        try {
            // In a real implementation, this would fetch from database
            // For now, return empty array to prevent errors
            console.log(`📱 Getting processed Instagram messages for user ${userId}`);
            return [];
        }
        catch (error) {
            console.error('❌ Error getting processed messages:', error);
            return [];
        }
    }
    // 💬 Get ManyChat messages for user (for dashboard)
    async getManyChatMessages(userId) {
        try {
            // In a real implementation, this would fetch from database
            // For now, return empty array to prevent errors
            console.log(`💬 Getting ManyChat messages for user ${userId}`);
            return [];
        }
        catch (error) {
            console.error('❌ Error getting ManyChat messages:', error);
            return [];
        }
    }
}
export const instagramIntegration = new InstagramIntegration();
