/**
 * High Level CRM API Service
 * 
 * Handles all API communications with High Level CRM system
 * for contact management, lead tracking, and automation workflows.
 */

export class HighLevelService {
  private apiKey: string;
  private baseUrl = 'https://rest.gohighlevel.com/v1';
  
  /**
   * Initialize High Level service with API key
   * @param apiKey - High Level API key for authentication
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Make authenticated API request to High Level
   */
  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      ...(data && { body: JSON.stringify(data) })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`High Level API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Create a new contact in High Level CRM
   * @param email - Contact email address
   * @param name - Contact full name
   * @returns Promise with creation result
   */
  async createContact(email: string, name: string): Promise<any> {
    console.log('HighLevelService.createContact called with:', {
      email,
      name,
      apiKey: this.apiKey ? '***' + this.apiKey.slice(-4) : 'NOT_SET'
    });

    try {
      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const contactData = {
        firstName,
        lastName,
        email,
        source: 'SSELFIE Studio AI Command Center'
      };

      const result = await this.makeRequest('/contacts', 'POST', contactData);
      
      return {
        success: true,
        message: 'Contact created successfully in High Level.',
        contactId: result.contact?.id || result.id,
        data: {
          email,
          name,
          firstName,
          lastName,
          createdAt: new Date().toISOString(),
          highLevelData: result
        }
      };

    } catch (error) {
      console.error('High Level API Error:', error);
      throw new Error(`Failed to create contact in High Level: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a complete lead generation funnel in High Level
   * @param name - Funnel name/title
   * @param landingPageCopy - HTML/text content for the landing page
   * @param thankYouPageCopy - HTML/text content for the thank you page
   * @returns Promise with funnel creation result
   */
  async createFunnel(name: string, landingPageCopy: string, thankYouPageCopy: string): Promise<any> {
    console.log('HighLevelService.createFunnel called with:', {
      name,
      landingPageCopyLength: landingPageCopy.length,
      thankYouPageCopyLength: thankYouPageCopy.length,
      apiKey: this.apiKey ? '***' + this.apiKey.slice(-4) : 'NOT_SET'
    });

    try {
      // Step 1: Create the funnel structure
      const funnelData = {
        name,
        status: 'published',
        source: 'SSELFIE Studio AI Command Center'
      };

      const funnelResult = await this.makeRequest('/funnels', 'POST', funnelData);
      const funnelId = funnelResult.funnel?.id || funnelResult.id;

      // Step 2: Create landing page
      const landingPageData = {
        name: `${name} - Landing Page`,
        type: 'landing',
        content: landingPageCopy,
        funnelId
      };

      const landingPageResult = await this.makeRequest('/funnels/pages', 'POST', landingPageData);

      // Step 3: Create thank you page
      const thankYouPageData = {
        name: `${name} - Thank You Page`,
        type: 'thankyou',
        content: thankYouPageCopy,
        funnelId
      };

      const thankYouPageResult = await this.makeRequest('/funnels/pages', 'POST', thankYouPageData);

      return {
        success: true,
        message: 'Funnel created successfully in High Level.',
        funnelId,
        data: {
          name,
          funnelId,
          landingPageUrl: landingPageResult.page?.url || `https://highlevel.com/funnels/${funnelId}/landing`,
          thankYouPageUrl: thankYouPageResult.page?.url || `https://highlevel.com/funnels/${funnelId}/thankyou`,
          status: 'active',
          createdAt: new Date().toISOString(),
          pages: {
            landing: {
              id: landingPageResult.page?.id,
              copyLength: landingPageCopy.length,
              preview: landingPageCopy.substring(0, 100) + '...'
            },
            thankYou: {
              id: thankYouPageResult.page?.id,
              copyLength: thankYouPageCopy.length,
              preview: thankYouPageCopy.substring(0, 100) + '...'
            }
          },
          highLevelData: {
            funnel: funnelResult,
            landingPage: landingPageResult,
            thankYouPage: thankYouPageResult
          }
        }
      };

    } catch (error) {
      console.error('High Level Funnel API Error:', error);
      
      // Fallback to simplified funnel creation if the complex approach fails
      console.log('Attempting simplified funnel creation...');
      
      try {
        const simpleFunnelData = {
          name,
          description: `AI-generated funnel created by SSELFIE Studio`,
          status: 'draft' // Start as draft for safety
        };

        const result = await this.makeRequest('/funnels', 'POST', simpleFunnelData);
        
        return {
          success: true,
          message: 'Simplified funnel created in High Level. You can add pages manually.',
          funnelId: result.funnel?.id || result.id,
          data: {
            name,
            funnelId: result.funnel?.id || result.id,
            status: 'draft',
            createdAt: new Date().toISOString(),
            note: 'Funnel created successfully. Landing and thank-you pages need to be added manually in High Level dashboard.',
            generatedCopy: {
              landingPage: landingPageCopy,
              thankYouPage: thankYouPageCopy
            },
            highLevelData: result
          }
        };

      } catch (fallbackError) {
        console.error('Fallback funnel creation also failed:', fallbackError);
        throw new Error(`Failed to create funnel in High Level: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
}