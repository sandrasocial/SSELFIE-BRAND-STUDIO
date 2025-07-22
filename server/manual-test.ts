import { BulletproofTrainingService } from './bulletproof-training-service.js';
import fs from 'fs';
import path from 'path';

// Manual test function
async function testZipCreation() {
  console.log('🧪 MANUAL TEST: ZIP creation for training system');
  
  const testUserId = 'test-user-12345';
  
  // Create 15 mock base64 images (minimum requirement)
  const mockImages: string[] = [];
  const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==';
  
  for (let i = 1; i <= 15; i++) {
    mockImages.push(`data:image/png;base64,${base64Data}`);
  }
  
  try {
    console.log(`✅ Created ${mockImages.length} mock images for testing`);
    
    const result = await BulletproofTrainingService.processTrainingImages(testUserId, mockImages);
    
    if (result.success) {
      console.log('✅ ZIP CREATION SUCCESS:', {
        zipUrl: result.zipUrl,
        validImages: result.validImages.length,
        errors: result.errors
      });
      
      // Check if file actually exists
      const tempDir = path.join(process.cwd(), 'temp_training');
      const files = fs.readdirSync(tempDir);
      console.log('📁 Files in temp_training:', files);
      
    } else {
      console.error('❌ ZIP CREATION FAILED:', result.errors);
    }
    
  } catch (error) {
    console.error('💥 TEST ERROR:', error);
  }
}

testZipCreation();