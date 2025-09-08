import { relations } from "drizzle-orm/relations";
import { users, agentSessionContexts, brandOnboarding, agentLearning, claudeConversations, claudeMessages, domains, emailCaptures, generationTrackers, inspirationPhotos, userPersonalBrand, mayaPersonalMemory, userModels, generatedImages, projects, savedPrompts, selfieUploads, photoSelections, usageHistory, subscriptions, userProfiles, userLandingPages, userSimplifiedProfile, userStyleguides, userUsage, userWebsiteOnboarding, victoriaChats, websites, mayaChats, mayaChatMessages, userStyleMemory, promptAnalysis, aiImages, feedTemplates, brandedPosts, feedCollections } from "./schema";

export const agentSessionContextsRelations = relations(agentSessionContexts, ({one}) => ({
	user: one(users, {
		fields: [agentSessionContexts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	agentSessionContexts: many(agentSessionContexts),
	brandOnboardings: many(brandOnboarding),
	agentLearnings: many(agentLearning),
	claudeConversations: many(claudeConversations),
	domains: many(domains),
	emailCaptures: many(emailCaptures),
	generationTrackers: many(generationTrackers),
	inspirationPhotos: many(inspirationPhotos),
	mayaPersonalMemories: many(mayaPersonalMemory),
	generatedImages: many(generatedImages),
	projects: many(projects),
	savedPrompts: many(savedPrompts),
	selfieUploads: many(selfieUploads),
	photoSelections: many(photoSelections),
	usageHistories: many(usageHistory),
	subscriptions: many(subscriptions),
	userProfiles_userId: many(userProfiles, {
		relationName: "userProfiles_userId_users_id"
	}),
	userProfiles_userId: many(userProfiles, {
		relationName: "userProfiles_userId_users_id"
	}),
	userPersonalBrands: many(userPersonalBrand),
	userLandingPages: many(userLandingPages),
	userSimplifiedProfiles: many(userSimplifiedProfile),
	userStyleguides: many(userStyleguides),
	userUsages: many(userUsage),
	userWebsiteOnboardings: many(userWebsiteOnboarding),
	victoriaChats: many(victoriaChats),
	userModels: many(userModels),
	websites: many(websites),
	userStyleMemories: many(userStyleMemory),
	promptAnalyses: many(promptAnalysis),
	aiImages: many(aiImages),
	feedTemplates: many(feedTemplates),
	brandedPosts: many(brandedPosts),
	feedCollections: many(feedCollections),
}));

export const brandOnboardingRelations = relations(brandOnboarding, ({one}) => ({
	user: one(users, {
		fields: [brandOnboarding.userId],
		references: [users.id]
	}),
}));

export const agentLearningRelations = relations(agentLearning, ({one}) => ({
	user: one(users, {
		fields: [agentLearning.userId],
		references: [users.id]
	}),
}));

export const claudeMessagesRelations = relations(claudeMessages, ({one}) => ({
	claudeConversation: one(claudeConversations, {
		fields: [claudeMessages.conversationId],
		references: [claudeConversations.conversationId]
	}),
}));

export const claudeConversationsRelations = relations(claudeConversations, ({one, many}) => ({
	claudeMessages: many(claudeMessages),
	user: one(users, {
		fields: [claudeConversations.userId],
		references: [users.id]
	}),
}));

export const domainsRelations = relations(domains, ({one}) => ({
	user: one(users, {
		fields: [domains.userId],
		references: [users.id]
	}),
}));

export const emailCapturesRelations = relations(emailCaptures, ({one}) => ({
	user: one(users, {
		fields: [emailCaptures.userId],
		references: [users.id]
	}),
}));

export const generationTrackersRelations = relations(generationTrackers, ({one}) => ({
	user: one(users, {
		fields: [generationTrackers.userId],
		references: [users.id]
	}),
}));

export const inspirationPhotosRelations = relations(inspirationPhotos, ({one}) => ({
	user: one(users, {
		fields: [inspirationPhotos.userId],
		references: [users.id]
	}),
}));

export const mayaPersonalMemoryRelations = relations(mayaPersonalMemory, ({one}) => ({
	userPersonalBrand: one(userPersonalBrand, {
		fields: [mayaPersonalMemory.personalBrandId],
		references: [userPersonalBrand.id]
	}),
	user: one(users, {
		fields: [mayaPersonalMemory.userId],
		references: [users.id]
	}),
}));

export const userPersonalBrandRelations = relations(userPersonalBrand, ({one, many}) => ({
	mayaPersonalMemories: many(mayaPersonalMemory),
	user: one(users, {
		fields: [userPersonalBrand.userId],
		references: [users.id]
	}),
}));

export const generatedImagesRelations = relations(generatedImages, ({one, many}) => ({
	userModel: one(userModels, {
		fields: [generatedImages.modelId],
		references: [userModels.id]
	}),
	user: one(users, {
		fields: [generatedImages.userId],
		references: [users.id]
	}),
	usageHistories: many(usageHistory),
}));

export const userModelsRelations = relations(userModels, ({one, many}) => ({
	generatedImages: many(generatedImages),
	user: one(users, {
		fields: [userModels.userId],
		references: [users.id]
	}),
}));

export const projectsRelations = relations(projects, ({one}) => ({
	user: one(users, {
		fields: [projects.userId],
		references: [users.id]
	}),
}));

export const savedPromptsRelations = relations(savedPrompts, ({one}) => ({
	user: one(users, {
		fields: [savedPrompts.userId],
		references: [users.id]
	}),
}));

export const selfieUploadsRelations = relations(selfieUploads, ({one}) => ({
	user: one(users, {
		fields: [selfieUploads.userId],
		references: [users.id]
	}),
}));

export const photoSelectionsRelations = relations(photoSelections, ({one}) => ({
	user: one(users, {
		fields: [photoSelections.userId],
		references: [users.id]
	}),
}));

export const usageHistoryRelations = relations(usageHistory, ({one}) => ({
	generatedImage: one(generatedImages, {
		fields: [usageHistory.generatedImageId],
		references: [generatedImages.id]
	}),
	user: one(users, {
		fields: [usageHistory.userId],
		references: [users.id]
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
}));

export const userProfilesRelations = relations(userProfiles, ({one}) => ({
	user_userId: one(users, {
		fields: [userProfiles.userId],
		references: [users.id],
		relationName: "userProfiles_userId_users_id"
	}),
	user_userId: one(users, {
		fields: [userProfiles.userId],
		references: [users.id],
		relationName: "userProfiles_userId_users_id"
	}),
}));

export const userLandingPagesRelations = relations(userLandingPages, ({one}) => ({
	user: one(users, {
		fields: [userLandingPages.userId],
		references: [users.id]
	}),
}));

export const userSimplifiedProfileRelations = relations(userSimplifiedProfile, ({one}) => ({
	user: one(users, {
		fields: [userSimplifiedProfile.userId],
		references: [users.id]
	}),
}));

export const userStyleguidesRelations = relations(userStyleguides, ({one}) => ({
	user: one(users, {
		fields: [userStyleguides.userId],
		references: [users.id]
	}),
}));

export const userUsageRelations = relations(userUsage, ({one}) => ({
	user: one(users, {
		fields: [userUsage.userId],
		references: [users.id]
	}),
}));

export const userWebsiteOnboardingRelations = relations(userWebsiteOnboarding, ({one}) => ({
	user: one(users, {
		fields: [userWebsiteOnboarding.userId],
		references: [users.id]
	}),
}));

export const victoriaChatsRelations = relations(victoriaChats, ({one}) => ({
	user: one(users, {
		fields: [victoriaChats.userId],
		references: [users.id]
	}),
}));

export const websitesRelations = relations(websites, ({one}) => ({
	user: one(users, {
		fields: [websites.userId],
		references: [users.id]
	}),
}));

export const mayaChatMessagesRelations = relations(mayaChatMessages, ({one}) => ({
	mayaChat: one(mayaChats, {
		fields: [mayaChatMessages.chatId],
		references: [mayaChats.id]
	}),
}));

export const mayaChatsRelations = relations(mayaChats, ({many}) => ({
	mayaChatMessages: many(mayaChatMessages),
}));

export const userStyleMemoryRelations = relations(userStyleMemory, ({one}) => ({
	user: one(users, {
		fields: [userStyleMemory.userId],
		references: [users.id]
	}),
}));

export const promptAnalysisRelations = relations(promptAnalysis, ({one}) => ({
	user: one(users, {
		fields: [promptAnalysis.userId],
		references: [users.id]
	}),
}));

export const aiImagesRelations = relations(aiImages, ({one}) => ({
	user: one(users, {
		fields: [aiImages.userId],
		references: [users.id]
	}),
}));

export const feedTemplatesRelations = relations(feedTemplates, ({one, many}) => ({
	user: one(users, {
		fields: [feedTemplates.userId],
		references: [users.id]
	}),
	brandedPosts: many(brandedPosts),
}));

export const brandedPostsRelations = relations(brandedPosts, ({one}) => ({
	user: one(users, {
		fields: [brandedPosts.userId],
		references: [users.id]
	}),
	feedTemplate: one(feedTemplates, {
		fields: [brandedPosts.templateId],
		references: [feedTemplates.id]
	}),
}));

export const feedCollectionsRelations = relations(feedCollections, ({one}) => ({
	user: one(users, {
		fields: [feedCollections.userId],
		references: [users.id]
	}),
}));