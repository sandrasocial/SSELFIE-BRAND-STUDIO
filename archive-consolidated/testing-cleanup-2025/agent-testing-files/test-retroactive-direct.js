/**
 * DIRECT TEST: Retroactive Maya Image Updates
 * Test the function directly without going through Express routes
 */

import { storage } from './server/storage.js';
import { AIService } from './server/ai-service.js';

async function testRetroactiveUpdates() {
  const userId = '42585527'; // Sandra's user ID
  
  console.log('🔍 Testing retroactive Maya image updates directly...');
  console.log(`User ID: ${userId}`);
  
  try {
    // Get completed trackers
    const trackers = await storage.getCompletedGenerationTrackersForUser(userId, 24);
    console.log(`✅ Found ${trackers.length} completed trackers`);
    
    // Get Maya chats
    const chats = await storage.getMayaChats(userId);
    console.log(`✅ Found ${chats.length} Maya chats`);
    
    // Check for messages needing images
    for (const chat of chats) {
      const messages = await storage.getMayaChatMessages(chat.id);
      const needingImages = messages.filter(msg => 
        msg.role === 'maya' && msg.generatedPrompt && !msg.imagePreview
      );
      console.log(`Chat ${chat.id}: ${needingImages.length} messages need images`);
    }
    
    // Call the retroactive update function
    await AIService.checkPendingMayaImageUpdates(userId);
    console.log('✅ Retroactive update completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRetroactiveUpdates();
