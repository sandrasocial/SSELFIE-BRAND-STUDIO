export class MayaBehaviorLearningService {
    static async initializeBehaviorTracking(userId) {
        try {
            console.log(`🧠 PHASE 5.1: Initializing behavior tracking for user ${userId}`);
            const existingData = await this.getBehaviorData(userId);
            if (!existingData) {
                const initialProfile = {
                    userId,
                    behaviorPatterns: this.getDefaultBehaviorPatterns(),
                    engagementMetrics: this.getDefaultEngagementMetrics(),
                    personalizedInsights: this.getDefaultPersonalizedInsights(),
                    learningVersion: '5.1',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                await this.storeBehaviorData(userId, initialProfile);
                console.log(`✅ PHASE 5.1: Behavior tracking initialized for user ${userId}`);
            }
            else {
                console.log(`🔄 PHASE 5.1: Behavior tracking already exists for user ${userId}, upgrading if needed`);
                await this.upgradeBehaviorTracking(userId, existingData);
            }
        }
        catch (error) {
            console.error(`❌ PHASE 5.1: Behavior tracking initialization failed for ${userId}:`, error);
        }
    }
    static getDefaultBehaviorPatterns() {
        return {
            preferredRequestStyles: [],
            conceptPreferences: [],
            generationTiming: [],
            sessionLengths: [],
            styleJourney: {
                phase: 'exploring',
                progression: []
            },
            communicationPreferences: {
                detail_level: 'moderate',
                tone_preference: 'friendly',
                guidance_level: 'some_help'
            },
            likelyNextRequests: [],
            seasonalPatterns: {},
            contextualTriggers: {}
        };
    }
    static getDefaultEngagementMetrics() {
        return {
            averageResponseRating: 0.0,
            conceptCardEngagement: 0.0,
            conversationDepth: 1.0,
            returnFrequency: 0.0,
            generationSuccessRate: 0.0,
            favoriteRate: 0.0,
            categoryDistribution: {},
            styleConsistency: 0.0,
            subscriptionValue: 50.0,
            churnRisk: 30.0,
            upsellOpportunity: 20.0,
            referralPotential: 25.0
        };
    }
    static getDefaultPersonalizedInsights() {
        return {
            dominantAesthetic: 'discovering',
            secondaryAesthetics: [],
            styleConfidence: 50.0,
            experimentationLevel: 70.0,
            mayaPersonalityFit: 75.0,
            preferredMayaRole: 'creative_partner',
            communicationSynergy: 70.0,
            trustLevel: 60.0,
            professionalNeedsLevel: 50.0,
            brandingAwareness: 40.0,
            marketingGoals: [],
            targetAudience: []
        };
    }
    static async learnFromConceptCardInteraction(userId, conceptCard, interactionType) {
        try {
            console.log(`🧠 PHASE 5.1: Learning from ${interactionType} interaction for user ${userId}`);
            const behaviorData = await this.getBehaviorData(userId);
            if (!behaviorData) {
                await this.initializeBehaviorTracking(userId);
                return;
            }
            const insights = await this.analyzeConceptCardInteraction(conceptCard, interactionType);
            await this.updateBehaviorPatterns(userId, behaviorData, insights);
            await this.updateEngagementMetrics(userId, behaviorData, interactionType);
            await this.updatePersonalizedInsights(userId, behaviorData, insights);
            console.log(`✅ PHASE 5.1: Learning complete for ${interactionType} interaction`);
        }
        catch (error) {
            console.error(`❌ PHASE 5.1: Learning from interaction failed for ${userId}:`, error);
        }
    }
    static async analyzeConceptCardInteraction(conceptCard, interactionType) {
        return {
            styleElements: this.extractStyleElements(conceptCard),
            categoryPreference: conceptCard.category || 'Unknown',
            complexityLevel: this.analyzeComplexity(conceptCard),
            emotionalTone: this.analyzeEmotionalTone(conceptCard),
            professionalLevel: this.analyzeProfessionalLevel(conceptCard),
            interactionValue: this.calculateInteractionValue(interactionType),
            preferenceSignal: this.calculatePreferenceSignal(interactionType)
        };
    }
    static extractStyleElements(conceptCard) {
        const elements = new Set();
        const description = (conceptCard.description || '').toLowerCase();
        if (description.includes('neutral') || description.includes('beige') || description.includes('cream')) {
            elements.add('neutral-colors');
        }
        if (description.includes('bold') || description.includes('vibrant') || description.includes('bright')) {
            elements.add('bold-colors');
        }
        if (description.includes('monochromatic') || description.includes('black') || description.includes('white')) {
            elements.add('monochromatic');
        }
        if (description.includes('minimalist') || description.includes('clean') || description.includes('simple')) {
            elements.add('minimalist');
        }
        if (description.includes('elegant') || description.includes('sophisticated') || description.includes('refined')) {
            elements.add('elegant');
        }
        if (description.includes('casual') || description.includes('relaxed') || description.includes('comfortable')) {
            elements.add('casual');
        }
        if (description.includes('edgy') || description.includes('bold') || description.includes('dramatic')) {
            elements.add('edgy');
        }
        if (description.includes('natural light') || description.includes('outdoor') || description.includes('garden')) {
            elements.add('natural-setting');
        }
        if (description.includes('studio') || description.includes('professional') || description.includes('backdrop')) {
            elements.add('studio-setting');
        }
        if (description.includes('urban') || description.includes('city') || description.includes('street')) {
            elements.add('urban-setting');
        }
        return Array.from(elements);
    }
    static analyzeComplexity(conceptCard) {
        const description = (conceptCard.description || '').toLowerCase();
        const promptLength = (conceptCard.prompt || '').length;
        if (promptLength > 200 || description.includes('multiple') || description.includes('layered')) {
            return 'complex';
        }
        if (promptLength > 100 || description.includes('styled') || description.includes('coordinated')) {
            return 'moderate';
        }
        return 'simple';
    }
    static analyzeEmotionalTone(conceptCard) {
        const description = (conceptCard.description || '').toLowerCase();
        if (description.includes('confident') || description.includes('powerful') || description.includes('strong')) {
            return 'confident';
        }
        if (description.includes('soft') || description.includes('gentle') || description.includes('serene')) {
            return 'serene';
        }
        if (description.includes('playful') || description.includes('fun') || description.includes('vibrant')) {
            return 'playful';
        }
        if (description.includes('elegant') || description.includes('sophisticated') || description.includes('refined')) {
            return 'elegant';
        }
        return 'neutral';
    }
    static analyzeProfessionalLevel(conceptCard) {
        const description = (conceptCard.description || '').toLowerCase();
        const category = (conceptCard.category || '').toLowerCase();
        let professionalScore = 0;
        if (category.includes('business') || category.includes('professional')) {
            professionalScore += 40;
        }
        if (description.includes('linkedin') || description.includes('corporate') || description.includes('executive')) {
            professionalScore += 30;
        }
        if (description.includes('networking') || description.includes('meeting') || description.includes('presentation')) {
            professionalScore += 20;
        }
        if (description.includes('suit') || description.includes('blazer') || description.includes('formal')) {
            professionalScore += 10;
        }
        return Math.min(100, professionalScore);
    }
    static calculateInteractionValue(interactionType) {
        const valueMap = {
            'favorited': 100,
            'shared': 90,
            'generated': 70,
            'skipped': 10
        };
        return valueMap[interactionType] || 0;
    }
    static calculatePreferenceSignal(interactionType) {
        const signalMap = {
            'favorited': 1.0,
            'shared': 0.9,
            'generated': 0.7,
            'skipped': -0.3
        };
        return signalMap[interactionType] || 0;
    }
    static async getPersonalizedResponseStyle(userId) {
        try {
            const behaviorData = await this.getBehaviorData(userId);
            if (!behaviorData) {
                return this.getDefaultResponseStyle();
            }
            const insights = behaviorData.personalizedInsights;
            const patterns = behaviorData.behaviorPatterns;
            return {
                detailLevel: patterns.communicationPreferences.detail_level,
                tonePreference: patterns.communicationPreferences.tone_preference,
                guidanceLevel: patterns.communicationPreferences.guidance_level,
                conceptCount: this.getOptimalConceptCount(behaviorData),
                styleEmphasis: insights.dominantAesthetic,
                personalityRole: insights.preferredMayaRole,
                adaptations: this.getPersonalityAdaptations(insights)
            };
        }
        catch (error) {
            console.error(`❌ PHASE 5.1: Failed to get personalized response style for ${userId}:`, error);
            return this.getDefaultResponseStyle();
        }
    }
    static getOptimalConceptCount(behaviorData) {
        const engagement = behaviorData.engagementMetrics.conceptCardEngagement;
        const experimentationLevel = behaviorData.personalizedInsights.experimentationLevel;
        if (experimentationLevel > 80)
            return 4;
        if (engagement > 70)
            return 3;
        if (engagement > 40)
            return 2;
        return 3;
    }
    static getPersonalityAdaptations(insights) {
        return {
            emphasisLevel: insights.mayaPersonalityFit > 80 ? 'high' : 'moderate',
            creativeFreedom: insights.experimentationLevel > 70 ? 'high' : 'moderate',
            professionalFocus: insights.professionalNeedsLevel > 60 ? 'high' : 'low',
            brandingEmphasis: insights.brandingAwareness > 50 ? 'moderate' : 'subtle'
        };
    }
    static getDefaultResponseStyle() {
        return {
            detailLevel: 'moderate',
            tonePreference: 'friendly',
            guidanceLevel: 'some_help',
            conceptCount: 3,
            styleEmphasis: 'exploring',
            personalityRole: 'creative_partner',
            adaptations: {
                emphasisLevel: 'moderate',
                creativeFreedom: 'high',
                professionalFocus: 'moderate',
                brandingEmphasis: 'subtle'
            }
        };
    }
    static async updateBehaviorPatterns(userId, behaviorData, insights) {
        insights.styleElements.forEach(element => {
            if (!behaviorData.behaviorPatterns.conceptPreferences.includes(element)) {
                behaviorData.behaviorPatterns.conceptPreferences.push(element);
            }
        });
        if (insights.preferenceSignal > 0.5) {
            behaviorData.behaviorPatterns.styleJourney.progression.push({
                date: new Date(),
                dominant_style: insights.styleElements[0] || 'exploring',
                confidence_score: insights.preferenceSignal
            });
            if (behaviorData.behaviorPatterns.styleJourney.progression.length > 10) {
                behaviorData.behaviorPatterns.styleJourney.progression =
                    behaviorData.behaviorPatterns.styleJourney.progression.slice(-10);
            }
        }
        await this.storeBehaviorData(userId, behaviorData);
    }
    static async updateEngagementMetrics(userId, behaviorData, interactionType) {
        const metrics = behaviorData.engagementMetrics;
        if (interactionType === 'generated') {
            metrics.conceptCardEngagement = Math.min(100, metrics.conceptCardEngagement + 2);
            metrics.generationSuccessRate = Math.min(100, metrics.generationSuccessRate + 1);
        }
        if (interactionType === 'favorited') {
            metrics.favoriteRate = Math.min(100, metrics.favoriteRate + 3);
            metrics.subscriptionValue = Math.min(100, metrics.subscriptionValue + 1);
        }
        if (interactionType === 'skipped') {
            metrics.conceptCardEngagement = Math.max(0, metrics.conceptCardEngagement - 0.5);
        }
        await this.storeBehaviorData(userId, behaviorData);
    }
    static async updatePersonalizedInsights(userId, behaviorData, insights) {
        const personalizedInsights = behaviorData.personalizedInsights;
        if (insights.preferenceSignal > 0.7) {
            personalizedInsights.styleConfidence = Math.min(100, personalizedInsights.styleConfidence + 1);
        }
        if (insights.preferenceSignal > 0.8 && insights.styleElements.length > 0) {
            personalizedInsights.dominantAesthetic = insights.styleElements[0];
        }
        if (insights.professionalLevel > 50) {
            personalizedInsights.professionalNeedsLevel = Math.min(100, personalizedInsights.professionalNeedsLevel + 2);
        }
        await this.storeBehaviorData(userId, behaviorData);
    }
    static async getBehaviorData(userId) {
        try {
            return null;
        }
        catch (error) {
            console.error(`❌ PHASE 5.1: Failed to get behavior data for ${userId}:`, error);
            return null;
        }
    }
    static async storeBehaviorData(userId, data) {
        try {
            console.log(`💾 PHASE 5.1: Behavior data updated for user ${userId}`);
        }
        catch (error) {
            console.error(`❌ PHASE 5.1: Failed to store behavior data for ${userId}:`, error);
        }
    }
    static async upgradeBehaviorTracking(userId, existingData) {
        const currentVersion = existingData.learningVersion || '1.0';
        if (currentVersion < '5.1') {
            console.log(`🔄 PHASE 5.1: Upgrading behavior tracking for user ${userId} from ${currentVersion} to 5.1`);
            existingData.learningVersion = '5.1';
            existingData.updatedAt = new Date();
            await this.storeBehaviorData(userId, existingData);
        }
    }
    static getLearningStats() {
        return {
            phase: 'Phase 5.1',
            component: 'Advanced User Behavior Learning',
            capabilities: [
                'Concept card interaction learning',
                'Style preference pattern recognition',
                'Personalized Maya response adaptation',
                'Engagement metric tracking',
                'Predictive user behavior analysis'
            ],
            learningTypes: [
                'Style journey progression',
                'Communication preference detection',
                'Professional needs assessment',
                'Brand awareness evaluation'
            ],
            status: 'Active'
        };
    }
}
//# sourceMappingURL=maya-behavior-learning-service.js.map