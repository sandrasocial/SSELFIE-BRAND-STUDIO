/**
 * COMPREHENSIVE Database Migration Script: Update ALL User ID References
 * 
 * This script migrates user_id references across ALL tables from legacy numeric IDs 
 * to new Stack Auth string IDs.
 * 
 * Problem: After Stack Auth migration, user IDs changed from numeric (e.g., "42585527") 
 * to Stack Auth string IDs. All user-related data still references old numeric IDs.
 * 
 * Solution: For each user with a legacy_user_id, update ALL their data to use the new ID.
 * 
 * Critical Tables (User Journey):
 * - Gallery: aiImages, generatedImages, imageVariants, generatedVideos
 * - Training: userModels, trainingRuns, selfieUploads
 * - Maya: mayaChats, conceptCards, conversations, savedPrompts
 * - Profile: userProfiles, subscriptions, usageHistory
 * - Content: brandAssets, brandbooks, websites, landingPages
 */

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { 
  users, 
  // Gallery tables
  aiImages, 
  generatedImages,
  imageVariants,
  generatedVideos,
  // Training tables
  userModels,
  trainingRuns,
  selfieUploads,
  // Maya tables
  mayaChats,
  conceptCards,
  // conversations, // Table doesn't exist in current DB
  savedPrompts,
  // Profile tables
  userProfiles,
  subscriptions,
  usageHistory,
  userUsage,
  // Content tables
  brandAssets,
  brandbooks,
  websites,
  landingPages,
  userLandingPages,
  // Other critical tables
  generationTrackers,
  photoSelections,
  inspirationPhotos,
  promptAnalysis,
  userPersonalBrand,
  onboardingData,
  brandOnboarding,
  // videoStoryboards, // Table doesn't exist in current DB
} from '../../../shared/schema.js';
import { eq, isNotNull, sql } from 'drizzle-orm';

// Use websocket connection for transaction support
const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DB_URL || '';

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL or NEON_DB_URL environment variable is required');
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

interface MigrationStats {
  usersProcessed: number;
  tables: {
    // Gallery
    aiImages: number;
    generatedImages: number;
    imageVariants: number;
    generatedVideos: number;
    // Training
    userModels: number;
    trainingRuns: number;
    selfieUploads: number;
    // Maya
    mayaChats: number;
    conceptCards: number;
    conversations: number;
    savedPrompts: number;
    // Profile
    userProfiles: number;
    subscriptions: number;
    usageHistory: number;
    userUsage: number;
    // Content
    brandAssets: number;
    brandbooks: number;
    websites: number;
    landingPages: number;
    userLandingPages: number;
    // Other
    generationTrackers: number;
    photoSelections: number;
    inspirationPhotos: number;
    promptAnalysis: number;
    userPersonalBrand: number;
    onboardingData: number;
    brandOnboarding: number;
    videoStoryboards: number;
  };
  errors: Array<{ userId: string; table: string; error: string }>;
}

async function migrateImageUserIds(): Promise<void> {
  console.log('🚀 Starting COMPREHENSIVE User ID Migration...\n');
  console.log('📊 This will update ALL user-related data from legacy IDs to Stack Auth IDs\n');
  console.log('=' .repeat(80));
  
  const stats: MigrationStats = {
    usersProcessed: 0,
    tables: {
      aiImages: 0,
      generatedImages: 0,
      imageVariants: 0,
      generatedVideos: 0,
      userModels: 0,
      trainingRuns: 0,
      selfieUploads: 0,
      mayaChats: 0,
      conceptCards: 0,
      conversations: 0,
      savedPrompts: 0,
      userProfiles: 0,
      subscriptions: 0,
      usageHistory: 0,
      userUsage: 0,
      brandAssets: 0,
      brandbooks: 0,
      websites: 0,
      landingPages: 0,
      userLandingPages: 0,
      generationTrackers: 0,
      photoSelections: 0,
      inspirationPhotos: 0,
      promptAnalysis: 0,
      userPersonalBrand: 0,
      onboardingData: 0,
      brandOnboarding: 0,
      videoStoryboards: 0,
    },
    errors: []
  };

  try {
    // Step 1: Fetch all users with legacy IDs
    console.log('📊 Fetching users with legacy_user_id...');
    const usersWithLegacyIds = await db
      .select({
        id: users.id,
        email: users.email,
        legacyUserId: users.legacyUserId,
        displayName: users.displayName
      })
      .from(users)
      .where(isNotNull(users.legacyUserId));

    console.log(`✅ Found ${usersWithLegacyIds.length} users with legacy IDs\n`);

    if (usersWithLegacyIds.length === 0) {
      console.log('⚠️  No users with legacy IDs found. Nothing to migrate.');
      await pool.end();
      return;
    }

    // Step 2: Process each user with transaction support
    // Using websocket driver which supports transactions
    for (const user of usersWithLegacyIds) {
      if (!user.legacyUserId) continue;

      console.log('-'.repeat(80));
      console.log(`👤 Processing user: ${user.email || 'No email'}`);
      console.log(`   New ID: ${user.id}`);
      console.log(`   Legacy ID: ${user.legacyUserId}`);

      try {
        let totalUpdated = 0;

        // Use transaction for atomic all-or-nothing update
        await db.transaction(async (tx) => {
          console.log(`   📦 Updating tables (in transaction):`);

          // Helper function to update a table within transaction
          const updateTable = async (tableName: string, table: any) => {
            const result = await tx
              .update(table)
              .set({ userId: user.id })
              .where(eq(table.userId, user.legacyUserId))
              .returning({ id: table.id });
            
            const count = result.length;
            if (count > 0) {
              console.log(`   ✅ ${tableName}: ${count} records`);
              totalUpdated += count;
            }
            return count;
          };

          // GALLERY TABLES (Critical for gallery display)
          stats.tables.aiImages += await updateTable('ai_images', aiImages);
          stats.tables.generatedImages += await updateTable('generated_images', generatedImages);
          stats.tables.imageVariants += await updateTable('image_variants', imageVariants);
          stats.tables.generatedVideos += await updateTable('generated_videos', generatedVideos);

          // TRAINING TABLES (Critical for model training)
          stats.tables.userModels += await updateTable('user_models', userModels);
          stats.tables.trainingRuns += await updateTable('training_runs', trainingRuns);
          stats.tables.selfieUploads += await updateTable('selfie_uploads', selfieUploads);

          // MAYA TABLES (Critical for Maya chat)
          stats.tables.mayaChats += await updateTable('maya_chats', mayaChats);
          stats.tables.conceptCards += await updateTable('concept_cards', conceptCards);
          // Note: conversations table doesn't exist in current DB - skipping
          stats.tables.savedPrompts += await updateTable('saved_prompts', savedPrompts);

          // PROFILE TABLES
          stats.tables.userProfiles += await updateTable('user_profiles', userProfiles);
          stats.tables.subscriptions += await updateTable('subscriptions', subscriptions);
          stats.tables.usageHistory += await updateTable('usage_history', usageHistory);
          stats.tables.userUsage += await updateTable('user_usage', userUsage);

          // CONTENT TABLES
          stats.tables.brandAssets += await updateTable('brand_assets', brandAssets);
          stats.tables.brandbooks += await updateTable('brandbooks', brandbooks);
          stats.tables.websites += await updateTable('websites', websites);
          stats.tables.landingPages += await updateTable('landing_pages', landingPages);
          stats.tables.userLandingPages += await updateTable('user_landing_pages', userLandingPages);

          // OTHER CRITICAL TABLES
          stats.tables.generationTrackers += await updateTable('generation_trackers', generationTrackers);
          stats.tables.photoSelections += await updateTable('photo_selections', photoSelections);
          stats.tables.inspirationPhotos += await updateTable('inspiration_photos', inspirationPhotos);
          stats.tables.promptAnalysis += await updateTable('prompt_analysis', promptAnalysis);
          stats.tables.userPersonalBrand += await updateTable('user_personal_brand', userPersonalBrand);
          stats.tables.onboardingData += await updateTable('onboarding_data', onboardingData);
          stats.tables.brandOnboarding += await updateTable('brand_onboarding', brandOnboarding);
          // videoStoryboards table doesn't exist in current DB - skipping

          if (totalUpdated === 0) {
            console.log(`   ℹ️  No data found for this user`);
          } else {
            console.log(`   ✨ Total: ${totalUpdated} records updated`);
          }
        }); // End transaction

        stats.usersProcessed++;

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Error processing user ${user.email}: ${errorMsg}`);
        stats.errors.push({ 
          userId: user.id,
          table: 'ALL',
          error: errorMsg 
        });
      }
    }

    // Step 3: Print summary
    console.log('\n' + '='.repeat(80));
    console.log('✨ MIGRATION COMPLETE!\n');
    console.log(`📊 Summary:`);
    console.log(`   Users processed: ${stats.usersProcessed}\n`);
    
    // Gallery stats
    const galleryTotal = stats.tables.aiImages + stats.tables.generatedImages + 
                         stats.tables.imageVariants + stats.tables.generatedVideos;
    if (galleryTotal > 0) {
      console.log(`🖼️  GALLERY (${galleryTotal} total):`);
      if (stats.tables.aiImages > 0) console.log(`   ✅ AI Images: ${stats.tables.aiImages}`);
      if (stats.tables.generatedImages > 0) console.log(`   ✅ Generated Images: ${stats.tables.generatedImages}`);
      if (stats.tables.imageVariants > 0) console.log(`   ✅ Image Variants: ${stats.tables.imageVariants}`);
      if (stats.tables.generatedVideos > 0) console.log(`   ✅ Generated Videos: ${stats.tables.generatedVideos}`);
    }
    
    // Training stats
    const trainingTotal = stats.tables.userModels + stats.tables.trainingRuns + stats.tables.selfieUploads;
    if (trainingTotal > 0) {
      console.log(`\n🎓 TRAINING (${trainingTotal} total):`);
      if (stats.tables.userModels > 0) console.log(`   ✅ User Models: ${stats.tables.userModels}`);
      if (stats.tables.trainingRuns > 0) console.log(`   ✅ Training Runs: ${stats.tables.trainingRuns}`);
      if (stats.tables.selfieUploads > 0) console.log(`   ✅ Selfie Uploads: ${stats.tables.selfieUploads}`);
    }
    
    // Maya stats
    const mayaTotal = stats.tables.mayaChats + stats.tables.conceptCards + 
                      stats.tables.conversations + stats.tables.savedPrompts;
    if (mayaTotal > 0) {
      console.log(`\n💬 MAYA (${mayaTotal} total):`);
      if (stats.tables.mayaChats > 0) console.log(`   ✅ Maya Chats: ${stats.tables.mayaChats}`);
      if (stats.tables.conceptCards > 0) console.log(`   ✅ Concept Cards: ${stats.tables.conceptCards}`);
      if (stats.tables.conversations > 0) console.log(`   ✅ Conversations: ${stats.tables.conversations}`);
      if (stats.tables.savedPrompts > 0) console.log(`   ✅ Saved Prompts: ${stats.tables.savedPrompts}`);
    }
    
    // Profile stats
    const profileTotal = stats.tables.userProfiles + stats.tables.subscriptions + 
                         stats.tables.usageHistory + stats.tables.userUsage;
    if (profileTotal > 0) {
      console.log(`\n👤 PROFILE (${profileTotal} total):`);
      if (stats.tables.userProfiles > 0) console.log(`   ✅ User Profiles: ${stats.tables.userProfiles}`);
      if (stats.tables.subscriptions > 0) console.log(`   ✅ Subscriptions: ${stats.tables.subscriptions}`);
      if (stats.tables.usageHistory > 0) console.log(`   ✅ Usage History: ${stats.tables.usageHistory}`);
      if (stats.tables.userUsage > 0) console.log(`   ✅ User Usage: ${stats.tables.userUsage}`);
    }
    
    // Content stats
    const contentTotal = stats.tables.brandAssets + stats.tables.brandbooks + 
                         stats.tables.websites + stats.tables.landingPages + stats.tables.userLandingPages;
    if (contentTotal > 0) {
      console.log(`\n📝 CONTENT (${contentTotal} total):`);
      if (stats.tables.brandAssets > 0) console.log(`   ✅ Brand Assets: ${stats.tables.brandAssets}`);
      if (stats.tables.brandbooks > 0) console.log(`   ✅ Brandbooks: ${stats.tables.brandbooks}`);
      if (stats.tables.websites > 0) console.log(`   ✅ Websites: ${stats.tables.websites}`);
      if (stats.tables.landingPages > 0) console.log(`   ✅ Landing Pages: ${stats.tables.landingPages}`);
      if (stats.tables.userLandingPages > 0) console.log(`   ✅ User Landing Pages: ${stats.tables.userLandingPages}`);
    }
    
    // Other stats
    const otherTotal = stats.tables.generationTrackers + stats.tables.photoSelections + 
                       stats.tables.inspirationPhotos + stats.tables.promptAnalysis + 
                       stats.tables.userPersonalBrand + stats.tables.onboardingData + 
                       stats.tables.brandOnboarding + stats.tables.videoStoryboards;
    if (otherTotal > 0) {
      console.log(`\n📦 OTHER (${otherTotal} total):`);
      if (stats.tables.generationTrackers > 0) console.log(`   ✅ Generation Trackers: ${stats.tables.generationTrackers}`);
      if (stats.tables.photoSelections > 0) console.log(`   ✅ Photo Selections: ${stats.tables.photoSelections}`);
      if (stats.tables.inspirationPhotos > 0) console.log(`   ✅ Inspiration Photos: ${stats.tables.inspirationPhotos}`);
      if (stats.tables.promptAnalysis > 0) console.log(`   ✅ Prompt Analysis: ${stats.tables.promptAnalysis}`);
      if (stats.tables.userPersonalBrand > 0) console.log(`   ✅ User Personal Brand: ${stats.tables.userPersonalBrand}`);
      if (stats.tables.onboardingData > 0) console.log(`   ✅ Onboarding Data: ${stats.tables.onboardingData}`);
      if (stats.tables.brandOnboarding > 0) console.log(`   ✅ Brand Onboarding: ${stats.tables.brandOnboarding}`);
      if (stats.tables.videoStoryboards > 0) console.log(`   ✅ Video Storyboards: ${stats.tables.videoStoryboards}`);
    }
    
    const grandTotal = galleryTotal + trainingTotal + mayaTotal + profileTotal + contentTotal + otherTotal;
    console.log(`\n🎉 GRAND TOTAL: ${grandTotal} records updated across all tables`);
    
    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered: ${stats.errors.length}`);
      stats.errors.forEach(({ userId, table, error }) => {
        console.log(`   - User ${userId} (${table}): ${error}`);
      });
    } else {
      console.log(`\n✅ No errors encountered!`);
    }

    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
    throw error;
  } finally {
    // Clean up pool connection
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration
migrateImageUserIds()
  .then(() => {
    console.log('\n✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
