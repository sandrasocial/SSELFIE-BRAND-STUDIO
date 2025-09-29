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

  // ManyChat API doesn't support bulk subscriber fetching
  // This method requires pre-exported subscriber IDs from ManyChat UI
  async fetchAllSubscribers(): Promise<ManyChatSubscriber[]> {
    throw new Error(`
      ManyChat API Limitation: No bulk subscriber endpoint available.
      
      To import ManyChat subscribers:
      1. Export subscriber IDs from ManyChat UI: Audience → Bulk Actions → Export PSIDs
      2. Upload the PSID list to SSELFIE Studio
      3. Use fetchSubscriberDetails() for individual subscriber data
      
      ManyChat requires manual export first, then individual API calls per subscriber.
    `);
  }

  // Fetch individual subscriber details by ID
  async fetchSubscriberDetails(subscriberId: string): Promise<ManyChatSubscriber | null> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriber/getInfo?subscriber_id=${subscriberId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`⚠️ Subscriber ${subscriberId} not found`);
          return null;
        }
        const errorBody = await response.text();
        throw new Error(`ManyChat API error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const data = await response.json();
      return data.data;
      
    } catch (error) {
      console.error(`Error fetching subscriber ${subscriberId}:`, error);
      return null;
    }
  }

  // Import subscribers from pre-exported PSID list
  async importFromPSIDList(psidList: string[]): Promise<ManyChatSubscriber[]> {
    console.log(`🔍 Importing ${psidList.length} ManyChat subscribers from PSID list...`);
    
    const subscribers: ManyChatSubscriber[] = [];
    
    for (let i = 0; i < psidList.length; i++) {
      const psid = psidList[i];
      console.log(`📊 Processing subscriber ${i + 1}/${psidList.length}: ${psid}`);
      
      const subscriber = await this.fetchSubscriberDetails(psid);
      if (subscriber) {
        subscribers.push(subscriber);
      }
      
      // Rate limiting: 2 requests per second
      if (i < psidList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`✅ ManyChat import complete: ${subscribers.length} subscribers imported`);
    return subscribers;
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

      // Extract tags
      const tags = subscriber.tags?.map(tag => tag.name) || [];

      return {
        email,
        firstName: subscriber.first_name,
        lastName: subscriber.last_name,
        source: 'manychat' as const,
        originalId: subscriber.id,
        status: subscriber.status,
        tags,
        importedAt: new Date(),
        customFields,
        messengerData: {
          profilePic: subscriber.profile_pic,
          locale: subscriber.locale,
          timezone: subscriber.timezone,
          gender: subscriber.gender,
        }
      };
    });
  }

  // Rate limiting helper
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}