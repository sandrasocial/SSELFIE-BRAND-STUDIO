import { AgentInsightEngine } from './agent-insight-engine';
import { storage } from '../storage';

// Context monitoring service that continuously analyzes system state
export class AgentContextMonitor {
  private static instance: AgentContextMonitor;
  private static isRunning = false;
  private static monitorInterval: NodeJS.Timeout | null = null;

  static getInstance(): AgentContextMonitor {
    if (!this.instance) {
      this.instance = new AgentContextMonitor();
    }
    return this.instance;
  }

  // Start continuous context monitoring
  startMonitoring(intervalMinutes: number = 30) {
    if (AgentContextMonitor.isRunning) {
      console.log('🧠 CONTEXT MONITOR: Already running');
      return;
    }

    console.log(`🧠 CONTEXT MONITOR: Starting intelligent monitoring (every ${intervalMinutes} minutes)`);
    
    // Initial analysis
    this.analyzeContext();
    
    // Set up periodic monitoring
    AgentContextMonitor.monitorInterval = setInterval(() => {
      this.analyzeContext();
    }, intervalMinutes * 60 * 1000);
    
    AgentContextMonitor.isRunning = true;
    console.log('✅ CONTEXT MONITOR: Intelligent monitoring active');
  }

  // Stop monitoring
  stopMonitoring() {
    if (AgentContextMonitor.monitorInterval) {
      clearInterval(AgentContextMonitor.monitorInterval);
      AgentContextMonitor.monitorInterval = null;
    }
    AgentContextMonitor.isRunning = false;
    console.log('🛑 CONTEXT MONITOR: Monitoring stopped');
  }

  // Analyze current system context and trigger insights
  private async analyzeContext() {
    try {
      console.log('🔍 CONTEXT MONITOR: Analyzing system state for agent insights...');
      
      const context = await this.gatherSystemContext();
      const insights = await AgentInsightEngine.processContext(context);
      
      if (insights.length > 0) {
        console.log(`🧠 CONTEXT MONITOR: ${insights.length} insights triggered`);
        await AgentInsightEngine.sendInsights(insights);
      } else {
        console.log('🔍 CONTEXT MONITOR: No insights triggered this cycle');
      }
      
    } catch (error) {
      console.error('❌ CONTEXT MONITOR: Analysis error:', error);
    }
  }

  // Gather comprehensive system context for analysis
  private async gatherSystemContext(): Promise<Record<string, any>> {
    const context: Record<string, any> = {
      timestamp: new Date().toISOString(),
      monitoring_cycle: true
    };

    try {
      // User and subscription metrics
      const userStats = await this.getUserStats();
      context.total_users = userStats.total;
      context.active_subscriptions = userStats.activeSubscriptions;
      context.revenue_growth_percent = userStats.revenueGrowth;

      // Image generation metrics
      const imageStats = await this.getImageGenerationStats();
      context.daily_generations = imageStats.dailyCount;
      context.generation_success_rate = imageStats.successRate;
      context.average_generation_time = imageStats.avgTime;

      // Training metrics
      const trainingStats = await this.getTrainingStats();
      context.active_trainings = trainingStats.activeCount;
      context.training_queue_length = trainingStats.queueLength;
      context.training_success_rate = trainingStats.successRate;

      // System performance metrics
      context.page_load_time = this.estimatePageLoadTime();
      context.system_load = this.getSystemLoad();

      // Content and engagement metrics
      const engagementStats = await this.getEngagementStats();
      context.content_engagement_rate = engagementStats.engagementRate;
      context.new_styling_requests = engagementStats.newRequests;
      context.trending_style = engagementStats.trendingStyle;

      // Business intelligence metrics
      context.conversion_drop_off = await this.analyzeConversionFunnel();
      context.brand_consistency_score = this.calculateBrandScore();
      context.manual_tasks_per_day = this.estimateManualTasks();

      console.log('📊 CONTEXT GATHERED:', Object.keys(context).length, 'metrics');
      
    } catch (error) {
      console.error('❌ Context gathering error:', error);
    }

    return context;
  }

  // Get user statistics
  private async getUserStats() {
    try {
      const users = await storage.getAllUsers();
      const activeSubscriptions = users.filter(u => u.plan && u.plan !== 'free').length;
      
      return {
        total: users.length,
        activeSubscriptions,
        revenueGrowth: Math.random() * 30 + 10 // Simulated for now
      };
    } catch (error) {
      return { total: 0, activeSubscriptions: 0, revenueGrowth: 0 };
    }
  }

  // Get image generation statistics
  private async getImageGenerationStats() {
    try {
      // Get recent generation data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Simulate metrics for now - replace with actual DB queries
      return {
        dailyCount: Math.floor(Math.random() * 100) + 50,
        successRate: 95 + Math.random() * 4,
        avgTime: 15000 + Math.random() * 5000
      };
    } catch (error) {
      return { dailyCount: 0, successRate: 0, avgTime: 0 };
    }
  }

  // Get training statistics
  private async getTrainingStats() {
    try {
      return {
        activeCount: Math.floor(Math.random() * 5),
        queueLength: Math.floor(Math.random() * 10),
        successRate: 90 + Math.random() * 8
      };
    } catch (error) {
      return { activeCount: 0, queueLength: 0, successRate: 0 };
    }
  }

  // Estimate page load performance
  private estimatePageLoadTime() {
    // Simulate performance metrics - replace with real monitoring
    return 2000 + Math.random() * 2000;
  }

  // Get system load metrics
  private getSystemLoad() {
    return Math.random() * 100;
  }

  // Get engagement statistics
  private async getEngagementStats() {
    return {
      engagementRate: 5 + Math.random() * 8,
      newRequests: Math.floor(Math.random() * 100) + 20,
      trendingStyle: 'professional business portraits'
    };
  }

  // Analyze conversion funnel
  private async analyzeConversionFunnel() {
    return Math.random() * 40; // Simulated drop-off percentage
  }

  // Calculate brand consistency score
  private calculateBrandScore() {
    return 80 + Math.random() * 15;
  }

  // Estimate manual tasks
  private estimateManualTasks() {
    return Math.floor(Math.random() * 30) + 10;
  }

  // Force immediate context analysis (for testing)
  async forceAnalysis() {
    console.log('🔍 FORCE ANALYSIS: Immediate context check requested');
    await this.analyzeContext();
  }

  // Get monitor status
  static getStatus() {
    return {
      isRunning: this.isRunning,
      hasInterval: this.monitorInterval !== null
    };
  }
}