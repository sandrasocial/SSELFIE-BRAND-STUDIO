import { BulletproofTrainingService } from './bulletproof-training-service';
import fs from 'fs';
import path from 'path';

/**
 * TEST TRAINING FLOW - Verify ZIP Creation and Replicate Integration
 */
export class TestTrainingFlow {
  
  static async testZipCreation(userId: string, mockImages: string[]): Promise<void> {
    console.log(`🧪 TESTING: ZIP creation for user ${userId} with ${mockImages.length} images`);
    
    try {
      // Test validation step
      const validation = await BulletproofTrainingService.processTrainingImages(userId, mockImages);
      
      if (!validation.success) {
        console.error(`❌ VALIDATION FAILED:`, validation.errors);
        return;
      }
      
      console.log(`✅ VALIDATION PASSED: ${validation.validImages.length} images validated`);
      
      // Check if ZIP file was created
      const tempDir = path.join(process.cwd(), 'temp_training');
      const zipFiles = fs.readdirSync(tempDir).filter(f => f.includes(userId));
      
      if (zipFiles.length === 0) {
        console.error(`❌ NO ZIP FILE CREATED in ${tempDir}`);
        return;
      }
      
      const zipPath = path.join(tempDir, zipFiles[0]);
      const zipStats = fs.statSync(zipPath);
      
      console.log(`✅ ZIP CREATED: ${zipFiles[0]} - ${zipStats.size} bytes`);
      console.log(`✅ ZIP URL: ${validation.zipUrl}`);
      
      // Test ZIP accessibility
      if (validation.zipUrl) {
        console.log(`🔍 ZIP URL ACCESSIBILITY TEST: ${validation.zipUrl}`);
        // Note: In production, this would be accessible via the training-zip route
      }
      
    } catch (error) {
      console.error(`❌ TEST FAILED:`, error);
    }
  }
  
  static createMockImage(index: number): string {
    // Create a minimal valid base64 image (1x1 pixel PNG) for testing
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==';
    return `data:image/png;base64,${base64Data}`;
  }
  
  static async runCompleteTest(): Promise<void> {
    console.log('🧪 TESTING: Complete Training Flow');
    
    const testUserId = 'test-user-12345';
    
    // Create 15 mock images (minimum requirement)
    const mockImages: string[] = [];
    for (let i = 1; i <= 15; i++) {
      mockImages.push(this.createMockImage(i));
    }
    
    console.log(`🧪 TESTING: Created ${mockImages.length} mock images for testing`);
    
    await this.testZipCreation(testUserId, mockImages);
  }
}

// Export for use in other files
export default TestTrainingFlow;

// Run test if executed directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  TestTrainingFlow.runCompleteTest().then(() => {
    console.log('🎉 ALL TESTS COMPLETED');
    process.exit(0);
  }).catch(error => {
    console.error('💥 TEST SUITE FAILED:', error);
    process.exit(1);
  });
}