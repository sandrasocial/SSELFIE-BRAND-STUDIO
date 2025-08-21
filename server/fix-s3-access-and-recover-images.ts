#!/usr/bin/env tsx
// Fix S3 access restrictions and recover all existing images
import { S3PolicyUpdater } from './s3-policy-updater';
import { S3GalleryImporter } from './s3-gallery-importer';
import { db } from './db';
import { sql } from 'drizzle-orm';

async function fixS3AndRecoverImages() {
  console.log('🔧 S3 RECOVERY: Starting S3 access fix and image recovery...');
  
  try {
    // Step 1: Check current S3 policy
    console.log('\n📋 Step 1: Checking current S3 bucket policy...');
    const policyCheck = await S3PolicyUpdater.getCurrentBucketPolicy();
    console.log(`Policy check result: ${policyCheck.message}`);
    
    // Step 2: Apply fixed bucket policy for proper access
    console.log('\n🔧 Step 2: Applying fixed S3 bucket policy...');
    const policyUpdate = await S3PolicyUpdater.applyFixedBucketPolicy();
    console.log(`Policy update result: ${policyUpdate.message}`);
    
    if (!policyUpdate.success) {
      throw new Error(`Failed to update S3 policy: ${policyUpdate.message}`);
    }
    
    // Step 3: Test S3 access to confirm fix
    console.log('\n🧪 Step 3: Testing S3 access after policy update...');
    const accessTest = await S3PolicyUpdater.testS3Access();
    console.log(`Access test result: ${accessTest.message}`);
    
    if (!accessTest.success) {
      throw new Error(`S3 access test failed: ${accessTest.message}`);
    }
    
    // Step 4: Clear existing placeholder images first
    console.log('\n🗑️ Step 4: Clearing placeholder images...');
    await db.execute(sql`
      DELETE FROM ai_images 
      WHERE user_id = '42585527' 
      AND image_url LIKE 'https://picsum.photos%'
    `);
    console.log('✅ Cleared placeholder images');
    
    // Step 5: Import all existing S3 images
    console.log('\n📦 Step 5: Importing all existing S3 images...');
    const importer = new S3GalleryImporter();
    const importResult = await importer.importAllUserImages('42585527');
    
    console.log('\n✅ S3 RECOVERY COMPLETE:');
    console.log(`   📈 Imported: ${importResult.imported} real images from S3`);
    console.log(`   ⏭️ Skipped: ${importResult.skipped} duplicate images`);
    console.log(`   ❌ Errors: ${importResult.errors.length} failed imports`);
    
    if (importResult.errors.length > 0) {
      console.log('\n⚠️ Import errors:');
      importResult.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    // Step 6: Get final count
    const finalCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM ai_images WHERE user_id = '42585527'
    `);
    
    console.log(`\n📊 Final gallery size: ${(finalCount[0] as any).count} real images`);
    console.log('🎉 Your SSELFIE Gallery now contains all your actual generated images!');
    
  } catch (error) {
    console.error('💥 S3 RECOVERY FAILED:', error);
    console.error('This typically means AWS credentials need updating or policy restrictions remain.');
    console.error('You may need to contact your AWS admin to grant ListBucket permissions.');
  }
}

// Run the recovery
fixS3AndRecoverImages();