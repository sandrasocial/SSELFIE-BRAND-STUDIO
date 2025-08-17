import { AgentSystem } from './agent-system';

export interface AgentProposalRequest {
  agentId: string;
  taskType: 'email-campaign' | 'landing-page' | 'social-content' | 'ad-campaign' | 'blog-post' | 'design-system';
  context: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export class AgentProposalGenerator {
  
  /**
   * RACHEL: EMAIL CAMPAIGN PROPOSAL GENERATOR
   * Creates complete email sequences with previews before execution
   */
  static async generateEmailCampaignProposal(context: any): Promise<any> {
    const proposal = {
      id: `rachel-email-${Date.now()}`,
      agentId: 'rachel',
      agentName: 'Rachel',
      type: 'email-campaign',
      title: `${context.campaignName || 'SSELFIE AI Launch'} Email Sequence`,
      description: `Complete ${context.emailCount || 5}-email sequence to convert existing subscribers to €67/month SSELFIE Studio`,
      status: 'pending',
      priority: context.priority || 'high',
      createdAt: new Date(),
      preview: {
        explanation: "I've created an email sequence that feels like texting your best friend, not a sales pitch. Each email builds excitement while addressing specific objections. The copy uses my Rachel-from-Friends energy with your Icelandic directness - no corporate fluff, just real talk that converts.",
        content: await this.generateEmailPreview(context),
        preview: this.generateEmailPreview(context),
        data: {
          emailCount: context.emailCount || 5,
          targetAudience: "120K Instagram followers + email subscribers",
          conversionGoal: "€67/month SSELFIE Studio subscriptions",
          estimatedOpenRate: "45%",
          estimatedClickRate: "12%",
          estimatedConversion: "3-5%"
        }
      },
      impact: {
        estimatedReach: context.targetAudience || 25000,
        estimatedRevenue: context.projectedRevenue || 3500,
        timeToImplement: "24 hours",
        resources: ["Flodesk integration", "Email templates", "Analytics tracking"]
      }
    };

    return proposal;
  }

  /**
   * VICTORIA: LANDING PAGE PROPOSAL GENERATOR
   * Creates complete page designs with visual previews
   */
  static async generateLandingPageProposal(context: any): Promise<any> {
    const proposal = {
      id: `victoria-landing-${Date.now()}`,
      agentId: 'aria',
      agentName: 'Victoria',
      type: 'landing-page',
      title: `${context.pageName || 'SSELFIE Studio Premium'} Landing Page`,
      description: `Luxury editorial landing page optimized for €67/month conversions with Vogue-level aesthetics`,
      status: 'pending',
      priority: context.priority || 'high',
      createdAt: new Date(),
      preview: {
        explanation: "I've designed a landing page that screams luxury without being intimidating. Clean typography, generous whitespace, and strategic social proof placement. The visual hierarchy guides users naturally to the subscription CTA, while the editorial layout builds trust and desire.",
        wireframe: this.generateLandingPageCode(context),
        design: await this.generateLandingPageCode(context),
        data: {
          pageType: "conversion-optimized",
          designSystem: "luxury-editorial",
          typography: "Times New Roman + Inter",
          colorPalette: ["#000000", "#ffffff", "#f5f5f5"],
          conversionElements: ["hero CTA", "social proof", "pricing clarity", "benefit statements"]
        }
      },
      impact: {
        estimatedReach: context.targetTraffic || 50000,
        estimatedRevenue: context.projectedRevenue || 8500,
        timeToImplement: "48 hours",
        resources: ["React component library", "Stripe integration", "Analytics tracking"]
      }
    };

    return proposal;
  }

  /**
   * SOPHIA: SOCIAL CONTENT PROPOSAL GENERATOR
   * Creates social media campaigns with content previews
   */
  static async generateSocialContentProposal(context: any): Promise<any> {
    const proposal = {
      id: `sophia-social-${Date.now()}`,
      agentId: 'sophia',
      agentName: 'Sophia',
      type: 'social-content',
      title: `${context.campaignName || 'SSELFIE AI Launch'} Social Campaign`,
      description: `30-day Instagram content strategy leveraging 120K+ followers for maximum conversion`,
      status: 'pending',
      priority: context.priority || 'medium',
      createdAt: new Date(),
      preview: {
        explanation: "I've created a 30-day content calendar that showcases SSELFIE transformations while maintaining your authentic voice. Each post is designed to build desire and drive conversions without feeling salesy. The content mix includes before/after reveals, behind-the-scenes moments, and user-generated content.",
        content: await this.generateSocialContentPreview(context),
        contentPlan: this.generateSocialContentPlan(context),
        data: {
          contentCount: 30,
          platform: "Instagram primary",
          postTypes: ["Before/After", "Behind-the-scenes", "User testimonials", "Educational", "Engagement posts"],
          hashtagStrategy: "#AIphotos #personalbrand #SSELFIEstudio",
          engagementGoal: "Convert 5% of engagement to website visits"
        }
      },
      impact: {
        estimatedReach: context.expectedReach || 120000,
        estimatedRevenue: context.projectedRevenue || 5000,
        timeToImplement: "72 hours",
        resources: ["Instagram scheduler", "Content templates", "Hashtag research"]
      }
    };

    return proposal;
  }

  /**
   * MARTHA: AD CAMPAIGN PROPOSAL GENERATOR
   * Creates performance marketing campaigns with budget optimization
   */
  static async generateAdCampaignProposal(context: any): Promise<any> {
    const proposal = {
      id: `martha-ads-${Date.now()}`,
      agentId: 'martha',
      agentName: 'Martha',
      type: 'ad-campaign',
      title: `${context.campaignName || 'SSELFIE Studio'} Performance Ads`,
      description: `Facebook/Instagram ads optimized for €67 conversions with €${context.dailyBudget || 50}/day budget`,
      status: 'pending',
      priority: context.priority || 'high',
      createdAt: new Date(),
      preview: {
        explanation: "I've designed a performance campaign that targets women entrepreneurs aged 25-45 who are interested in personal branding. The creative strategy focuses on before/after transformations with social proof. Budget is optimized for immediate ROI while building long-term brand awareness.",
        content: await this.generateAdContentPreview(context),
        campaignStructure: this.generateAdCampaignStructure(context),
        data: {
          platforms: ["Facebook", "Instagram"],
          targetAudience: "Female entrepreneurs 25-45",
          dailyBudget: context.dailyBudget || 50,
          objectives: ["Conversions", "Brand awareness"],
          creativeTypes: ["Carousel", "Single image", "Video testimonials"]
        }
      },
      impact: {
        estimatedReach: context.expectedReach || 100000,
        estimatedRevenue: context.projectedRevenue || 6000,
        timeToImplement: "48 hours",
        resources: ["Facebook Ads Manager", "Creative assets", "Conversion tracking"]
      }
    };

    return proposal;
  }

  // Helper methods for generating previews
  private static async generateEmailPreview(context: any): Promise<string> {
    return `
      <div class="space-y-6">
        <div class="border-l-4 border-black pl-4">
          <h3 class="font-serif text-xl mb-2">Email 1: "Wait, what?! AI just made me look ICONIC"</h3>
          <div class="bg-gray-50 p-4 rounded">
            <p class="mb-3">Hey gorgeous,</p>
            <p class="mb-3">So... I just spent the last 6 months building something that literally gave me chills when I saw the results.</p>
            <p class="mb-3">You know how we're all taking selfies anyway, right? Well, what if I told you those same selfies could become the foundation of your entire personal brand?</p>
            <p class="mb-3">→ <strong>See what I mean here</strong> (link to gallery)</p>
            <p>Talk soon,<br>Sandra xx</p>
          </div>
        </div>
        <div class="text-center text-sm text-gray-500">+ ${(context.emailCount || 5) - 1} more emails in sequence...</div>
      </div>
    `;
  }

  private static generateEmailMockup(context: any): string {
    return `
      <div class="max-w-md mx-auto bg-white border rounded-lg shadow-sm">
        <div class="bg-black text-white p-3 text-center font-serif">
          ${context.campaignName || 'SSELFIE Studio Launch'}
        </div>
        <div class="p-4 space-y-3 text-sm">
          <div class="text-xs text-gray-500">From: Sandra | SSELFIE Studio</div>
          <div class="font-medium">Wait, what?! AI just made me look ICONIC</div>
          <div class="text-gray-700">Hey gorgeous, So... I just spent the last 6 months building something that literally gave me chills...</div>
          <button class="w-full bg-black text-white py-2 rounded">See The Magic →</button>
        </div>
      </div>
    `;
  }

  private static generateLandingPageMockup(context: any): string {
    return `
      <div class="max-w-4xl mx-auto bg-white">
        <div class="text-center py-12 border-b">
          <h1 class="font-serif text-4xl md:text-6xl font-light mb-4">${context.pageName || 'SSELFIE Studio'}</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">${context.tagline || 'Professional AI photos that build your personal brand'}</p>
          <div class="mt-8">
            <button class="bg-black text-white px-8 py-3 font-light">${context.ctaText || 'Start Your Studio €67/month'}</button>
          </div>
        </div>
        <div class="grid md:grid-cols-2 gap-8 py-12 px-6">
          <div class="space-y-6">
            <div class="bg-gray-100 h-64 flex items-center justify-center text-gray-500">[Before/After Gallery]</div>
            <div class="bg-gray-100 h-48 flex items-center justify-center text-gray-500">[Social Proof Testimonials]</div>
          </div>
          <div class="space-y-6">
            <h2 class="font-serif text-3xl font-light">${context.headline || 'From Selfie to Business Launch'}</h2>
            <p class="text-gray-700 leading-relaxed">${context.description || 'Upload a few selfies. Get professional photos that build your entire personal brand.'}</p>
          </div>
        </div>
      </div>
    `;
  }

  private static async generateLandingPageCode(context: any): Promise<string> {
    return `
// ${context.pageName || 'SSELFIE Studio'} Landing Page Component
const ${context.componentName || 'SSELFIEStudioLanding'} = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <h1 className="font-serif text-6xl font-light mb-6">
          ${context.pageName || 'SSELFIE Studio'}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
          ${context.tagline || 'Professional AI photos that build your personal brand'}
        </p>
        <button className="bg-black text-white px-12 py-4 text-lg font-light hover:bg-gray-900 transition-colors">
          ${context.ctaText || 'Start Your Studio €67/month'}
        </button>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 px-6 border-t">
        <div className="max-w-6xl mx-auto">
          {/* Content will be generated based on context */}
        </div>
      </section>
    </div>
  );
};
    `;
  }

  private static async generateSocialContentPreview(context: any): Promise<string> {
    return `
      <div class="space-y-6">
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-gray-50 p-4 rounded">
            <h4 class="font-medium mb-2">Post 1: Before/After Reveal</h4>
            <p class="text-sm text-gray-700">"POV: You upload a selfie and get professional brand photos that look like you hired a €5000 photographer... 🤯"</p>
            <div class="mt-2 text-xs text-gray-500">#AIphotos #personalbrand #SSELFIEstudio</div>
          </div>
          <div class="bg-gray-50 p-4 rounded">
            <h4 class="font-medium mb-2">Post 2: Behind The Scenes</h4>
            <p class="text-sm text-gray-700">"Real talk: I built this because I was tired of spending thousands on photoshoots that didn't feel like ME..."</p>
            <div class="mt-2 text-xs text-gray-500">#authentic #entrepreneur #brandphotos</div>
          </div>
        </div>
        <div class="text-center text-sm text-gray-500">+ 28 more posts in content calendar...</div>
      </div>
    `;
  }

  private static generateSocialMockup(context: any): string {
    return `
      <div class="max-w-sm mx-auto bg-white border rounded-lg shadow-sm">
        <div class="bg-gradient-to-r from-purple-400 to-pink-400 h-2"></div>
        <div class="p-4">
          <div class="flex items-center mb-3">
            <div class="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
            <div>
              <div class="font-medium text-sm">@ssasocial</div>
              <div class="text-xs text-gray-500">Sandra Social</div>
            </div>
          </div>
          <div class="bg-gray-100 h-48 mb-3 rounded flex items-center justify-center text-gray-500">
            [Before/After Image]
          </div>
          <p class="text-sm mb-2">POV: You upload a selfie and get professional brand photos... 🤯</p>
          <div class="text-xs text-gray-500">#AIphotos #personalbrand #SSELFIEstudio</div>
        </div>
      </div>
    `;
  }

  private static async generateAdContentPreview(context: any): Promise<string> {
    return `
      <div class="space-y-6">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="font-medium text-blue-900 mb-2">Primary Ad Creative</h4>
          <p class="text-blue-800 mb-2"><strong>Headline:</strong> "From Selfie to €10K Months: The AI Secret Every Female Entrepreneur Needs"</p>
          <p class="text-blue-800 mb-2"><strong>Description:</strong> Upload 5 selfies. Get unlimited professional photos that build your personal brand. No photographer, no studio, no €5000 budget required.</p>
          <p class="text-blue-800"><strong>CTA:</strong> Start Your Studio for €67/month</p>
        </div>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-gray-50 p-4 rounded">
            <h5 class="font-medium mb-2">Carousel Ad - Slide 1</h5>
            <p class="text-sm">"Before: Basic selfies"</p>
            <div class="bg-gray-200 h-32 mt-2 rounded"></div>
          </div>
          <div class="bg-gray-50 p-4 rounded">
            <h5 class="font-medium mb-2">Carousel Ad - Slide 2</h5>
            <p class="text-sm">"After: Professional brand photos"</p>
            <div class="bg-gray-200 h-32 mt-2 rounded"></div>
          </div>
        </div>
      </div>
    `;
  }

  private static generateAdMockup(context: any): string {
    return `
      <div class="max-w-md mx-auto bg-white border rounded-lg shadow-sm">
        <div class="bg-blue-600 text-white p-2 text-center text-xs">Sponsored</div>
        <div class="p-4">
          <div class="flex items-center mb-3">
            <div class="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
            <div>
              <div class="font-medium text-sm">SSELFIE Studio</div>
              <div class="text-xs text-gray-500">Sponsored</div>
            </div>
          </div>
          <div class="bg-gray-100 h-48 mb-3 rounded flex items-center justify-center text-gray-500">
            [Before/After Carousel]
          </div>
          <p class="text-sm font-medium mb-1">From Selfie to €10K Months: The AI Secret Every Female Entrepreneur Needs</p>
          <p class="text-xs text-gray-600 mb-3">Upload 5 selfies. Get unlimited professional photos that build your personal brand.</p>
          <button class="w-full bg-black text-white py-2 rounded text-sm">Start Your Studio €67/month</button>
        </div>
      </div>
    `;
  }
}