import { db } from '../drizzle.js';
import { userStyleMemory, promptAnalysis } from '../../shared/schema.js';
import { eq, desc } from 'drizzle-orm';
import { unifiedMayaContextService } from './unified-maya-context-service.js';
export class UnifiedMayaIntelligenceService {
    intelligenceCache = new Map();
    CACHE_DURATION = 10 * 60 * 1000;
    async getUnifiedStyleIntelligence(userId, context, requestType) {
        const cacheKey = `${userId}_${requestType || 'default'}`;
        const cached = this.intelligenceCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
            console.log(`⚡ UNIFIED INTELLIGENCE: Cache hit for user ${userId}`);
            return cached.data;
        }
        console.log(`🧠 UNIFIED INTELLIGENCE: Building comprehensive intelligence for user ${userId}`);
        const startTime = Date.now();
        try {
            const userContext = context || await unifiedMayaContextService.getUnifiedMayaContext(userId);
            const [userProfile, stylePredictions, brandAlignment] = await Promise.all([
                this.buildUserStyleProfile(userId, userContext),
                this.generateStylePredictions(userId, userContext),
                this.getBrandAlignment(userContext)
            ]);
            const unifiedIntelligence = {
                userProfile,
                stylePreferences: this.extractStylePreferences(userProfile),
                learningInsights: this.generateLearningInsights(userProfile),
                stylePredictions,
                trendIntelligence: this.buildTrendIntelligence(stylePredictions, userProfile),
                seasonalInsights: this.generateSeasonalInsights(),
                brandAlignment,
                voiceGuidance: this.getVoiceGuidance(brandAlignment),
                editorialDirection: this.getEditorialDirection(),
                intelligenceConfidence: this.calculateIntelligenceConfidence(userProfile, stylePredictions),
                processingTime: Date.now() - startTime,
                cacheStatus: 'miss'
            };
            this.intelligenceCache.set(cacheKey, {
                data: unifiedIntelligence,
                timestamp: Date.now()
            });
            console.log(`✅ UNIFIED INTELLIGENCE: Complete intelligence built in ${unifiedIntelligence.processingTime}ms (confidence: ${unifiedIntelligence.intelligenceConfidence}%)`);
            return unifiedIntelligence;
        }
        catch (error) {
            console.error(`❌ UNIFIED INTELLIGENCE: Failed for user ${userId}:`, error);
            return this.createFallbackIntelligence(userId);
        }
    }
    async buildUserStyleProfile(userId, context) {
        try {
            const [styleMemory] = await db
                .select()
                .from(userStyleMemory)
                .where(eq(userStyleMemory.userId, userId))
                .limit(1);
            const recentAnalysis = await db
                .select()
                .from(promptAnalysis)
                .where(eq(promptAnalysis.userId, userId))
                .orderBy(desc(promptAnalysis.createdAt))
                .limit(20);
            const averageSuccessScore = recentAnalysis.length > 0
                ? recentAnalysis.reduce((sum, a) => sum + (parseFloat(a.successScore) || 0), 0) / recentAnalysis.length
                : 0;
            const styleEvolutionPhase = this.determineStylePhase(styleMemory?.totalInteractions || 0, styleMemory?.totalFavorites || 0, averageSuccessScore);
            return {
                preferredCategories: styleMemory?.preferredCategories || [],
                favoritePromptPatterns: styleMemory?.favoritePromptPatterns || [],
                colorPreferences: styleMemory?.colorPreferences || [],
                settingPreferences: styleMemory?.settingPreferences || [],
                stylingKeywords: styleMemory?.stylingKeywords || [],
                totalInteractions: styleMemory?.totalInteractions || 0,
                totalFavorites: styleMemory?.totalFavorites || 0,
                averageSessionLength: styleMemory?.averageSessionLength || 0,
                successScore: Math.round(averageSuccessScore * 100),
                styleEvolutionPhase,
                confidenceLevel: this.calculateConfidenceLevel(styleMemory?.totalInteractions || 0, averageSuccessScore),
                experimentationWillingness: this.calculateExperimentationWillingness(styleEvolutionPhase, averageSuccessScore)
            };
        }
        catch (error) {
            console.error(`❌ USER STYLE PROFILE: Failed to build for ${userId}:`, error);
            return this.getDefaultStyleProfile();
        }
    }
    async generateStylePredictions(userId, context) {
        try {
            const personalBrand = context.personalBrand;
            const profile = context.profile;
            const predictedStyles = this.predictStylesFromContext(personalBrand, profile);
            const personalizedTrends = this.getPersonalizedTrends(predictedStyles);
            return {
                predictedStyles,
                confidenceScores: this.calculateStyleConfidence(predictedStyles),
                reasoningBasis: this.getReasoningBasis(personalBrand, profile),
                personalizedTrends,
                trendAdoptionTimeline: this.createTrendTimeline(personalizedTrends),
                trendMixingOpportunities: this.findTrendMixingOpportunities(predictedStyles, personalizedTrends),
                styleEvolutionPath: this.createStyleEvolutionPath(predictedStyles),
                comfortZoneExpansions: this.suggestComfortZoneExpansions(predictedStyles),
                expertRecommendations: this.generateExpertRecommendations(predictedStyles)
            };
        }
        catch (error) {
            console.error(`❌ STYLE PREDICTIONS: Failed for ${userId}:`, error);
            return this.getDefaultStylePredictions();
        }
    }
    getBrandAlignment(context) {
        return {
            brandVoice: 'empowering',
            messagingStyle: [
                "Let's be real for a second...",
                "Here's the thing...",
                "Can I tell you something?",
                "Your photos are your business card now"
            ],
            businessContext: [
                'AI-powered personal branding: €47/month',
                'TRAIN → STYLE → GALLERY workflow',
                'Professional photos for entrepreneurs',
                'Visibility over vanity messaging'
            ],
            visualDirection: [
                'Magazine-inspired editorial style',
                'Professional yet approachable',
                'Luxury feel with accessibility'
            ],
            colorScheme: ['#0a0a0a', '#ffffff', '#f5f5f5', '#666666'],
            typographyGuidance: ['Times New Roman headers', 'Clean sans-serif body', 'Generous white space']
        };
    }
    determineStylePhase(interactions, favorites, successScore) {
        if (interactions < 10)
            return 'discovery';
        if (interactions < 50 && successScore < 0.6)
            return 'exploration';
        if (interactions < 100 && successScore >= 0.6)
            return 'refinement';
        return 'mastery';
    }
    calculateConfidenceLevel(interactions, successScore) {
        return Math.min(100, Math.round((interactions * 0.5) + (successScore * 50)));
    }
    calculateExperimentationWillingness(phase, successScore) {
        const phaseMultiplier = { discovery: 0.8, exploration: 1.0, refinement: 0.6, mastery: 0.4 };
        return Math.round((phaseMultiplier[phase] * 100) + (successScore * 20));
    }
    predictStylesFromContext(personalBrand, profile) {
        const styles = ['Professional Executive', 'Approachable Expert', 'Creative Professional'];
        if (personalBrand?.businessContext?.businessType) {
            styles.push(`${personalBrand.businessContext.businessType} Specialist`);
        }
        if (profile?.profession) {
            styles.push(`${profile.profession} Authority`);
        }
        return styles.slice(0, 5);
    }
    getPersonalizedTrends(predictedStyles) {
        return [
            'Authentic Professional Portraits',
            'Accessible Luxury Styling',
            'Modern Executive Presence',
            'Entrepreneurial Confidence'
        ];
    }
    calculateStyleConfidence(styles) {
        return styles.reduce((acc, style, index) => {
            acc[style] = Math.round(85 - (index * 5));
            return acc;
        }, {});
    }
    getReasoningBasis(personalBrand, profile) {
        return [
            'Personal brand alignment',
            'Professional context',
            'Business goals compatibility',
            'Target audience appeal'
        ];
    }
    createTrendTimeline(trends) {
        return trends.reduce((acc, trend, index) => {
            const timeline = ['Current', 'Next 2 weeks', 'Next month', 'Next season'][index] || 'Future';
            acc[trend] = timeline;
            return acc;
        }, {});
    }
    findTrendMixingOpportunities(styles, trends) {
        return [
            `Combine ${styles[0]} with ${trends[0]}`,
            `Integrate ${styles[1]} and ${trends[1]}`,
            `Blend ${styles[2]} with modern elements`
        ];
    }
    createStyleEvolutionPath(styles) {
        return [
            `Start with ${styles[0]}`,
            `Develop comfort with ${styles[1]}`,
            `Master ${styles[2]}`,
            'Explore advanced variations'
        ];
    }
    suggestComfortZoneExpansions(styles) {
        return [
            'Try one bold color accent',
            'Experiment with different settings',
            'Add personality through accessories',
            'Incorporate trending styling elements'
        ];
    }
    generateExpertRecommendations(styles) {
        return [
            `Focus on ${styles[0]} for maximum impact`,
            'Build style consistency across sessions',
            'Document your favorite results',
            'Plan seasonal style evolution'
        ];
    }
    extractStylePreferences(profile) {
        return {
            weights: profile.preferredCategories.reduce((acc, cat, i) => {
                acc[cat] = 100 - (i * 10);
                return acc;
            }, {}),
            categories: profile.preferredCategories,
            colors: profile.colorPreferences,
            settings: profile.settingPreferences,
            keywords: profile.stylingKeywords
        };
    }
    generateLearningInsights(profile) {
        return {
            topPatterns: profile.favoritePromptPatterns.slice(0, 3),
            successFactors: ['Consistent style preferences', 'Clear vision', 'Professional focus'],
            improvementAreas: profile.successScore < 70 ? ['Style exploration', 'Concept refinement'] : [],
            nextLevelSuggestions: this.getNextLevelSuggestions(profile.styleEvolutionPhase)
        };
    }
    getNextLevelSuggestions(phase) {
        const suggestions = {
            discovery: ['Try different categories', 'Experiment with Maya suggestions'],
            exploration: ['Focus on favorites', 'Build style consistency'],
            refinement: ['Master advanced techniques', 'Develop signature style'],
            mastery: ['Mentor others', 'Innovate new approaches']
        };
        return suggestions[phase] || [];
    }
    buildTrendIntelligence(predictions, profile) {
        return {
            currentTrends: predictions.personalizedTrends,
            emergingTrends: ['Sustainable Professional Styling', 'Hybrid Work Presence', 'Authentic Authority'],
            personalTrendFit: predictions.personalizedTrends.reduce((acc, trend, i) => {
                acc[trend] = 90 - (i * 10);
                return acc;
            }, {}),
            trendAdoptionStrategy: ['Start with one trend', 'Integrate gradually', 'Make it personal']
        };
    }
    generateSeasonalInsights() {
        const currentSeason = this.getCurrentSeason();
        return {
            currentSeasonOptimal: this.getSeasonalStyles(currentSeason),
            upcomingSeasonPrep: this.getSeasonalStyles(this.getNextSeason(currentSeason)),
            weatherConsiderations: ['Indoor professional settings', 'Natural lighting optimization'],
            eventOpportunities: ['Conference season', 'Networking events', 'Speaking engagements']
        };
    }
    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4)
            return 'Spring';
        if (month >= 5 && month <= 7)
            return 'Summer';
        if (month >= 8 && month <= 10)
            return 'Fall';
        return 'Winter';
    }
    getSeasonalStyles(season) {
        const styles = {
            Spring: ['Fresh professional looks', 'Light layering', 'Renewed energy styling'],
            Summer: ['Confident warm weather presence', 'Natural lighting optimization'],
            Fall: ['Executive authority', 'Rich professional tones', 'Conference ready'],
            Winter: ['Sophisticated indoor presence', 'Holiday networking ready']
        };
        return styles[season] || [];
    }
    getNextSeason(current) {
        const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
        const index = seasons.indexOf(current);
        return seasons[(index + 1) % 4];
    }
    getVoiceGuidance(brandAlignment) {
        return {
            conversationalTone: brandAlignment.messagingStyle,
            messagingApproach: ['Empowering but grounded', 'Bold and direct', 'Relatable struggles'],
            encouragementStyle: ['Best friend energy', 'No toxic positivity', 'Real experience'],
            expertiseLevel: ['Lived experience authority', 'Practical wisdom', 'Supportive guidance']
        };
    }
    getEditorialDirection() {
        return {
            visualHierarchy: ['Large serif headers', 'Editorial spacing', 'Magazine proportions'],
            componentStyling: ['Clean borders', 'Hover transformations', 'Luxury transitions'],
            colorPalette: ['Editorial blacks', 'Pure whites', 'Soft grays'],
            layoutPrinciples: ['12-column grid', 'Generous white space', 'Professional elegance']
        };
    }
    calculateIntelligenceConfidence(profile, predictions) {
        const dataPoints = profile.totalInteractions + profile.totalFavorites;
        const successWeight = profile.successScore;
        const predictionWeight = predictions.predictedStyles.length * 10;
        return Math.min(100, Math.round((dataPoints * 0.5) + (successWeight * 0.3) + (predictionWeight * 0.2)));
    }
    createFallbackIntelligence(userId) {
        return {
            userProfile: this.getDefaultStyleProfile(),
            stylePreferences: { weights: {}, categories: [], colors: [], settings: [], keywords: [] },
            learningInsights: { topPatterns: [], successFactors: [], improvementAreas: [], nextLevelSuggestions: [] },
            stylePredictions: this.getDefaultStylePredictions(),
            trendIntelligence: { currentTrends: [], emergingTrends: [], personalTrendFit: {}, trendAdoptionStrategy: [] },
            seasonalInsights: { currentSeasonOptimal: [], upcomingSeasonPrep: [], weatherConsiderations: [], eventOpportunities: [] },
            brandAlignment: this.getBrandAlignment({}),
            voiceGuidance: { conversationalTone: [], messagingApproach: [], encouragementStyle: [], expertiseLevel: [] },
            editorialDirection: this.getEditorialDirection(),
            intelligenceConfidence: 0,
            processingTime: 0,
            cacheStatus: 'miss'
        };
    }
    getDefaultStyleProfile() {
        return {
            preferredCategories: ['Professional', 'Business', 'Executive'],
            favoritePromptPatterns: [],
            colorPreferences: [],
            settingPreferences: [],
            stylingKeywords: [],
            totalInteractions: 0,
            totalFavorites: 0,
            averageSessionLength: 0,
            successScore: 0,
            styleEvolutionPhase: 'discovery',
            confidenceLevel: 0,
            experimentationWillingness: 80
        };
    }
    getDefaultStylePredictions() {
        return {
            predictedStyles: ['Professional Executive', 'Approachable Expert'],
            confidenceScores: { 'Professional Executive': 85, 'Approachable Expert': 80 },
            reasoningBasis: ['New user defaults', 'Professional context'],
            personalizedTrends: ['Authentic Professional Presence'],
            trendAdoptionTimeline: { 'Authentic Professional Presence': 'Current' },
            trendMixingOpportunities: [],
            styleEvolutionPath: ['Start with professional basics'],
            comfortZoneExpansions: ['Try Maya suggestions'],
            expertRecommendations: ['Focus on building confidence']
        };
    }
    clearUserIntelligenceCache(userId) {
        const keysToDelete = Array.from(this.intelligenceCache.keys()).filter(key => key.startsWith(userId));
        keysToDelete.forEach(key => this.intelligenceCache.delete(key));
        console.log(`🗑️ UNIFIED INTELLIGENCE: Cleared cache for user ${userId}`);
    }
    getIntelligenceCacheStats() {
        const totalCached = this.intelligenceCache.size;
        return {
            totalCached,
            hitRate: 0,
            avgProcessingTime: 0
        };
    }
}
export const unifiedMayaIntelligenceService = new UnifiedMayaIntelligenceService();
//# sourceMappingURL=unified-maya-intelligence-service.js.map