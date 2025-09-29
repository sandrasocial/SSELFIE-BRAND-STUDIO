import { db } from "../drizzle.js";
import { eq } from "drizzle-orm";
import { onboardingData, brandOnboarding, userProfiles, } from "../../shared/schema.js";
export class PersonalBrandService {
    async createPersonalBrandProfile(userId, brandData) {
        if (brandData.personalStory || brandData.businessContext) {
            const existingOnboarding = await this.getExistingOnboardingData(userId);
            const onboardingUpdate = {
                brandStory: brandData.personalStory?.transformationJourney || existingOnboarding?.brandStory,
                personalMission: brandData.personalStory?.dreamOutcome || existingOnboarding?.personalMission,
                businessGoals: brandData.businessContext?.businessGoals || existingOnboarding?.businessGoals,
                targetAudience: brandData.businessContext?.targetAudience || existingOnboarding?.targetAudience,
                businessType: brandData.businessContext?.businessType || existingOnboarding?.businessType,
                brandVoice: brandData.personalityTraits?.join(", ") || existingOnboarding?.brandVoice,
                stylePreferences: brandData.styleProfile?.styleCategories?.join(", ") || existingOnboarding?.stylePreferences,
                completed: true,
                completedAt: new Date(),
                updatedAt: new Date()
            };
            await this.updateOnboardingData(userId, onboardingUpdate);
        }
        if (brandData.businessContext || brandData.contactInfo) {
            const brandOnboardingData = {
                businessName: brandData.businessContext?.businessType || "Personal Brand",
                tagline: brandData.personalStory?.dreamOutcome || "",
                personalStory: brandData.personalStory?.transformationJourney || "",
                whyStarted: brandData.personalStory?.whyStarted || "",
                targetClient: brandData.businessContext?.targetAudience || "",
                problemYouSolve: brandData.businessContext?.problemYouSolve || "",
                uniqueApproach: brandData.businessContext?.uniqueApproach || "",
                primaryOffer: brandData.businessContext?.primaryOffer || "",
                primaryOfferPrice: brandData.businessContext?.primaryOfferPrice || "",
                secondaryOffer: brandData.businessContext?.secondaryOffer || "",
                instagramHandle: brandData.contactInfo?.instagramHandle || "",
                websiteUrl: brandData.contactInfo?.websiteUrl || "",
                email: brandData.contactInfo?.email || "",
                location: brandData.contactInfo?.location || "",
                brandPersonality: brandData.styleProfile?.brandPersonality || "sophisticated",
                brandValues: brandData.valuesAndMission || "",
                stylePreference: brandData.styleProfile?.stylePreference || "editorial-luxury",
                colorScheme: brandData.styleProfile?.colorScheme || "black-white-editorial",
                updatedAt: new Date()
            };
            await this.saveBrandOnboarding(userId, brandOnboardingData);
        }
        if (brandData.contactInfo) {
            const profileUpdate = {
                instagramHandle: brandData.contactInfo.instagramHandle,
                websiteUrl: brandData.contactInfo.websiteUrl,
                location: brandData.contactInfo.location,
                brandVibe: brandData.styleProfile?.brandPersonality,
                goals: brandData.businessContext?.businessGoals,
                updatedAt: new Date()
            };
            await this.updateUserProfile(userId, profileUpdate);
        }
        return this.getPersonalBrandProfile(userId);
    }
    async getPersonalBrandProfile(userId) {
        const [onboarding, brandOnboarding, profile] = await Promise.all([
            this.getExistingOnboardingData(userId),
            this.getExistingBrandOnboarding(userId),
            this.getExistingUserProfile(userId)
        ]);
        return {
            personalStory: {
                currentSituation: this.extractCurrentSituation(onboarding, brandOnboarding),
                strugglesStory: this.extractStrugglesStory(onboarding, brandOnboarding),
                transformationJourney: onboarding?.brandStory || brandOnboarding?.personalStory || "",
                dreamOutcome: onboarding?.personalMission || brandOnboarding?.tagline || "",
                whyStarted: brandOnboarding?.whyStarted || ""
            },
            businessContext: {
                businessType: onboarding?.businessType || brandOnboarding?.businessName || "",
                businessGoals: onboarding?.businessGoals || "",
                targetAudience: onboarding?.targetAudience || brandOnboarding?.targetClient || "",
                primaryOffer: brandOnboarding?.primaryOffer || "",
                primaryOfferPrice: brandOnboarding?.primaryOfferPrice || "",
                secondaryOffer: brandOnboarding?.secondaryOffer || "",
                problemYouSolve: brandOnboarding?.problemYouSolve || "",
                uniqueApproach: brandOnboarding?.uniqueApproach || ""
            },
            styleProfile: {
                styleCategories: this.parseStringArray(onboarding?.stylePreferences),
                colorPreferences: this.extractColorPreferences(brandOnboarding),
                settingsPreferences: [],
                avoidances: [],
                brandPersonality: brandOnboarding?.brandPersonality || profile?.brandVibe || "",
                stylePreference: brandOnboarding?.stylePreference || "",
                colorScheme: brandOnboarding?.colorScheme || ""
            },
            contactInfo: {
                instagramHandle: profile?.instagramHandle || brandOnboarding?.instagramHandle || "",
                websiteUrl: profile?.websiteUrl || brandOnboarding?.websiteUrl || "",
                email: brandOnboarding?.email || "",
                location: profile?.location || brandOnboarding?.location || ""
            },
            personalityTraits: this.parseStringArray(onboarding?.brandVoice),
            valuesAndMission: brandOnboarding?.brandValues || "",
            brandVision: profile?.goals || "",
            completedAt: onboarding?.completedAt || brandOnboarding?.createdAt,
            currentStep: onboarding?.currentStep || 1
        };
    }
    async savePersonalBrandStory(userId, story) {
        const onboardingUpdate = {
            brandStory: story.transformationJourney,
            personalMission: story.dreamOutcome,
            updatedAt: new Date()
        };
        await this.updateOnboardingData(userId, onboardingUpdate);
        const brandUpdate = {
            personalStory: story.transformationJourney,
            tagline: story.dreamOutcome,
            whyStarted: story.whyStarted,
            updatedAt: new Date()
        };
        await this.saveBrandOnboarding(userId, brandUpdate);
    }
    async saveBusinessContext(userId, business) {
        const onboardingUpdate = {
            businessGoals: business.businessGoals,
            targetAudience: business.targetAudience,
            businessType: business.businessType,
            updatedAt: new Date()
        };
        await this.updateOnboardingData(userId, onboardingUpdate);
        const brandUpdate = {
            businessName: business.businessType,
            targetClient: business.targetAudience,
            primaryOffer: business.primaryOffer,
            primaryOfferPrice: business.primaryOfferPrice,
            secondaryOffer: business.secondaryOffer,
            problemYouSolve: business.problemYouSolve,
            uniqueApproach: business.uniqueApproach,
            updatedAt: new Date()
        };
        await this.saveBrandOnboarding(userId, brandUpdate);
    }
    async saveStylePreferences(userId, style) {
        const onboardingUpdate = {
            stylePreferences: style.styleCategories.join(", "),
            brandVoice: style.brandPersonality,
            updatedAt: new Date()
        };
        await this.updateOnboardingData(userId, onboardingUpdate);
        const brandUpdate = {
            brandPersonality: style.brandPersonality || "sophisticated",
            stylePreference: style.stylePreference || "editorial-luxury",
            colorScheme: style.colorScheme || "black-white-editorial",
            updatedAt: new Date()
        };
        await this.saveBrandOnboarding(userId, brandUpdate);
        const profileUpdate = {
            brandVibe: style.brandPersonality,
            updatedAt: new Date()
        };
        await this.updateUserProfile(userId, profileUpdate);
    }
    async completePersonalBrandOnboarding(userId) {
        const onboardingUpdate = {
            completed: true,
            completedAt: new Date(),
            currentStep: 6,
            updatedAt: new Date()
        };
        await this.updateOnboardingData(userId, onboardingUpdate);
        return this.getPersonalBrandProfile(userId);
    }
    async hasCompletedPersonalBrandOnboarding(userId) {
        const onboarding = await this.getExistingOnboardingData(userId);
        return onboarding?.completed || false;
    }
    async getOnboardingProgress(userId) {
        const onboarding = await this.getExistingOnboardingData(userId);
        return onboarding?.currentStep || 1;
    }
    async updateOnboardingProgress(userId, step) {
        const onboardingUpdate = {
            currentStep: step,
            updatedAt: new Date()
        };
        await this.updateOnboardingData(userId, onboardingUpdate);
    }
    async getExistingOnboardingData(userId) {
        const [data] = await db
            .select()
            .from(onboardingData)
            .where(eq(onboardingData.userId, userId));
        return data;
    }
    async updateOnboardingData(userId, data) {
        const existing = await this.getExistingOnboardingData(userId);
        if (existing) {
            const [updated] = await db
                .update(onboardingData)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(onboardingData.userId, userId))
                .returning();
            return updated;
        }
        else {
            const [created] = await db
                .insert(onboardingData)
                .values({
                userId,
                ...data,
                currentStep: data.currentStep || 1,
                completed: data.completed || false
            })
                .returning();
            return created;
        }
    }
    async getExistingBrandOnboarding(userId) {
        const [data] = await db
            .select()
            .from(brandOnboarding)
            .where(eq(brandOnboarding.userId, userId));
        return data;
    }
    async saveBrandOnboarding(userId, data) {
        const existing = await this.getExistingBrandOnboarding(userId);
        if (existing) {
            const [updated] = await db
                .update(brandOnboarding)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(brandOnboarding.userId, userId))
                .returning();
            return updated;
        }
        else {
            const [created] = await db
                .insert(brandOnboarding)
                .values({
                userId,
                businessName: data.businessName || "Personal Brand",
                tagline: data.tagline || "",
                personalStory: data.personalStory || "",
                targetClient: data.targetClient || "",
                problemYouSolve: data.problemYouSolve || "",
                uniqueApproach: data.uniqueApproach || "",
                primaryOffer: data.primaryOffer || "",
                primaryOfferPrice: data.primaryOfferPrice || "",
                email: data.email || "",
                brandPersonality: data.brandPersonality || "sophisticated",
                ...data
            })
                .returning();
            return created;
        }
    }
    async getExistingUserProfile(userId) {
        const [profile] = await db
            .select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, userId));
        return profile;
    }
    async updateUserProfile(userId, data) {
        const existing = await this.getExistingUserProfile(userId);
        if (existing) {
            const [updated] = await db
                .update(userProfiles)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(userProfiles.userId, userId))
                .returning();
            return updated;
        }
        else {
            const [created] = await db
                .insert(userProfiles)
                .values({
                userId,
                ...data
            })
                .returning();
            return created;
        }
    }
    extractCurrentSituation(onboarding, brandData) {
        const business = onboarding?.businessType || brandData?.businessName || "";
        const struggles = brandData?.problemYouSolve || "";
        return `${business}${struggles ? ` - ${struggles}` : ""}`.trim();
    }
    extractStrugglesStory(onboarding, brandData) {
        return brandData?.whyStarted || onboarding?.brandStory || "";
    }
    parseStringArray(value) {
        if (!value)
            return [];
        return value.split(",").map(item => item.trim()).filter(item => item.length > 0);
    }
    extractColorPreferences(brandData) {
        if (!brandData?.colorScheme)
            return [];
        const scheme = brandData.colorScheme.toLowerCase();
        if (scheme.includes("black") && scheme.includes("white")) {
            return ["black", "white", "monochrome"];
        }
        if (scheme.includes("warm")) {
            return ["warm tones", "brown", "cream", "gold"];
        }
        if (scheme.includes("cool")) {
            return ["cool tones", "blue", "gray", "silver"];
        }
        return [brandData.colorScheme];
    }
}
export const personalBrandService = new PersonalBrandService();
//# sourceMappingURL=personal-brand-service.js.map