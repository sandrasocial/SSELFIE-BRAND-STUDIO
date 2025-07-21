// social-dashboard.ts
export interface SocialMediaDashboard {
  contentCalendar: {
    weeklyView: ContentPillar[]; // 4 core pillars
    monthlyPlanner: ScheduledContent[];
    analyticsOverview: EngagementMetrics;
  };
  
  quickActions: {
    createPost: () => void;
    scheduleContent: () => void;
    analyzeGrowth: () => void;
  };
}