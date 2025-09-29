import cron from 'node-cron';
import { db } from '../drizzle.js';
import { sql } from 'drizzle-orm';
class SophiaTrendAnalyzer {
    apiKey;
    isRunning = false;
    constructor() {
        this.apiKey = process.env['ANTHROPIC_API_KEY'];
        if (!this.apiKey) {
            console.error('❌ ANTHROPIC_API_KEY not configured for Sophia trends');
        }
    }
    async analyzeTrends() {
        try {
            console.log('🔍 Sophia analyzing hair & beauty trends...');
            const sophiaSystemPrompt = `You are Sophia, SSELFIE Studio's AI Trend Analyst specializing in hair and beauty trends.

MISSION: Analyze current hair, beauty, and social media trends for professional hairstylists and beauty creators.

ANALYSIS FOCUS:
1. Hair Styling Trends (cuts, textures, lengths)
2. Color Trends (techniques, palettes, seasonal shifts)
3. Beauty Techniques (makeup, skincare, application methods)
4. Social Media Insights (viral styles, hashtag trends, platform preferences)

OUTPUT FORMAT:
Provide a comprehensive weekly analysis in this JSON structure:
{
  "trends": {
    "hairStyles": ["trend 1", "trend 2", "trend 3"],
    "colorTrends": ["color trend 1", "color trend 2", "color trend 3"], 
    "techniques": ["technique 1", "technique 2", "technique 3"],
    "socialMediaInsights": ["insight 1", "insight 2", "insight 3"]
  },
  "summary": "2-3 paragraph executive summary of key trends",
  "confidence": 85,
  "analysis_timestamp": "${new Date().toISOString()}"
}

EXPERTISE CONTEXT:
- Focus on trends that translate well to AI photo generation
- Include specific styling terminology that photographers understand
- Highlight trends that work across different demographics
- Consider seasonal and cultural factors in trend analysis
- Emphasize practical application for content creators

Current date: ${new Date().toLocaleDateString()}
Week of: ${this.getWeekRange()}`;
            const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 4000,
                    messages: [{
                            role: 'user',
                            content: `Analyze current hair and beauty trends for the week of ${this.getWeekRange()}. Include viral social media styles, emerging techniques, seasonal color trends, and practical applications for content creators. Focus on trends that photograph well and translate to AI-generated professional photos.`
                        }],
                    system: sophiaSystemPrompt
                })
            });
            if (!claudeResponse.ok) {
                throw new Error(`Sophia API error: ${claudeResponse.status}`);
            }
            const claudeData = await claudeResponse.json();
            const responseText = claudeData.content[0].text;
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in Sophia response');
            }
            const analysisData = JSON.parse(jsonMatch[0]);
            console.log('✅ Sophia trend analysis completed:', {
                trendsCount: Object.keys(analysisData.trends).length,
                confidence: analysisData.confidence,
                summaryLength: analysisData.summary.length
            });
            return analysisData;
        }
        catch (error) {
            console.error('❌ Sophia trend analysis failed:', error);
            return null;
        }
    }
    async storeTrends(analysisData) {
        try {
            const trendData = {
                week: this.getWeekRange(),
                trends: analysisData.trends,
                summary: analysisData.summary,
                confidence: analysisData.confidence,
                sources: ['Claude AI Analysis', 'Social Media Monitoring', 'Industry Research']
            };
            await db.execute(sql `
        CREATE TABLE IF NOT EXISTS hair_trends (
          id SERIAL PRIMARY KEY,
          week_range VARCHAR(50) NOT NULL,
          trend_data JSONB NOT NULL,
          summary TEXT NOT NULL,
          confidence INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(week_range)
        )
      `);
            await db.execute(sql `
        INSERT INTO hair_trends (week_range, trend_data, summary, confidence)
        VALUES (${trendData.week}, ${JSON.stringify(trendData)}, ${trendData.summary}, ${trendData.confidence})
        ON CONFLICT (week_range) 
        DO UPDATE SET 
          trend_data = EXCLUDED.trend_data,
          summary = EXCLUDED.summary,
          confidence = EXCLUDED.confidence,
          created_at = NOW()
      `);
            console.log('✅ Hair trends stored successfully for week:', trendData.week);
            return true;
        }
        catch (error) {
            console.error('❌ Failed to store hair trends:', error);
            return false;
        }
    }
    async runWeeklyAnalysis() {
        if (this.isRunning) {
            console.log('⚠️ Sophia trend analysis already running, skipping...');
            return;
        }
        this.isRunning = true;
        try {
            console.log('🚀 Starting Sophia weekly hair & beauty trend analysis...');
            const analysisData = await this.analyzeTrends();
            if (!analysisData) {
                throw new Error('Failed to get trend analysis from Sophia');
            }
            const stored = await this.storeTrends(analysisData);
            if (!stored) {
                throw new Error('Failed to store trend analysis');
            }
            console.log('🎉 Sophia weekly trend analysis completed successfully!');
        }
        catch (error) {
            console.error('💥 Sophia weekly trend analysis failed:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    getWeekRange() {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const formatDate = (date) => date.toISOString().split('T')[0];
        return `${formatDate(startOfWeek)} to ${formatDate(endOfWeek)}`;
    }
    async runManualAnalysis() {
        if (process.env['NODE_ENV'] === 'production') {
            console.log('❌ Manual analysis not available in production');
            return;
        }
        console.log('🔧 Running manual Sophia trend analysis...');
        await this.runWeeklyAnalysis();
    }
}
const sophia = new SophiaTrendAnalyzer();
const scheduleTrendAnalysis = () => {
    if (!process.env['ANTHROPIC_API_KEY']) {
        console.log('⚠️ Skipping Sophia trend scheduling - API key not configured');
        return;
    }
    cron.schedule('0 9 * * 1', async () => {
        console.log('⏰ Scheduled Sophia trend analysis triggered');
        await sophia.runWeeklyAnalysis();
    }, {
        timezone: 'UTC',
        status: 'pending',
        dependencies: [],
        assignedAgent: 'sophia',
        priority: 'medium',
        metadata: {}
    });
    console.log('✅ Sophia weekly trend analysis scheduled (Mondays 9 AM UTC)');
    if (process.env['NODE_ENV'] === 'development') {
        cron.schedule('*/5 * * * *', async () => {
            console.log('🔧 Development: Running Sophia trend analysis...');
            await sophia.runWeeklyAnalysis();
        }, {
            status: 'pending',
            dependencies: [],
            assignedAgent: 'sophia',
            priority: 'low',
            metadata: {}
        });
    }
};
export { sophia, scheduleTrendAnalysis };
export default sophia;
//# sourceMappingURL=fetch-hair-trends.js.map