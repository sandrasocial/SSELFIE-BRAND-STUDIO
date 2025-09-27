// Import the tables and schemas from the main schema file
import { 
  userWebsiteOnboarding, 
  userGeneratedWebsites, 
  websiteBuilderConversations,
  insertUserWebsiteOnboardingSchema,
  insertUserGeneratedWebsitesSchema,
  insertWebsiteBuilderConversationsSchema,
  type InsertUserWebsiteOnboarding,
  type UserWebsiteOnboarding,
  type InsertUserGeneratedWebsite, // Correct name from schema
  type UserGeneratedWebsite,
  type InsertWebsiteBuilderConversation, // Correct name from schema
  type WebsiteBuilderConversation
} from '../schema.js';

// Re-export the types for convenience
export type { 
  InsertUserWebsiteOnboarding,
  UserWebsiteOnboarding,
  InsertUserGeneratedWebsite, 
  UserGeneratedWebsite,
  InsertWebsiteBuilderConversation,
  WebsiteBuilderConversation
};

// Re-export the schemas for convenience
export { 
  insertUserWebsiteOnboardingSchema,
  insertUserGeneratedWebsitesSchema,
  insertWebsiteBuilderConversationsSchema
};