import { storage } from './storage';

// Image categories as per Sandra's architecture
export const IMAGE_CATEGORIES = {
  "Lifestyle": {
    subcategories: ["Working", "Travel", "Home", "Social"],
    lightingStyle: "natural, golden hour",
    poseStyle: "relaxed, candid"
  },
  "Editorial": {
    subcategories: ["Magazine Cover", "Fashion", "Business"],
    lightingStyle: "studio lighting, dramatic", 
    poseStyle: "powerful, confident"
  },
  "Portrait": {
    subcategories: ["Headshot", "Creative", "Professional"],
    lightingStyle: "soft, flattering",
    poseStyle: "direct gaze, composed"
  },
  "Story": {
    subcategories: ["Journey", "Transformation", "Behind Scenes"],
    lightingStyle: "moody, atmospheric",
    poseStyle: "emotional, authentic"
  },
  "Luxury": {
    subcategories: ["Yacht", "Villa", "Shopping", "Events"],
    lightingStyle: "golden hour, premium",
    poseStyle: "elegant, sophisticated"
  }
} as const;

// Detailed prompt templates for each category/subcategory
const PROMPT_TEMPLATES = {
  "Lifestyle": {
    "Working": `{triggerWord} woman working on laptop at beachfront cafe in Marbella, morning golden light, casual elegant outfit, lifestyle photography, raw photo, visible skin pores, film grain, unretouched natural skin texture`,
    "Travel": `{triggerWord} woman at luxury hotel balcony, city skyline view, sunset lighting, flowing dress, editorial lifestyle, raw photo, natural skin texture, film grain`,
    "Home": `{triggerWord} woman in modern apartment, natural window light, cozy authentic moment, lifestyle photography, raw photo, visible skin texture, film grain`,
    "Social": `{triggerWord} woman at elegant dinner party, warm ambient lighting, genuine laughter, social lifestyle, raw photo, natural skin texture, film grain`
  },
  "Editorial": {
    "Magazine Cover": `{triggerWord} woman long dark hair slicked back, intense direct gaze, wearing black turtleneck, strong shadows on face, shot on Leica M11 Monochrom with 50mm Summilux f/1.4, single strobe with grid, high contrast black and white photography, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, Peter Lindbergh style portrait`,
    "Fashion": `{triggerWord} woman long dark tousled hair, profile in shadow, wearing black blazer with bare skin underneath, dramatic rim lighting, shot on Hasselblad H6D-100c with 120mm lens f/4, black and white mode, theatrical lighting setup, raw photo, skin texture emphasized by light, heavy grain, unretouched, noir editorial portrait`,
    "Business": `{triggerWord} woman long dark hair in severe side part, strong jaw angle, wearing structured black jacket, geometric shadows from blinds across face, shot on Canon 5DS R with 100mm f/2.8 Macro, window light only, high contrast black and white, raw photo, skin detail in bright areas, film grain, unretouched architectural portrait`
  },
  "Portrait": {
    "Headshot": `{triggerWord} woman long straight dark hair, deadpan expression, wearing plain black t-shirt, white wall background, shot on Nikon Z9 with 85mm f/1.8, single softbox 45 degrees, minimalist black and white, raw photo, every pore documented, fine grain, completely unretouched, passport photo elevated to art`,
    "Creative": `{triggerWord} woman long dark messy hair partially covering face, one eye visible, wearing simple black tank, minimal styling, shot on Pentax 645Z with 75mm f/2.8, natural harsh window light, black and white film aesthetic, raw photo, every imperfection visible, heavy 35mm film grain, completely unretouched, documentary style portrait`,
    "Professional": `{triggerWord} woman long dark hair blowing in wind machine, strong stance, wearing black leather coat open, dramatic backlighting creating silhouette, shot on Fujifilm GFX100 II with 110mm f/2, studio strobes, high contrast black and white, raw photo, edge lighting on skin texture, medium format grain, unretouched strength`
  },
  "Story": {
    "Journey": `{triggerWord} woman long dark disheveled hair, lying down shot from above, wearing black cashmere sweater, soft natural light, shot on Leica Q2 Monochrom with 28mm Summilux, available light only, gentle black and white tones, raw photo, relaxed natural skin, visible texture, film grain, unretouched candid beauty`,
    "Transformation": `{triggerWord} woman long dark hair wet and pulled back, looking down, wearing black silk slip, moody shadows, shot on Phase One XF IQ4 Achromatic 150MP with 80mm lens, single beauty dish overhead, true monochrome capture, raw photo, water droplets on skin, visible pores, film grain, unretouched vulnerability, artistic editorial`,
    "Behind Scenes": `{triggerWord} woman long dark hair motion blur, multiple exposure effect, wearing all black, artistic movement, shot on Leica M11 Monochrom with 35mm f/1.4, slow shutter drag, experimental black and white, raw photo, ghosting effects on skin, heavy artistic grain, unretouched avant-garde portrait`
  },
  "Luxury": {
    "Yacht": `{triggerWord} woman long dark Hollywood waves, classic beauty pose, wearing black evening dress with jewelry, old Hollywood lighting, shot on Hasselblad 503CW with 150mm f/4, continuous tungsten lights, film noir black and white, raw photo, skin glowing in hot lights, authentic film grain, unretouched classic beauty`,
    "Villa": `{triggerWord} woman long dark hair slicked back, intense direct gaze, wearing black turtleneck, strong shadows on face, shot on Leica M11 Monochrom with 50mm Summilux f/1.4, single strobe with grid, high contrast black and white photography, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film`,
    "Shopping": `{triggerWord} woman long dark tousled hair, profile in shadow, wearing black blazer with bare skin underneath, dramatic rim lighting, shot on Hasselblad H6D-100c with 120mm lens f/4, black and white mode, theatrical lighting setup, raw photo, skin texture emphasized by light, heavy grain, unretouched, photographed on film`,
    "Events": `{triggerWord} woman long dark hair in severe side part, strong jaw angle, wearing structured black jacket, geometric shadows from blinds across face, shot on Canon 5DS R with 100mm f/2.8 Macro, window light only, high contrast black and white, raw photo, skin detail in bright areas, film grain, unretouched, photographed on film`
  }
};

// Optimal generation settings for realistic results
const GENERATION_SETTINGS = {
  model: "dev", // Always use dev model for better quality
  num_inference_steps: 32, // 30-35 range for quality
  guidance_scale: 2.7, // 2.5-2.9 for more realistic results
  lora_scale: 1.0, // Model default
  num_outputs: 4,
  aspect_ratio: "16:9",
  output_format: "png",
  output_quality: 100,
  go_fast: false // Quality over speed
};

export class ModelTrainingService {
  // Generate unique trigger word for user
  static generateTriggerWord(userId: string): string {
    // Generate a unique trigger word based on user ID to prevent AI model confusion
    return `user${userId}`;
  }

  // Start model training for user
  static async startModelTraining(userId: string, selfieImages: string[]): Promise<{ modelId: number; triggerWord: string }> {
    if (selfieImages.length < 10) {
      throw new Error('At least 10 selfie images required for training');
    }

    const triggerWord = this.generateTriggerWord(userId);
    const modelName = `user-${userId}-selfie-lora`;

    // Check if user already has a model
    const existingModel = await storage.getUserModelByUserId(userId);
    let userModel;
    
    if (existingModel) {
      // Update existing model for retraining
      userModel = await storage.updateUserModel(userId, {
        modelName,
        trainingStatus: 'pending'
      });
    } else {
      // Create new user model record
      userModel = await storage.createUserModel({
        userId,
        triggerWord,
        modelName,
        trainingStatus: 'pending'
      });
    }

    try {
      // Call Replicate training API with the actual working model
      const trainingResponse = await fetch('https://api.replicate.com/v1/trainings', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "ostris/flux-dev-lora-trainer:e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497",
          input: {
            input_images: selfieImages.map(img => `data:image/jpeg;base64,${img}`).join(','),
            trigger_word: triggerWord,
            steps: 1000,
            lr: 1e-4,
            resolution: 512,
            autocaption: true,
            trigger_word_in_caption: true
          },
          webhook: `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/api/training-webhook/${userModel.id}`
        })
      });

      const trainingData = await trainingResponse.json();
      
      // Update model with training ID
      await storage.updateUserModel(userId, {
        replicateModelId: trainingData.id,
        trainingStatus: 'training'
      });

      return { modelId: userModel.id, triggerWord };
    } catch (error) {
      // Update status to failed
      await storage.updateUserModel(userId, {
        trainingStatus: 'failed'
      });
      throw error;
    }
  }

  // Check training status
  static async checkTrainingStatus(modelId: number): Promise<{ status: string; progress?: number }> {
    const userModel = await storage.getUserModel(modelId);
    if (!userModel || !userModel.replicateModelId) {
      return { status: 'not_found' };
    }

    try {
      const response = await fetch(`https://api.replicate.com/v1/trainings/${userModel.replicateModelId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });

      const data = await response.json();
      
      // Update local status
      if (data.status === 'succeeded') {
        await storage.updateUserModel(userModel.userId, {
          trainingStatus: 'completed',
          modelUrl: data.output?.weights || data.urls?.get,
          completedAt: new Date()
        });
      } else if (data.status === 'failed') {
        await storage.updateUserModel(modelId, {
          trainingStatus: 'failed'
        });
      }

      return {
        status: data.status,
        progress: data.logs ? this.parseProgress(data.logs) : undefined
      };
    } catch (error) {
      return { status: 'error' };
    }
  }

  // Generate prompt for specific category/subcategory
  static generatePrompt(
    triggerWord: string, 
    category: keyof typeof IMAGE_CATEGORIES,
    subcategory: string,
    userProfile?: any
  ): string {
    const template = PROMPT_TEMPLATES[category]?.[subcategory];
    if (!template) {
      throw new Error(`No prompt template found for ${category}/${subcategory}`);
    }

    let prompt = template.replace('{triggerWord}', triggerWord);

    // Add user-specific styling
    if (userProfile?.style) {
      if (userProfile.style === "minimal") {
        prompt += ", minimalist aesthetic, clean lines";
      } else if (userProfile.style === "bold") {
        prompt += ", dramatic contrast, powerful presence";
      } else if (userProfile.style === "luxury") {
        prompt += ", luxury aesthetic, sophisticated styling";
      }
    }

    // Always add quality enhancers
    prompt += ", raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film";

    return prompt;
  }

  // Generate images for user with their trained model
  static async generateUserImages(
    userId: string,
    category: keyof typeof IMAGE_CATEGORIES,
    subcategory: string
  ): Promise<{ generatedImageId: number; predictionId: string }> {
    // Get user's trained model
    const userModel = await storage.getUserModelByUserId(userId);
    if (!userModel || userModel.trainingStatus !== 'completed') {
      throw new Error('User model not found or not completed training');
    }

    // Get user profile for styling
    const userProfile = await storage.getUserOnboardingData(userId);
    
    // Use the model's trigger word (auto-generated based on user ID)
    const triggerWord = userModel.triggerWord;
    
    if (!triggerWord) {
      throw new Error('No trigger word found. Please complete AI training first.');
    }

    // Generate prompt
    const prompt = this.generatePrompt(
      triggerWord,
      category,
      subcategory,
      userProfile
    );

    // Create generation record
    const generatedImage = await storage.createGeneratedImage({
      userId,
      modelId: userModel.id,
      category,
      subcategory,
      prompt,
      imageUrls: '', // Will be updated when complete
      saved: false
    });

    try {
      // Call Replicate with user's trained model
      const requestBody = {
        version: userModel.replicateModelId || 'a31d246656f2cec416d6d895d11cbb0b4b7b8eb2719fac75cf7d73c441b08f36', // Use your trained model version
        input: {
          prompt: prompt,
          ...GENERATION_SETTINGS
        }
      };

      console.log('Replicate API request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Replicate API response status:', response.status);
      
      const prediction = await response.json();
      
      console.log('Replicate API response:', JSON.stringify(prediction, null, 2));
      
      if (!response.ok) {
        throw new Error(`Replicate API error (${response.status}): ${JSON.stringify(prediction)}`);
      }
      
      if (!prediction.id) {
        throw new Error(`No prediction ID returned from Replicate API: ${JSON.stringify(prediction)}`);
      }
      
      return {
        generatedImageId: generatedImage.id,
        predictionId: prediction.id
      };
    } catch (error) {
      throw new Error(`Failed to generate images: ${error.message}`);
    }
  }

  // Parse training progress from logs
  private static parseProgress(logs: string): number {
    // Parse progress from training logs
    const matches = logs.match(/(\d+)\/\d+ steps/);
    if (matches) {
      const current = parseInt(matches[1]);
      return Math.round((current / 1000) * 100); // Assuming 1000 total steps
    }
    return 0;
  }

  static async generateCustomPrompt(userId: string, customPrompt: string): Promise<{ generatedImageId: number; predictionId: string }> {
    try {
      // Get user's trained model
      const userModel = await storage.getUserModelByUserId(userId);
      if (!userModel || userModel.trainingStatus !== 'completed') {
        throw new Error('User model not found or not completed training');
      }

      // Use the model's trigger word (auto-generated based on user ID)
      const triggerWord = userModel.triggerWord;
      
      if (!triggerWord) {
        throw new Error('No trigger word found. Please complete AI training first.');
      }

      // Replace {triggerWord} with user's actual trigger word
      const finalPrompt = customPrompt.replace('{triggerWord}', triggerWord);
      
      // Add professional quality enhancers if not already present
      let enhancedPrompt = finalPrompt;
      if (!finalPrompt.includes('raw photo')) {
        enhancedPrompt = `${finalPrompt}, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film`;
      }

      // Create database record
      const generatedImage = await storage.createGeneratedImage({
        userId,
        modelId: userModel.id,
        category: 'Custom',
        subcategory: 'Sandra Chat',
        prompt: enhancedPrompt,
        imageUrls: '', // Will be updated when complete
        saved: false
      });

      // Call Replicate API using existing method
      const predictionId = await this.callFluxAPI(enhancedPrompt);

      console.log(`Custom prompt generation started for user ${userId}: ${predictionId}`);
      
      return { generatedImageId: generatedImage.id, predictionId };
    } catch (error) {
      console.error('Custom prompt generation error:', error);
      throw error;
    }
  }
}

export { PROMPT_TEMPLATES, GENERATION_SETTINGS };