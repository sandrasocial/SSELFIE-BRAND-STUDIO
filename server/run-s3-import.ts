#!/usr/bin/env tsx
// Direct S3 import script for Sandra's missing gallery images
import { S3GalleryImporter } from './s3-gallery-importer';

async function runS3Import() {
  console.log('🚀 DIRECT S3 IMPORT: Starting import for Sandra (42585527)');
  
  try {
    const importer = new S3GalleryImporter();
    const result = await importer.importAllUserImages('42585527');
    
    console.log('\n✅ S3 IMPORT RESULTS:');
    console.log(`   📈 Imported: ${result.imported} new images`);
    console.log(`   ⏭️  Skipped: ${result.skipped} existing images`);
    console.log(`   ❌ Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n🚨 ERRORS:');
      result.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }
    
    console.log(`\n🎉 SUCCESS: Your SSELFIE Gallery now contains ${result.imported + result.skipped} total images!`);
    
  } catch (error) {
    console.error('💥 FATAL ERROR:', error);
    process.exit(1);
  }
}

// Run the import
runS3Import();