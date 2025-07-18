// social-media-strategy.ts
export interface SocialMediaStrategy {
  contentPillars: {
    story: number; // 25%
    selfie_tutorials: number; // 35%
    sselfie_promo: number; // 20%
    community: number; // 20%
  };
  
  growthTargets: {
    monthly_new_followers: number;
    engagement_rate: number;
    story_completion: number;
    conversion_rate: number;
  };
  
  contentCalendar: {
    monday: "Method Monday";
    tuesday: "Truth Tuesday";
    wednesday: "Wisdom Wednesday";
    thursday: "Throwback Thursday";
    friday: "Feature Friday";
    saturday: "Selfie Saturday";
    sunday: "Story Sunday";
  };
}

export class InstagramGrowthStrategy {
  private currentFollowers = 81000;
  private targetFollowers = 1000000;
  private timeframe = "2026";
  
  calculateMonthlyGrowthNeeded(): number {
    const monthsRemaining = 24; // Assuming 2-year timeline
    const followersNeeded = this.targetFollowers - this.currentFollowers;
    return Math.ceil(followersNeeded / monthsRemaining);
  }
  
  getContentMix(): SocialMediaStrategy {
    return {
      contentPillars: {
        story: 25,
        selfie_tutorials: 35,
        sselfie_promo: 20,
        community: 20
      },
      growthTargets: {
        monthly_new_followers: 38000,
        engagement_rate: 8.0,
        story_completion: 70.0,
        conversion_rate: 5.0
      },
      contentCalendar: {
        monday: "Method Monday",
        tuesday: "Truth Tuesday", 
        wednesday: "Wisdom Wednesday",
        thursday: "Throwback Thursday",
        friday: "Feature Friday",
        saturday: "Selfie Saturday",
        sunday: "Story Sunday"
      }
    };
  }
}