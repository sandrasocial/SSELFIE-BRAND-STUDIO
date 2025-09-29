export class ManyChatImportService {
    apiKey;
    baseUrl = 'https://api.manychat.com/fb';
    constructor() {
        if (!process.env.MANYCHAT_API_KEY) {
            throw new Error("MANYCHAT_API_KEY environment variable must be set");
        }
        this.apiKey = process.env.MANYCHAT_API_KEY;
    }
    async fetchAllSubscribers() {
        throw new Error(`
      ManyChat API Limitation: No bulk subscriber endpoint available.
      
      To import ManyChat subscribers:
      1. Export subscriber IDs from ManyChat UI: Audience → Bulk Actions → Export PSIDs
      2. Upload the PSID list to SSELFIE Studio
      3. Use fetchSubscriberDetails() for individual subscriber data
      
      ManyChat requires manual export first, then individual API calls per subscriber.
    `);
    }
    async fetchSubscriberDetails(subscriberId) {
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
        }
        catch (error) {
            console.error(`Error fetching subscriber ${subscriberId}:`, error);
            return null;
        }
    }
    async importFromPSIDList(psidList) {
        console.log(`🔍 Importing ${psidList.length} ManyChat subscribers from PSID list...`);
        const subscribers = [];
        for (let i = 0; i < psidList.length; i++) {
            const psid = psidList[i];
            console.log(`📊 Processing subscriber ${i + 1}/${psidList.length}: ${psid}`);
            const subscriber = await this.fetchSubscriberDetails(psid);
            if (subscriber) {
                subscribers.push(subscriber);
            }
            if (i < psidList.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        console.log(`✅ ManyChat import complete: ${subscribers.length} subscribers imported`);
        return subscribers;
    }
    transformSubscribers(manychatSubscribers) {
        return manychatSubscribers.map(subscriber => {
            const customFields = {};
            if (subscriber.custom_fields) {
                subscriber.custom_fields.forEach(field => {
                    customFields[field.name] = field.value;
                });
            }
            const email = customFields.email || customFields.Email || undefined;
            const tags = subscriber.tags?.map(tag => tag.name) || [];
            return {
                email,
                firstName: subscriber.first_name,
                lastName: subscriber.last_name,
                source: 'manychat',
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
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=manychat-import.js.map