#!/usr/bin/env node

/**
 * Maya Pipeline Integration Test
 * Tests the complete Maya flow: Authentication → Chat → Concept Cards → Image Generation
 */

import fetch from 'node-fetch';

const BASE_URL = 'https://www.sselfie.ai';
// Alternative: 'https://sselfie-brand-studio-p8x6cm7jo-sselfie-studio.vercel.app'

class MayaPipelineTest {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };
  }

  async log(step, message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 [${timestamp}] STEP ${step}: ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async testUserProfile() {
    this.log(1, "Testing user profile retrieval");
    
    try {
      const response = await fetch(`${BASE_URL}/api/me`, {
        headers: this.headers
      });
      
      const userData = await response.json();
      this.log(1, "✅ User Profile Result", {
        status: response.status,
        userId: userData.id,
        email: userData.email,
        plan: userData.plan,
        role: userData.role
      });
      
      return userData;
    } catch (error) {
      this.log(1, "❌ User Profile Failed", { error: error.message });
      throw error;
    }
  }

  async testMayaChat() {
    this.log(2, "Testing Maya chat with concept card generation");
    
    try {
      const chatRequest = {
        message: "Hello Maya! I need professional photos for my personal brand. Can you help me create some concept cards for a luxury executive photoshoot?",
        context: "professional_branding"
      };

      const response = await fetch(`${BASE_URL}/api/maya/chat`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(chatRequest)
      });

      const chatResult = await response.json();
      
      this.log(2, "✅ Maya Chat Result", {
        status: response.status,
        hasResponse: !!chatResult.response,
        conceptCardsCount: chatResult.conceptCards?.length || 0,
        conversationId: chatResult.conversationId
      });

      if (chatResult.conceptCards && chatResult.conceptCards.length > 0) {
        this.log(2, "📋 Generated Concept Cards", chatResult.conceptCards.map(card => ({
          title: card.title,
          description: card.description?.substring(0, 100) + '...',
          hasFluxPrompt: !!card.fluxPrompt,
          fluxPromptPreview: card.fluxPrompt?.substring(0, 80) + '...'
        })));
      }

      return chatResult;
    } catch (error) {
      this.log(2, "❌ Maya Chat Failed", { error: error.message });
      throw error;
    }
  }

  async testImageGeneration(conceptCard) {
    this.log(3, "Testing image generation with concept card");
    
    try {
      const generationRequest = {
        conceptCard: {
          title: conceptCard.title,
          description: conceptCard.description,
          fluxPrompt: conceptCard.fluxPrompt
        },
        style: 'professional',
        aspectRatio: '3:4'
      };

      const response = await fetch(`${BASE_URL}/api/maya/generate`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(generationRequest)
      });

      const generationResult = await response.json();
      
      this.log(3, "✅ Image Generation Result", {
        status: response.status,
        generationId: generationResult.generationId,
        hasTracker: !!generationResult.tracker,
        triggerWordUsed: generationResult.triggerWordUsed || 'unknown'
      });

      return generationResult;
    } catch (error) {
      this.log(3, "❌ Image Generation Failed", { error: error.message });
      throw error;
    }
  }

  async testUserModel() {
    this.log(4, "Testing user model and trigger word");
    
    try {
      const response = await fetch(`${BASE_URL}/api/user-model`, {
        headers: this.headers
      });

      const modelData = await response.json();
      
      this.log(4, "✅ User Model Result", {
        status: response.status,
        hasModel: !!modelData.model,
        trainingStatus: modelData.model?.trainingStatus,
        triggerWord: modelData.model?.triggerWord,
        modelName: modelData.model?.modelName
      });

      return modelData;
    } catch (error) {
      this.log(4, "❌ User Model Failed", { error: error.message });
      throw error;
    }
  }

  async runFullPipelineTest() {
    console.log("🚀 Starting Maya Pipeline Integration Test");
    console.log("=" .repeat(50));

    try {
      // Step 1: Test user authentication and profile
      const userData = await this.testUserProfile();
      
      // Step 2: Test user model availability
      const modelData = await this.testUserModel();
      
      // Step 3: Test Maya chat and concept card generation
      const chatResult = await this.testMayaChat();
      
      // Step 4: Test image generation if we have concept cards
      if (chatResult.conceptCards && chatResult.conceptCards.length > 0) {
        const firstConceptCard = chatResult.conceptCards[0];
        await this.testImageGeneration(firstConceptCard);
      } else {
        this.log(4, "⚠️ No concept cards generated - skipping image generation test");
      }

      console.log("\n🎉 Maya Pipeline Test Complete!");
      console.log("=" .repeat(50));
      
      return {
        success: true,
        user: userData,
        model: modelData,
        chat: chatResult
      };

    } catch (error) {
      console.log("\n❌ Maya Pipeline Test Failed!");
      console.log("Error:", error.message);
      console.log("=" .repeat(50));
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Helper function to extract access token from Stack Auth cookie format
function extractAccessToken(cookieValue) {
  try {
    // Try parsing as JSON array ["token_id", "jwt"]
    if (cookieValue.startsWith('[')) {
      const parsed = JSON.parse(cookieValue);
      if (Array.isArray(parsed) && parsed.length >= 2) {
        return parsed[1];
      }
    }
    
    // Fallback: assume it's the raw JWT
    if (cookieValue.includes('.') && cookieValue.split('.').length === 3) {
      return cookieValue;
    }
    
    return null;
  } catch {
    return null;
  }
}

// Main execution
async function main() {
  // Check for access token in arguments
  const accessToken = process.argv[2];
  
  if (!accessToken) {
    console.log("❌ No access token provided!");
    console.log("");
    console.log("Usage:");
    console.log("  node test-maya-pipeline.js <access_token>");
    console.log("");
    console.log("To get your access token:");
    console.log("1. Sign in to https://www.sselfie.ai");
    console.log("2. Open browser dev tools (F12)");
    console.log("3. Go to Application/Storage → Cookies");
    console.log("4. Find 'stack-access' cookie value");
    console.log("5. If it starts with '[', extract the JWT from the array");
    console.log("");
    console.log("Example:");
    console.log("  node test-maya-pipeline.js eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...");
    process.exit(1);
  }

  // Extract JWT from Stack Auth cookie format if needed
  const jwt = extractAccessToken(accessToken) || accessToken;
  
  console.log("🔑 Using access token:", jwt.substring(0, 50) + "...");
  
  const tester = new MayaPipelineTest(jwt);
  const result = await tester.runFullPipelineTest();
  
  process.exit(result.success ? 0 : 1);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { MayaPipelineTest };