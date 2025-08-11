"use strict";
// SSELFIE Studio Flodesk Subscriber Import Service
// Invisible Empire Data Integration for Email List Migration
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlodeskImportService = void 0;
class FlodeskImportService {
    constructor() {
        this.baseUrl = 'https://api.flodesk.com/v1';
        if (!process.env.FLODESK_API_KEY) {
            throw new Error("FLODESK_API_KEY environment variable must be set");
        }
        this.apiKey = process.env.FLODESK_API_KEY;
    }
    // Fetch all subscribers from Flodesk
    async fetchAllSubscribers() {
        try {
            console.log('🔍 Fetching subscribers from Flodesk...');
            console.log('🔍 API Key format check:', {
                hasKey: !!this.apiKey,
                keyLength: this.apiKey.length,
                keyPrefix: this.apiKey.substring(0, 10) + '...',
                baseUrl: this.baseUrl
            });
            const subscribers = [];
            let page = 1;
            let hasMore = true;
            while (hasMore) {
                // Use Basic Auth as per Flodesk API documentation
                const basicAuth = Buffer.from(`${this.apiKey}:`).toString('base64');
                const response = await fetch(`${this.baseUrl}/subscribers?page=${page}&per_page=100`, {
                    headers: {
                        'Authorization': `Basic ${basicAuth}`,
                        'Content-Type': 'application/json',
                        'User-Agent': 'SSELFIE Studio/1.0 (https://sselfie.ai)'
                    }
                });
                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error(`🔍 Flodesk API Response Details:`, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: Object.fromEntries(response.headers.entries()),
                        body: errorBody
                    });
                    throw new Error(`Flodesk API error: ${response.status} ${response.statusText} - ${errorBody}`);
                }
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    subscribers.push(...data.data);
                    page++;
                    hasMore = data.data.length === 100; // Continue if we got a full page
                }
                else {
                    hasMore = false;
                }
                // Rate limiting - Flodesk allows 120 requests per minute
                await this.delay(500);
            }
            console.log(`✅ Fetched ${subscribers.length} subscribers from Flodesk`);
            return subscribers;
        }
        catch (error) {
            console.error('❌ Error fetching Flodesk subscribers:', error);
            throw error;
        }
    }
    // Transform Flodesk data to our format
    transformSubscribers(flodeskSubscribers) {
        return flodeskSubscribers.map(subscriber => ({
            email: subscriber.email,
            firstName: subscriber.first_name || undefined,
            lastName: subscriber.last_name || undefined,
            source: 'flodesk',
            originalId: subscriber.id,
            status: subscriber.status,
            tags: subscriber.tags || [],
            importedAt: new Date(),
            customFields: subscriber.custom_fields || {}
        }));
    }
    // Get subscriber segments/tags
    async fetchSegments() {
        try {
            const response = await fetch(`${this.baseUrl}/segments`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Flodesk API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data.data || [];
        }
        catch (error) {
            console.error('❌ Error fetching Flodesk segments:', error);
            return [];
        }
    }
    // Import subscribers with progress tracking
    async importSubscribers(onProgress) {
        try {
            console.log('🚀 Starting Flodesk subscriber import...');
            const flodeskSubscribers = await this.fetchAllSubscribers();
            const transformedSubscribers = this.transformSubscribers(flodeskSubscribers);
            // Report progress
            if (onProgress) {
                onProgress(transformedSubscribers.length, transformedSubscribers.length);
            }
            console.log(`✅ Transformed ${transformedSubscribers.length} Flodesk subscribers`);
            return transformedSubscribers;
        }
        catch (error) {
            console.error('❌ Flodesk import failed:', error);
            throw error;
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.FlodeskImportService = FlodeskImportService;
exports.default = FlodeskImportService;
