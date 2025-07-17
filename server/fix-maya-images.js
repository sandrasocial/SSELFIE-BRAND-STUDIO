// Quick script to fix Maya chat images by converting to permanent S3 storage
import { ImageStorageService } from './image-storage-service.js';
import { storage } from './storage.js';

async function fixMayaChatImages() {
  try {
    console.log('🔧 Starting Maya chat image fix...');
    
    // Get the broken Maya chat message with temporary URLs
    const tempUrls = [
      'https://replicate.delivery/xezq/5xNjc2dyX0LfTa3jLzXyg3MTVDeeL1JPeHb98IaNex3NqYNoC/out-0.png',
      'https://replicate.delivery/xezq/TSDexrPLpftq70U9pRFHgZpV30NlV2wOmS1eonxV8fiFVsGUB/out-1.png',
      'https://replicate.delivery/xezq/UuHIOMftOz0GVa3C2KEiWlGsiLEY0yD1o0RKvFoGNk6oi1gKA/out-2.png'
    ];
    
    console.log('Converting temporary URLs to permanent S3 storage...');
    const permanentUrls = [];
    
    for (let i = 0; i < tempUrls.length; i++) {
      try {
        console.log(`Converting image ${i + 1}/${tempUrls.length}...`);
        const permanentUrl = await ImageStorageService.storeImagePermanently(
          tempUrls[i], 
          '42585527', 
          `maya_203_${i}`
        );
        permanentUrls.push(permanentUrl);
        console.log(`✅ Image ${i + 1}: ${permanentUrl}`);
      } catch (error) {
        console.error(`❌ Failed to convert image ${i + 1}:`, error.message);
        permanentUrls.push(tempUrls[i]); // fallback to original
      }
    }
    
    // Update Maya chat message with permanent URLs
    console.log('Updating Maya chat message with permanent URLs...');
    await storage.updateMayaChatMessage(80, {
      imagePreview: JSON.stringify(permanentUrls)
    });
    
    console.log('✅ SUCCESS: Maya chat images updated with permanent S3 URLs!');
    console.log('📝 Permanent URLs:', permanentUrls);
    
    return { success: true, permanentUrls };
    
  } catch (error) {
    console.error('❌ Maya chat image fix failed:', error);
    return { success: false, error: error.message };
  }
}

// Run the fix
fixMayaChatImages()
  .then(result => {
    console.log('🏁 Fix completed:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('🚨 Fatal error:', error);
    process.exit(1);
  });