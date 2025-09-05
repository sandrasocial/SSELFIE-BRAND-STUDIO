import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { storage } from '../storage';
import { emailManagementAgent } from './email-management-agent';
import { SlackNotificationService } from './slack-notification-service';

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body: { data?: string; size: number };
    parts?: Array<{
      mimeType: string;
      body: { data?: string; size: number };
      headers?: Array<{ name: string; value: string }>;
    }>;
  };
}

export class GmailIntegration {
  private oauth2Client: OAuth2Client;
  private gmail: any;

  constructor() {
    if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
      throw new Error('Gmail credentials not configured. Please set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET');
    }

    this.oauth2Client = new OAuth2Client(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      `${process.env.NODE_ENV === 'production' ? 'https://sselfie.ai' : 'http://localhost:5000'}/api/auth/gmail/callback`
    );

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  // Generate OAuth URL for user authorization
  generateAuthUrl(userId: string, accountType: 'personal' | 'business'): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.metadata',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: JSON.stringify({ userId, accountType }),
      prompt: 'consent'
    });
  }

  // Handle OAuth callback and store tokens
  async handleCallback(code: string, state: string): Promise<{ userId: string; accountType: string; email: string }> {
    const { userId, accountType } = JSON.parse(state);
    
    try {
      // Exchange code for tokens
      const { tokens } = await this.oauth2Client.getAccessToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Get user email
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      const email = userInfo.data.email!;

      // Store email account in database
      await this.storeEmailAccount(userId, {
        accountType,
        email,
        provider: 'gmail',
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
      });

      // Add to email management agent
      await emailManagementAgent.addEmailAccount(userId, {
        id: `${userId}_${accountType}_gmail`,
        type: accountType,
        email,
        provider: 'gmail',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
      });

      await SlackNotificationService.sendAgentInsight(
        'ava',
        'operational',
        'Gmail Account Connected',
        `Successfully connected ${accountType} Gmail account: ${email}. Ava can now process emails from this account automatically.`,
        'medium'
      );

      return { userId, accountType, email };
    } catch (error) {
      console.error('❌ Gmail OAuth callback error:', error);
      throw new Error('Failed to connect Gmail account');
    }
  }

  // Fetch unread emails from Gmail
  async fetchUnreadEmails(accessToken: string, refreshToken?: string, maxResults: number = 50): Promise<any[]> {
    try {
      // Set credentials
      this.oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      // Search for unread emails
      const listResponse = await this.gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults
      });

      if (!listResponse.data.messages || listResponse.data.messages.length === 0) {
        return [];
      }

      // Fetch full message details
      const messages = await Promise.all(
        listResponse.data.messages.map(async (message: any) => {
          const fullMessage = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          });
          return this.parseGmailMessage(fullMessage.data);
        })
      );

      console.log(`📧 Gmail: Fetched ${messages.length} unread emails`);
      return messages;

    } catch (error) {
      console.error('❌ Gmail fetch error:', error);
      
      // Try to refresh token if access token expired
      if (error.response?.status === 401 && refreshToken) {
        try {
          this.oauth2Client.setCredentials({ refresh_token: refreshToken });
          const { credentials } = await this.oauth2Client.refreshAccessToken();
          
          // Retry with new token
          this.oauth2Client.setCredentials(credentials);
          return await this.fetchUnreadEmails(credentials.access_token!, refreshToken, maxResults);
        } catch (refreshError) {
          console.error('❌ Gmail token refresh failed:', refreshError);
          throw new Error('Gmail authentication expired. Please reconnect your account.');
        }
      }
      
      throw new Error('Failed to fetch Gmail messages');
    }
  }

  // Parse Gmail message format to our standard format
  private parseGmailMessage(gmailMessage: GmailMessage): any {
    const headers = gmailMessage.payload.headers;
    const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    // Extract email body
    let body = '';
    if (gmailMessage.payload.body?.data) {
      body = Buffer.from(gmailMessage.payload.body.data, 'base64').toString('utf-8');
    } else if (gmailMessage.payload.parts) {
      // Multi-part message, find text/plain or text/html part
      const textPart = gmailMessage.payload.parts.find(part => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    }

    // Clean HTML if present
    if (body.includes('<')) {
      body = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    return {
      id: gmailMessage.id,
      accountId: 'gmail', // Will be set by caller
      from: getHeader('From'),
      to: [getHeader('To')],
      subject: getHeader('Subject'),
      body: body.substring(0, 5000), // Limit body size
      receivedAt: new Date(parseInt(gmailMessage.internalDate)).toISOString(),
      labels: gmailMessage.labelIds || []
    };
  }

  // Store email account in database
  private async storeEmailAccount(userId: string, account: {
    accountType: 'personal' | 'business';
    email: string;
    provider: string;
    accessToken: string;
    refreshToken: string;
  }): Promise<void> {
    try {
      // In a real implementation, you'd store this in your database
      // For now, we'll just log it (tokens should be encrypted in production)
      console.log(`💾 Storing Gmail account: ${account.email} (${account.accountType}) for user ${userId}`);
      
      // TODO: Implement actual database storage with encryption
      // await db.insert(emailAccounts).values({
      //   userId,
      //   accountType: account.accountType,
      //   email: account.email,
      //   provider: account.provider,
      //   accessToken: encrypt(account.accessToken),
      //   refreshToken: encrypt(account.refreshToken)
      // });
      
    } catch (error) {
      console.error('❌ Failed to store email account:', error);
      throw error;
    }
  }

  // Get stored Gmail accounts for a user
  async getGmailAccounts(userId: string): Promise<Array<{
    id: string;
    type: 'personal' | 'business';
    email: string;
    accessToken: string;
    refreshToken?: string;
  }>> {
    try {
      // TODO: Implement actual database retrieval
      // For now, return empty array - in production this would fetch from database
      console.log(`📧 Retrieving Gmail accounts for user ${userId}`);
      return [];
      
    } catch (error) {
      console.error('❌ Failed to retrieve Gmail accounts:', error);
      return [];
    }
  }

  // Process emails for all connected Gmail accounts
  async processAllGmailAccounts(userId: string): Promise<void> {
    try {
      const accounts = await this.getGmailAccounts(userId);
      
      if (accounts.length === 0) {
        console.log('📧 No Gmail accounts connected for user');
        return;
      }

      for (const account of accounts) {
        console.log(`📧 Processing Gmail account: ${account.email} (${account.type})`);
        
        try {
          const emails = await this.fetchUnreadEmails(account.accessToken, account.refreshToken);
          
          if (emails.length > 0) {
            // Process emails through Ava's intelligence
            const processedEmails = emails.map(email => ({
              ...email,
              accountId: account.id
            }));

            console.log(`📧 Processing ${processedEmails.length} emails from ${account.email}`);
            // The email management agent will handle categorization and insights
          }
          
        } catch (error) {
          console.error(`❌ Failed to process Gmail account ${account.email}:`, error);
          
          await SlackNotificationService.sendAgentInsight(
            'ava',
            'operational',
            'Gmail Processing Error',
            `Failed to process emails from ${account.email}. May need to reconnect account.`,
            'medium'
          );
        }
      }
      
    } catch (error) {
      console.error('❌ Gmail processing error:', error);
    }
  }
}

export const gmailIntegration = new GmailIntegration();