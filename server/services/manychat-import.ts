// SSELFIE Studio ManyChat Subscriber Import Service
// Invisible Empire Data Integration for Messenger Subscribers

interface ManyChatSubscriber {
  id: string;
  first_name?: string;
  last_name?: string;
  profile_pic?: string;
  locale?: string;
  timezone?: number;
  gender?: string;
  status: 'active' | 'unsubscribed';
  subscribed_at: string;
  tags?: Array<{
    id: string;
    name: string;
  }>;
  custom_fields?: Array<{
    id: string;
    name: string;
    value: any;
  }>;
}

interface ImportedSubscriber {
  email?: string;
  firstName?: string;
  lastName?: string;
  source: 'flodesk' | 'manychat';
  originalId: string;
  status: 'active' | 'unsubscribed';
  tags: string[];
  importedAt: Date;
  customFields: Record<string, any>;
  messengerData?: {
    profilePic?: string;
    locale?: string;
    timezone?: number;
    gender?: string;
  };
}

export class ManyChatImportService {
  private apiKey: string;
  private baseUrl = 'https://api.manychat.com/fb';

  constructor() {
    if (!process.env.MANYCHAT_API_KEY) {
      throw new Error("MANYCHAT_API_KEY environment variable must be set");
    }
    this.apiKey = process.env.MANYCHAT_API_KEY;
  }

  // Fetch all subscribers from ManyChat
  async fetchAllSubscribers(): Promise<ManyChatSubscriber[]> {
    try {
      console.log('🔍 Fetching subscribers from ManyChat...');
      
      const subscribers: ManyChatSubscriber[] = [];
      let hasMore = true;
      let cursor: string | undefined;

      while (hasMore) {
        // Use correct ManyChat API endpoint and method
        const response = await fetch(`${this.baseUrl}/subscriber/findByName`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: '',  // Empty name to get all subscribers
            page_token: cursor || undefined,
            limit: 100
          })
        });

        if (!response.ok) {
          throw new Error(`ManyChat API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          subscribers.push(...data.data);
          cursor = data.next_cursor;
          hasMore = !!cursor;
        } else {
          hasMore = false;
        }

        // Rate limiting - ManyChat allows 100 requests per minute
        await this.delay(600);
      }

      console.log(`✅ Fetched ${subscribers.length} subscribers from ManyChat`);
      return subscribers;

    } catch (error) {
      console.error('❌ Error fetching ManyChat subscribers:', error);
      throw error;
    }
  }

  // Get subscriber by ID with custom fields
  async getSubscriberDetails(subscriberId: string): Promise<ManyChatSubscriber | null> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriber/getInfo?subscriber_id=${subscriberId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`ManyChat API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;

    } catch (error) {
      console.error(`❌ Error fetching ManyChat subscriber ${subscriberId}:`, error);
      return null;
    }
  }

  // Transform ManyChat data to our format
  transformSubscribers(manychatSubscribers: ManyChatSubscriber[]): ImportedSubscriber[] {
    return manychatSubscribers.map(subscriber => {
      // Extract custom fields
      const customFields: Record<string, any> = {};
      if (subscriber.custom_fields) {
        subscriber.custom_fields.forEach(field => {
          customFields[field.name] = field.value;
        });
      }

      // Extract email from custom fields if available
      const email = customFields.email || customFields.Email || undefined;

      return {
        email,
        firstName: subscriber.first_name,
        lastName: subscriber.last_name,
        source: 'manychat',
        originalId: subscriber.id,
        status: subscriber.status,
        tags: subscriber.tags?.map(tag => tag.name) || [],
        importedAt: new Date(),
        customFields,
        messengerData: {
          profilePic: subscriber.profile_pic,
          locale: subscriber.locale,
          timezone: subscriber.timezone,
          gender: subscriber.gender
        }
      };
    });
  }

  // Get available tags
  async fetchTags(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/page/getTags`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`ManyChat API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];

    } catch (error) {
      console.error('❌ Error fetching ManyChat tags:', error);
      return [];
    }
  }

  // Import subscribers with detailed progress tracking
  async importSubscribers(onProgress?: (progress: number, total: number) => void): Promise<ImportedSubscriber[]> {
    try {
      console.log('🚀 Starting ManyChat subscriber import...');
      
      const manychatSubscribers = await this.fetchAllSubscribers();
      
      // Fetch detailed info for each subscriber to get custom fields
      const detailedSubscribers: ManyChatSubscriber[] = [];
      
      for (let i = 0; i < manychatSubscribers.length; i++) {
        const subscriber = manychatSubscribers[i];
        const details = await this.getSubscriberDetails(subscriber.id);
        
        if (details) {
          detailedSubscribers.push(details);
        }

        // Report progress
        if (onProgress) {
          onProgress(i + 1, manychatSubscribers.length);
        }

        // Rate limiting
        await this.delay(600);
      }

      const transformedSubscribers = this.transformSubscribers(detailedSubscribers);

      console.log(`✅ Transformed ${transformedSubscribers.length} ManyChat subscribers`);
      return transformedSubscribers;

    } catch (error) {
      console.error('❌ ManyChat import failed:', error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ManyChatImportService;