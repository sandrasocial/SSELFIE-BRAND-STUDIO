/**
 * EXTERNAL API SERVICE - SANDRA'S INTEGRATION HUB
 * Connects AI agents to Make, Flodesk, ManyChat, Instagram, and more
 */

import fetch from 'node-fetch';

export interface FlodeskSubscriber {
  email: string;
  first_name?: string;
  last_name?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  created_at?: string;
}

export interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  media_id: string;
}

export interface MakeScenariosResponse {
  scenarios: Array<{
    id: number;
    name: string;
    isActive: boolean;
    lastRun?: string;
  }>;
}

export class ExternalAPIService {
  
  // FLODESK EMAIL MARKETING
  static async getFlodeskSubscribers(): Promise<FlodeskSubscriber[]> {
    try {
      const response = await fetch('https://api.flodesk.com/v1/subscribers', {
        headers: {
          'Authorization': `Basic ${Buffer.from(process.env.FLODESK_API_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Flodesk API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.data || [];
    } catch (error) {
      console.error('Flodesk API Error:', error);
      throw new Error('Failed to fetch Flodesk subscribers');
    }
  }

  static async importSubscribersToSSELFIE(subscribers: FlodeskSubscriber[]): Promise<number> {
    let imported = 0;
    
    for (const subscriber of subscribers) {
      try {
        // Add to SSELFIE email capture system
        const response = await fetch('http://localhost:5000/api/email-capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: subscriber.email,
            firstName: subscriber.first_name,
            lastName: subscriber.last_name,
            source: 'flodesk_import',
            plan: 'imported_subscriber'
          })
        });

        if (response.ok) {
          imported++;
        }
      } catch (error) {
        console.error(`Failed to import ${subscriber.email}:`, error);
      }
    }

    return imported;
  }

  static async createFlodeskEmailCampaign(subject: string, content: string, segmentTags?: string[]): Promise<string> {
    try {
      const response = await fetch('https://api.flodesk.com/v1/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(process.env.FLODESK_API_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject,
          content,
          tags: segmentTags || ['sselfie-subscribers']
        })
      });

      const data = await response.json() as any;
      return data.id;
    } catch (error) {
      console.error('Flodesk campaign creation error:', error);
      throw new Error('Failed to create email campaign');
    }
  }

  // INSTAGRAM / META INTEGRATION
  static async getInstagramComments(mediaId?: string): Promise<InstagramComment[]> {
    try {
      const endpoint = mediaId 
        ? `https://graph.facebook.com/v18.0/${mediaId}/comments`
        : `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media?fields=comments{text,username,timestamp}`;

      const response = await fetch(`${endpoint}?access_token=${process.env.META_ACCESS_TOKEN}`);
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.data || [];
    } catch (error) {
      console.error('Instagram API Error:', error);
      throw new Error('Failed to fetch Instagram comments');
    }
  }

  static async replyToInstagramComment(commentId: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${commentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          access_token: process.env.META_ACCESS_TOKEN
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Instagram reply error:', error);
      return false;
    }
  }

  static async getInstagramAnalytics(timeframe: 'today' | 'week' | 'month' = 'week'): Promise<any> {
    try {
      const since = new Date();
      if (timeframe === 'week') since.setDate(since.getDate() - 7);
      if (timeframe === 'month') since.setMonth(since.getMonth() - 1);

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/insights` +
        `?metric=impressions,reach,profile_views,website_clicks&period=day` +
        `&since=${since.toISOString().split('T')[0]}&access_token=${process.env.META_ACCESS_TOKEN}`
      );

      const data = await response.json() as any;
      return data.data || {};
    } catch (error) {
      console.error('Instagram analytics error:', error);
      return {};
    }
  }

  // MANYCHAT AUTOMATION
  static async getManychatSubscribers(): Promise<any[]> {
    try {
      const response = await fetch('https://api.manychat.com/fb/subscriber/findBySystemField', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MANYCHAT_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          field_name: 'email',
          field_value: '*' // Get all subscribers
        })
      });

      const data = await response.json() as any;
      return data.data || [];
    } catch (error) {
      console.error('ManyChat API Error:', error);
      throw new Error('Failed to fetch ManyChat subscribers');
    }
  }

  static async sendManychtMessage(subscriberId: string, content: any): Promise<boolean> {
    try {
      const response = await fetch('https://api.manychat.com/fb/sending/sendContent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MANYCHAT_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscriber_id: subscriberId,
          data: content
        })
      });

      return response.ok;
    } catch (error) {
      console.error('ManyChat send error:', error);
      return false;
    }
  }

  // MAKE AUTOMATION PLATFORM
  static async getMakeScenarios(): Promise<MakeScenariosResponse> {
    try {
      const response = await fetch('https://www.make.com/api/v2/scenarios', {
        headers: {
          'Authorization': `Token ${process.env.MAKE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Make API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return { scenarios: data.scenarios || [] };
    } catch (error) {
      console.error('Make API Error:', error);
      throw new Error('Failed to fetch Make scenarios');
    }
  }

  static async triggerMakeScenario(scenarioId: number, data?: any): Promise<boolean> {
    try {
      const response = await fetch(`https://www.make.com/api/v2/scenarios/${scenarioId}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.MAKE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data || {})
      });

      return response.ok;
    } catch (error) {
      console.error('Make scenario trigger error:', error);
      return false;
    }
  }

  static async createMakeWebhook(name: string, triggerUrl: string): Promise<string | null> {
    try {
      const response = await fetch('https://www.make.com/api/v2/hooks', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.MAKE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          url: triggerUrl
        })
      });

      const data = await response.json() as any;
      return data.hook?.url || null;
    } catch (error) {
      console.error('Make webhook creation error:', error);
      return null;
    }
  }

  // COMPREHENSIVE HEALTH CHECK
  static async checkAllIntegrations(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    // Test Flodesk
    try {
      await this.getFlodeskSubscribers();
      health.flodesk = true;
    } catch {
      health.flodesk = false;
    }

    // Test Instagram
    try {
      await this.getInstagramAnalytics();
      health.instagram = true;
    } catch {
      health.instagram = false;
    }

    // Test ManyChat
    try {
      await this.getManychtSubscribers();
      health.manychat = true;
    } catch {
      health.manychat = false;
    }

    // Test Make
    try {
      await this.getMakeScenarios();
      health.make = true;
    } catch {
      health.make = false;
    }

    return health;
  }
}