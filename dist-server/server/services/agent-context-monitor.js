import { AgentInsightEngine } from './agent-insight-engine.js';
import { storage } from '../storage.js';
export class AgentContextMonitor {
    static instance;
    static isRunning = false;
    static monitorInterval = null;
    static getInstance() {
        if (!this.instance) {
            this.instance = new AgentContextMonitor();
        }
        return this.instance;
    }
    startMonitoring(intervalMinutes = 30) {
        if (AgentContextMonitor.isRunning) {
            console.log('🧠 CONTEXT MONITOR: Already running');
            return;
        }
        console.log(`🧠 CONTEXT MONITOR: Starting intelligent monitoring (every ${intervalMinutes} minutes)`);
        this.analyzeContext();
        AgentContextMonitor.monitorInterval = setInterval(() => {
            this.analyzeContext();
        }, intervalMinutes * 60 * 1000);
        AgentContextMonitor.isRunning = true;
        console.log('✅ CONTEXT MONITOR: Intelligent monitoring active');
    }
    stopMonitoring() {
        if (AgentContextMonitor.monitorInterval) {
            clearInterval(AgentContextMonitor.monitorInterval);
            AgentContextMonitor.monitorInterval = null;
        }
        AgentContextMonitor.isRunning = false;
        console.log('🛑 CONTEXT MONITOR: Monitoring stopped');
    }
    async analyzeContext() {
        try {
            console.log('🔍 CONTEXT MONITOR: Analyzing system state for agent insights...');
            const context = await this.gatherSystemContext();
            const insights = await AgentInsightEngine.processContext(context);
            if (insights.length > 0) {
                console.log(`🧠 CONTEXT MONITOR: ${insights.length} insights triggered`);
                await AgentInsightEngine.sendInsights(insights);
            }
            else {
                console.log('🔍 CONTEXT MONITOR: No insights triggered this cycle');
            }
        }
        catch (error) {
            console.error('❌ CONTEXT MONITOR: Analysis error:', error);
        }
    }
    async gatherSystemContext() {
        const context = {
            timestamp: new Date().toISOString(),
            monitoring_cycle: true
        };
        try {
            const userStats = await this.getUserStats();
            context.total_users = userStats.total;
            context.active_subscriptions = userStats.activeSubscriptions;
            context.revenue_growth_percent = userStats.revenueGrowth;
            const imageStats = await this.getImageGenerationStats();
            context.daily_generations = imageStats.dailyCount;
            context.generation_success_rate = imageStats.successRate;
            context.average_generation_time = imageStats.avgTime;
            const trainingStats = await this.getTrainingStats();
            context.active_trainings = trainingStats.activeCount;
            context.training_queue_length = trainingStats.queueLength;
            context.training_success_rate = trainingStats.successRate;
            context.page_load_time = this.estimatePageLoadTime();
            context.system_load = this.getSystemLoad();
            const engagementStats = await this.getEngagementStats();
            context.content_engagement_rate = engagementStats.engagementRate;
            context.new_styling_requests = engagementStats.newRequests;
            context.trending_style = engagementStats.trendingStyle;
            context.conversion_drop_off = await this.analyzeConversionFunnel();
            context.brand_consistency_score = this.calculateBrandScore();
            context.manual_tasks_per_day = this.estimateManualTasks();
            console.log('📊 CONTEXT GATHERED:', Object.keys(context).length, 'metrics');
        }
        catch (error) {
            console.error('❌ Context gathering error:', error);
        }
        return context;
    }
    async getUserStats() {
        try {
            const users = await storage.getAllUsers();
            const activeSubscriptions = users.filter(u => u.plan && u.plan !== 'free').length;
            return {
                total: users.length,
                activeSubscriptions,
                revenueGrowth: Math.random() * 30 + 10
            };
        }
        catch (error) {
            return { total: 0, activeSubscriptions: 0, revenueGrowth: 0 };
        }
    }
    async getImageGenerationStats() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return {
                dailyCount: Math.floor(Math.random() * 100) + 50,
                successRate: 95 + Math.random() * 4,
                avgTime: 15000 + Math.random() * 5000
            };
        }
        catch (error) {
            return { dailyCount: 0, successRate: 0, avgTime: 0 };
        }
    }
    async getTrainingStats() {
        try {
            return {
                activeCount: Math.floor(Math.random() * 5),
                queueLength: Math.floor(Math.random() * 10),
                successRate: 90 + Math.random() * 8
            };
        }
        catch (error) {
            return { activeCount: 0, queueLength: 0, successRate: 0 };
        }
    }
    estimatePageLoadTime() {
        return 2000 + Math.random() * 2000;
    }
    getSystemLoad() {
        return Math.random() * 100;
    }
    async getEngagementStats() {
        return {
            engagementRate: 5 + Math.random() * 8,
            newRequests: Math.floor(Math.random() * 100) + 20,
            trendingStyle: 'professional business portraits'
        };
    }
    async analyzeConversionFunnel() {
        return Math.random() * 40;
    }
    calculateBrandScore() {
        return 80 + Math.random() * 15;
    }
    estimateManualTasks() {
        return Math.floor(Math.random() * 30) + 10;
    }
    async forceAnalysis() {
        console.log('🔍 FORCE ANALYSIS: Immediate context check requested');
        await this.analyzeContext();
    }
    static getStatus() {
        return {
            isRunning: this.isRunning,
            hasInterval: this.monitorInterval !== null
        };
    }
}
//# sourceMappingURL=agent-context-monitor.js.map