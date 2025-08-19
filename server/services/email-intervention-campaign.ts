/**
 * EMAIL INTERVENTION CAMPAIGN
 * Immediate outreach to 8 inactive paid users
 */

interface InactiveUser {
  id: string;
  email: string;
  plan: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
}

export class EmailInterventionCampaign {
  
  // The 8 inactive users from the API response
  static inactiveUsers: InactiveUser[] = [
    {
      id: "43782722",
      email: "sandrajonna@gmail.com", 
      plan: "sselfie-studio",
      firstName: "Sandra",
      lastName: "Aamodt",
      createdAt: "2025-07-15T09:51:35.592Z"
    },
    {
      id: "45196441",
      email: "dabbajona@icloud.com",
      plan: "pro", 
      firstName: null,
      lastName: null,
      createdAt: "2025-07-18T07:48:57.772Z"
    },
    {
      id: "shannon-1753945376880",
      email: "shannon@soulresets.com",
      plan: "full-access",
      firstName: "Shannon",
      lastName: "Murray", 
      createdAt: "2025-07-31T07:02:57.159Z"
    },
    {
      id: "45075281",
      email: "sandra@dibssocial.com",
      plan: "sselfie-studio",
      firstName: null,
      lastName: null,
      createdAt: "2025-07-15T16:03:06.790Z"
    },
    {
      id: "45038279", 
      email: "hafdisosk@icloud.com",
      plan: "basic",
      firstName: null,
      lastName: null,
      createdAt: "2025-07-16T12:31:07.147Z"
    },
    {
      id: "42585527",
      email: "ssa@ssasocial.com", 
      plan: "sselfie-studio",
      firstName: "Sandra",
      lastName: "Sigurjonsdottir",
      createdAt: "2025-07-14T21:16:54.733Z"
    },
    {
      id: "45292112",
      email: "gloth.coaching@gmail.com",
      plan: "basic", 
      firstName: null,
      lastName: null,
      createdAt: "2025-07-20T16:39:51.208Z"
    },
    {
      id: "43640227",
      email: "erlafgunnars@gmail.com",
      plan: "pro",
      firstName: "Erla",
      lastName: "Gunnars",
      createdAt: "2025-07-17T16:51:51.257Z"
    }
  ];

  /**
   * Generate personalized email for each user segment
   */
  static generatePersonalizedCampaign() {
    const campaigns = this.inactiveUsers.map(user => {
      const name = user.firstName || user.email.split('@')[0];
      const planName = this.getPlanDisplayName(user.plan);
      const daysSinceSignup = this.getDaysSinceSignup(user.createdAt);
      
      return {
        userId: user.id,
        email: user.email,
        name,
        planName,
        daysSinceSignup,
        subject: `${name}, activate your ${planName} plan in 5 minutes`,
        template: this.getEmailTemplate(user, name, planName, daysSinceSignup),
        urgency: daysSinceSignup > 30 ? 'high' : daysSinceSignup > 14 ? 'medium' : 'low'
      };
    });

    return campaigns;
  }

  private static getPlanDisplayName(plan: string): string {
    const planMap = {
      'sselfie-studio': 'SSELFIE Studio',
      'full-access': 'Full Access', 
      'pro': 'Pro',
      'basic': 'Basic'
    };
    return planMap[plan as keyof typeof planMap] || plan.charAt(0).toUpperCase() + plan.slice(1);
  }

  private static getDaysSinceSignup(createdAt: string): number {
    const signupDate = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  private static getEmailTemplate(user: InactiveUser, name: string, planName: string, daysSinceSignup: number): string {
    const urgencyMessage = daysSinceSignup > 30 
      ? "I noticed you haven't started using your subscription yet after 30+ days."
      : daysSinceSignup > 14
      ? "It's been 2+ weeks since you joined and I want to make sure you get the most out of your subscription."  
      : "Welcome to SSELFIE! Let's get your AI model trained and start creating amazing photos.";

    return `
      <div style="font-family: 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #d4af37; font-size: 32px; margin: 0; letter-spacing: 2px;">SSELFIE STUDIO</h1>
          <p style="color: #888; margin: 5px 0 0 0; font-size: 14px; letter-spacing: 1px;">PERSONAL BRAND PHOTOGRAPHY</p>
        </div>
        
        <h2 style="color: #d4af37; font-size: 24px; margin-bottom: 20px;">Hi ${name},</h2>
        
        <p style="line-height: 1.7; font-size: 16px; margin-bottom: 25px;">
          ${urgencyMessage}
        </p>
        
        <div style="background: linear-gradient(135deg, #111, #1a1a1a); padding: 25px; margin: 25px 0; border: 1px solid #333; border-radius: 8px;">
          <h3 style="color: #d4af37; margin: 0 0 15px 0; font-size: 18px;">Your ${planName} Benefits:</h3>
          <ul style="line-height: 1.8; margin: 0; padding-left: 20px; color: #ddd;">
            ${this.getPlanBenefits(user.plan)}
          </ul>
        </div>
        
        <div style="background: #0a0a0a; padding: 20px; margin: 25px 0; border-left: 4px solid #d4af37;">
          <h3 style="color: #d4af37; margin: 0 0 10px 0; font-size: 16px;">Getting Started Is Simple:</h3>
          <ol style="line-height: 1.8; margin: 0; color: #ccc; font-size: 15px;">
            <li>Upload 15-20 high-quality selfies to train your AI model</li>
            <li>Wait 24-48 hours for your custom model to train</li>  
            <li>Generate unlimited professional brand photos instantly</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="https://sselfie.ai/workspace?utm_source=intervention&utm_campaign=activation&utm_content=${user.id}" 
             style="background: linear-gradient(135deg, #d4af37, #b8941f); color: #000; padding: 18px 35px; 
                    text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;
                    font-size: 16px; letter-spacing: 1px; transition: all 0.3s;">
            START UPLOADING NOW
          </a>
        </div>
        
        <p style="line-height: 1.6; font-size: 15px; color: #aaa; margin: 30px 0;">
          Need help? Simply reply to this email - I personally respond to every message within 2 hours.
        </p>
        
        <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #333; text-align: center;">
          <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.5;">
            Sandra Sigurjonsdottir<br>
            <span style="color: #d4af37;">Founder & CEO, SSELFIE Studio</span>
          </p>
        </div>
      </div>
    `;
  }

  private static getPlanBenefits(plan: string): string {
    const benefits = {
      'sselfie-studio': `
        <li>Custom AI model trained on your photos</li>
        <li>Unlimited professional image generations</li>
        <li>Premium editing suite access</li>
        <li>Priority support & consultation</li>
      `,
      'full-access': `
        <li>Everything in Pro + premium features</li>
        <li>Advanced AI model customization</li>
        <li>Unlimited high-resolution exports</li>
        <li>White-label commercial usage rights</li>
      `,
      'pro': `
        <li>Custom AI model training</li>
        <li>100 monthly generations</li>
        <li>Professional quality outputs</li>
        <li>Commercial usage license</li>
      `,
      'basic': `
        <li>Custom AI model training</li>
        <li>30 monthly generations</li>
        <li>Standard quality outputs</li>
        <li>Personal usage license</li>
      `
    };
    
    return benefits[plan as keyof typeof benefits] || benefits.basic;
  }

  /**
   * Get campaign execution summary
   */
  static getCampaignSummary() {
    const campaigns = this.generatePersonalizedCampaign();
    
    const urgencyBreakdown = campaigns.reduce((acc, campaign) => {
      acc[campaign.urgency] = (acc[campaign.urgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers: campaigns.length,
      urgencyBreakdown,
      campaigns: campaigns.map(c => ({
        email: c.email,
        name: c.name,
        plan: c.planName,
        daysSinceSignup: c.daysSinceSignup,
        urgency: c.urgency
      }))
    };
  }
}