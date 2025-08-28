/**
 * PHASE 1: Database Migration - aiImages to generatedImages
 * Migrates legacy aiImages table data to enhanced generatedImages table
 * Non-destructive migration - preserves original data
 */

import { db } from './db';
import { aiImages, generatedImages } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errors: string[];
}

export async function migrateAiImagesToGeneratedImages(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    skippedCount: 0,
    errors: []
  };

  try {
    console.log('🔄 Starting Phase 1 Database Migration: aiImages → generatedImages');

    // Get all aiImages that haven't been migrated yet
    const allAiImages = await db.select().from(aiImages);
    
    console.log(`📊 Found ${allAiImages.length} records in aiImages table`);

    for (const aiImage of allAiImages) {
      try {
        // Check if this image already exists in generatedImages
        const existing = await db
          .select()
          .from(generatedImages)
          .where(eq(generatedImages.userId, aiImage.userId))
          .limit(1);

        // Map aiImages fields to generatedImages structure
        const migrationData = {
          userId: aiImage.userId,
          category: aiImage.style || 'Editorial', // Map style to category
          subcategory: 'Professional', // Default subcategory for legacy data
          prompt: aiImage.prompt || 'Legacy migrated image',
          imageUrls: JSON.stringify([aiImage.imageUrl]), // Wrap single URL in array
          selectedUrl: aiImage.isSelected ? aiImage.imageUrl : null,
          saved: aiImage.isFavorite || aiImage.isSelected || false,
          createdAt: aiImage.createdAt
        };

        // Insert into generatedImages
        await db.insert(generatedImages).values(migrationData);
        
        result.migratedCount++;
        console.log(`✅ Migrated aiImage ${aiImage.id} for user ${aiImage.userId}`);

      } catch (error) {
        const errorMsg = `Failed to migrate aiImage ${aiImage.id}: ${error}`;
        result.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    console.log(`🎯 Migration completed: ${result.migratedCount} migrated, ${result.skippedCount} skipped`);
    
    if (result.errors.length > 0) {
      console.log(`⚠️  ${result.errors.length} errors occurred during migration`);
      result.success = false;
    }

  } catch (error) {
    console.error('💥 Fatal migration error:', error);
    result.success = false;
    result.errors.push(`Fatal error: ${error}`);
  }

  return result;
}

export async function verifyMigration(): Promise<{ aiImagesCount: number; generatedImagesCount: number; success: boolean }> {
  try {
    const aiImagesCount = await db.select().from(aiImages).then(rows => rows.length);
    const generatedImagesCount = await db.select().from(generatedImages).then(rows => rows.length);
    
    console.log(`📊 Verification: aiImages: ${aiImagesCount}, generatedImages: ${generatedImagesCount}`);
    
    return {
      aiImagesCount,
      generatedImagesCount,
      success: true
    };
  } catch (error) {
    console.error('❌ Migration verification failed:', error);
    return {
      aiImagesCount: 0,
      generatedImagesCount: 0,
      success: false
    };
  }
}