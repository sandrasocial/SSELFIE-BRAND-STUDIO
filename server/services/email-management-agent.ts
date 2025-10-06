import { SlackNotificationService } from './slack-notification-service.js';
import { storage } from '../storage.js';
import { AgentInsightEngine } from './agent-insight-engine.js';

interface EmailAccount {
  id: string;
  type: 'personal' | 'business';
  email: string;
  provider: 'gmail' | 'outlook' | 'other';
  accessToken?: string;
  refreshToken?: string;
  lastSyncAt?: Date;
}

interface RawEmailMessage {
  id: string;
  accountId?: string;
  from: string;
  to: string | string[];
  subject: string;
  body: string;
  receivedAt: string | Date;
  [key: string]: unknown; // Allow additional properties from different email providers
}

interface EmailMessage {
  id: string;
  accountId: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  receivedAt: Date;
  isRead: boolean;
  category: 'urgent' | 'customer' | 'business' | 'personal' | 'marketing' | 'spam';
  priority: 'high' | 'medium' | 'low';
  needsResponse: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
  aiSummary?: string;
  suggestedResponse?: string;
}

interface EmailInsight {
  type: 'unread_summary' | 'urgent_attention' | 'customer_opportunity' | 'trend_analysis';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionItems: string[];
  emailIds: string[];
}

// 🤖 AVA - Your Intelligent Email Management Agent
export class EmailManagementAgent {
  private static instance: EmailManagementAgent;
  private isProcessing = false;
  private accounts: Map<string, EmailAccount> = new Map();

  static getInstance(): EmailManagementAgent {
    if (!this.instance) {
      this.instance = new EmailManagementAgent();
    }
    return this.instance;
  }

  // 📧 Get user email accounts (for dashboard)
  async getUserEmailAccounts(userId: string): Promise<any[]> {
    try {
      // In a real implementation, this would fetch from database
      // For now, return empty array to prevent errors
      return [];
    } catch (error) {
      console.error('❌ Error getting user email accounts:', error);
      return [];
    }
  }

  // 📊 Get recent email insights (for dashboard)
  async getRecentEmailInsights(userId: string): Promise<any[]> {
    try {
      // In a real implementation, this would fetch from database
      // For now, return empty array to prevent errors
      return [];
    } catch (error) {
      console.error('❌ Error getting recent email insights:', error);
      return [];
    }
  }

  // 📧 Initialize with both personal and business accounts
  async addEmailAccount(userId: string, account: EmailAccount): Promise<boolean> {
    try {

      // Store account configuration
      this.accounts.set(account.id, account);

      // Save to agent context for persistence
      await this.saveAccountContext(userId, account);

      // Send Slack notification
      await SlackNotificationService.sendAgentInsight(
        'ava',
        'operational',
        'New Email Account Connected',
        `Successfully connected ${account.type} email account: ${account.email}. Ready to process incoming messages.`,
        'medium'
      );

      return true;
    } catch (error) {
      console.error('❌ AVA: Failed to add email account:', error);
      return false;
    }
  }

  // 🔍 Process all unread emails across accounts
  async processUnreadEmails(userId: string): Promise<EmailInsight[]> {
    if (this.isProcessing) {
      return [];
    }

    this.isProcessing = true;
    const insights: EmailInsight[] = [];

    try {

      for (const [accountId, account] of this.accounts) {

        // Fetch unread emails from provider
        const unreadEmails = await this.fetchUnreadEmails(account);

        if (unreadEmails.length === 0) {
          continue;
        }

        // Categorize and analyze emails
        const processedEmails = await this.categorizeEmails(unreadEmails, account.type);

        // Generate insights
        const accountInsights = await this.generateEmailInsights(processedEmails, account);
        insights.push(...accountInsights);

        // Store processed emails for future reference
        await this.storeProcessedEmails(userId, accountId, processedEmails);
      }

      // Send comprehensive summary to Slack
      await this.sendEmailSummaryToSlack(insights);

    } catch (error) {
      console.error('❌ AVA: Email processing failed:', error);
    } finally {
      this.isProcessing = false;
    }

    return insights;
  }

  // 🏷️ Intelligent email categorization (different logic for personal vs business)
  private async categorizeEmails(emails: RawEmailMessage[], accountType: 'personal' | 'business'): Promise<EmailMessage[]> {
    const processed: EmailMessage[] = [];

    for (const email of emails) {
      const category = await this.categorizeEmail(email, accountType);
      const priority = await this.determinePriority(email, category, accountType);
      const sentiment = await this.analyzeSentiment(email.body);
      const needsResponse = await this.determineResponseNeeded(email, accountType);

      // Generate AI summary for important emails
      let aiSummary: string | undefined;
      let suggestedResponse: string | undefined;

      if (priority === 'high' || needsResponse) {
        aiSummary = await this.generateEmailSummary(email);
        if (needsResponse) {
          suggestedResponse = await this.generateSuggestedResponse(email, accountType);
        }
      }

      processed.push({
        id: email.id,
        accountId: email.accountId || 'unknown',
        from: email.from,
        to: Array.isArray(email.to) ? email.to : [email.to],
        subject: email.subject,
        body: email.body,
        receivedAt: new Date(email.receivedAt),
        isRead: false,
        category,
        priority,
        needsResponse,
        sentiment,
        tags: await this.generateTags(email, accountType),
        aiSummary,
        suggestedResponse
      });
    }

    return processed;
  }

  // 🎯 Smart categorization logic
  private async categorizeEmail(email: RawEmailMessage, accountType: 'personal' | 'business'): Promise<EmailMessage['category']> {
    const subject = email.subject.toLowerCase();
    const from = email.from.toLowerCase();
    const body = email.body.toLowerCase();

    // Business account categorization
    if (accountType === 'business') {
      if (this.containsUrgentKeywords(subject, body)) return 'urgent';
      if (this.isCustomerEmail(from, subject, body)) return 'customer';
      if (this.isBusinessOpportunity(subject, body)) return 'business';
      if (this.isMarketingEmail(from, subject)) return 'marketing';
      return 'business';
    }

    // Personal account categorization
    if (this.containsUrgentKeywords(subject, body)) return 'urgent';
    if (this.isMarketingEmail(from, subject)) return 'marketing';
    if (this.isSpamLikely(from, subject, body)) return 'spam';
    return 'personal';
  }

  // 🔥 Priority determination
  private async determinePriority(email: RawEmailMessage, category: EmailMessage['category'], accountType: 'personal' | 'business'): Promise<EmailMessage['priority']> {
    if (category === 'urgent') return 'high';
    if (category === 'customer' && accountType === 'business') return 'high';
    if (category === 'business' && this.isVIPSender(email.from)) return 'high';
    if (category === 'spam' || category === 'marketing') return 'low';
    return 'medium';
  }

  // 💡 Generate actionable insights
  private async generateEmailInsights(emails: EmailMessage[], account: EmailAccount): Promise<EmailInsight[]> {
    const insights: EmailInsight[] = [];

    // Urgent emails that need immediate attention
    const urgentEmails = emails.filter(e => e.category === 'urgent' || e.priority === 'high');
    if (urgentEmails.length > 0) {
      insights.push({
        type: 'urgent_attention',
        priority: 'high',
        title: `${urgentEmails.length} Urgent Emails Need Attention`,
        message: `Found ${urgentEmails.length} high-priority emails in ${account.email} requiring immediate response.`,
        actionItems: urgentEmails.map(e => `• ${e.from}: ${e.subject}`),
        emailIds: urgentEmails.map(e => e.id)
      });
    }

    // Customer opportunities (business accounts only)
    if (account.type === 'business') {
      const customerEmails = emails.filter(e => e.category === 'customer');
      if (customerEmails.length > 0) {
        insights.push({
          type: 'customer_opportunity',
          priority: 'high',
          title: `${customerEmails.length} Customer Inquiries`,
          message: `Potential sales opportunities and customer support requests identified.`,
          actionItems: customerEmails.slice(0, 5).map(e => `• ${e.from}: ${e.subject}`),
          emailIds: customerEmails.map(e => e.id)
        });
      }
    }

    // Daily summary
    insights.push({
      type: 'unread_summary',
      priority: 'medium',
      title: `${account.type.toUpperCase()} Email Summary`,
      message: `Processed ${emails.length} emails in ${account.email}`,
      actionItems: [
        `• ${emails.filter(e => e.priority === 'high').length} high priority`,
        `• ${emails.filter(e => e.needsResponse).length} need responses`,
        `• ${emails.filter(e => e.category === 'customer').length} customer emails`,
        `• ${emails.filter(e => e.category === 'marketing').length} marketing emails`
      ],
      emailIds: emails.map(e => e.id)
    });

    return insights;
  }

  // 📊 Send comprehensive summary to Slack
  private async sendEmailSummaryToSlack(insights: EmailInsight[]): Promise<void> {
    if (insights.length === 0) return;

    const urgentInsights = insights.filter(i => i.priority === 'high');
    const totalEmails = insights.reduce((sum, insight) => sum + insight.emailIds.length, 0);

    let message = `📧 **Email Processing Complete**\n\n`;
    message += `📊 **Overview:**\n`;
    message += `• Processed ${totalEmails} emails across all accounts\n`;
    message += `• ${urgentInsights.length} urgent items need attention\n\n`;

    if (urgentInsights.length > 0) {
      message += `🔥 **Urgent Actions Required:**\n`;
      urgentInsights.forEach(insight => {
        message += `\n**${insight.title}**\n${insight.message}\n`;
        insight.actionItems.slice(0, 3).forEach(item => {
          message += `${item}\n`;
        });
      });
    }

    message += `\n💡 **Next Steps:**\n`;
    message += `• Review high-priority emails first\n`;
    message += `• Use suggested responses for efficiency\n`;
    message += `• Check customer opportunities for potential sales\n`;

    await SlackNotificationService.sendAgentInsight(
      'ava',
      'strategic',
      'Email Management Summary',
      message,
      urgentInsights.length > 0 ? 'high' : 'medium'
    );
  }

  // 🔗 Helper methods for email analysis
  private containsUrgentKeywords(subject: string, body: string): boolean {
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'immediate', 'deadline', 'time sensitive'];
    const text = `${subject} ${body}`.toLowerCase();
    return urgentKeywords.some(keyword => text.includes(keyword));
  }

  private isCustomerEmail(from: string, subject: string, body: string): boolean {
    const customerKeywords = ['question', 'help', 'support', 'issue', 'problem', 'order', 'purchase', 'pricing'];
    const text = `${subject} ${body}`.toLowerCase();
    return customerKeywords.some(keyword => text.includes(keyword)) ||
           !from.includes('noreply') && !from.includes('notification');
  }

  private isBusinessOpportunity(subject: string, body: string): boolean {
    const opportunityKeywords = ['partnership', 'collaboration', 'proposal', 'opportunity', 'meeting', 'investment'];
    const text = `${subject} ${body}`.toLowerCase();
    return opportunityKeywords.some(keyword => text.includes(keyword));
  }

  private isMarketingEmail(from: string, subject: string): boolean {
    return from.includes('noreply') ||
           from.includes('marketing') ||
           subject.toLowerCase().includes('unsubscribe') ||
           subject.toLowerCase().includes('newsletter');
  }

  private isSpamLikely(from: string, subject: string, body: string): boolean {
    const spamKeywords = ['win', 'lottery', 'free money', 'click here', 'limited time'];
    const text = `${subject} ${body}`.toLowerCase();
    return spamKeywords.some(keyword => text.includes(keyword));
  }

  private isVIPSender(from: string): boolean {
    // Customize this list based on important contacts
    const vipDomains = ['sselfie.ai', 'clients', 'partners'];
    return vipDomains.some(domain => from.includes(domain));
  }

  private async analyzeSentiment(body: string): Promise<EmailMessage['sentiment']> {
    // Simple sentiment analysis - can be enhanced with AI
    const positiveWords = ['thank', 'great', 'excellent', 'love', 'amazing'];
    const negativeWords = ['problem', 'issue', 'angry', 'disappointed', 'terrible'];

    const text = body.toLowerCase();
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;

    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  }

  private async determineResponseNeeded(email: RawEmailMessage, accountType: 'personal' | 'business'): Promise<boolean> {
    // Business emails with questions usually need responses
    if (accountType === 'business') {
      const questionKeywords = ['?', 'question', 'how', 'when', 'what', 'why', 'please let me know'];
      const text = `${email.subject} ${email.body}`.toLowerCase();
      return questionKeywords.some(keyword => text.includes(keyword));
    }

    // Personal emails from real people (not automated) usually need responses
    return !email.from.includes('noreply') && !this.isMarketingEmail(email.from, email.subject);
  }

  private async generateTags(email: RawEmailMessage, accountType: 'personal' | 'business'): Promise<string[]> {
    const tags: string[] = [accountType];

    if (this.containsUrgentKeywords(email.subject, email.body)) tags.push('urgent');
    if (this.isCustomerEmail(email.from, email.subject, email.body)) tags.push('customer');
    if (email.subject.toLowerCase().includes('meeting')) tags.push('meeting');
    if (email.subject.toLowerCase().includes('payment')) tags.push('payment');

    return tags;
  }

  private async generateEmailSummary(email: RawEmailMessage): Promise<string> {
    // AI-powered email summary (placeholder for now)
    const bodyPreview = email.body.substring(0, 200) + '...';
    return `Summary: Email from ${email.from} regarding ${email.subject}. ${bodyPreview}`;
  }

  private async generateSuggestedResponse(email: RawEmailMessage, accountType: 'personal' | 'business'): Promise<string> {
    // AI-powered response suggestion (placeholder for now)
    if (accountType === 'business') {
      return `Thank you for your email. I'll review your message and get back to you within 24 hours. Best regards, Sandra`;
    } else {
      return `Thanks for reaching out! I'll get back to you soon.`;
    }
  }

  // 💾 Storage methods
  private async saveAccountContext(userId: string, account: EmailAccount): Promise<void> {
    // Save to agent session context for persistence
    const contextData = {
      emailAccounts: Array.from(this.accounts.values())
    };

    // This would integrate with your existing agent context system
  }

  private async storeProcessedEmails(userId: string, accountId: string, emails: EmailMessage[]): Promise<void> {
    // Store processed emails for reference and learning
  }

  // 📱 Mock email fetching (to be replaced with real Gmail/Outlook API)
  private async fetchUnreadEmails(account: EmailAccount): Promise<RawEmailMessage[]> {
    // This is where you'd integrate with Gmail API, Outlook API, etc.
    // For now, returning mock data to demonstrate the system

    // In production, this would connect to Gmail/Outlook APIs
    return []; // Return actual emails from API
  }

  // 🚀 Start automated email monitoring
  startEmailMonitoring(userId: string, intervalMinutes: number = 60): void {

    setInterval(async () => {
      await this.processUnreadEmails(userId);
    }, intervalMinutes * 60 * 1000);
  }
}

// Export singleton instance
export const emailManagementAgent = EmailManagementAgent.getInstance();