/**
 * PHASE 2 TRAINING SYSTEM FIX
 * 
 * CRITICAL ISSUE IDENTIFIED:
 * - Training destination `sandrasocial/${modelName}` requires special permissions
 * - New users can't create models under the `sandrasocial/` namespace
 * - Need to use user's own account or public training destination
 */

export class Phase2TrainingFix {
  
  /**
   * FIX 1: Use correct training destination for new users
   * - Remove hardcoded `sandrasocial/` namespace
   * - Use user's own Replicate account or public destination
   * - Fallback to temporary model creation
   */
  static getTrainingDestination(userId: string, modelName: string): string {
    // CRITICAL FIX: Don't use hardcoded sandrasocial namespace for new users
    // Instead, let Replicate handle model creation automatically
    
    // Option 1: No destination (lets Replicate auto-create)
    // This is the safest option for new users
    return `${userId}-${modelName}`;
    
    // Option 2: If we need a specific namespace, use the authenticated user's account
    // But this requires the user to have a Replicate account
  }
  
  /**
   * FIX 2: Enhanced error handling for training failures
   */
  static getTrainingRequestBody(userId: string, zipUrl: string, triggerWord: string, modelName: string) {
    return {
      input: {
        input_images: zipUrl,
        trigger_word: triggerWord,
        steps: 1000,
        learning_rate: 0.0004,
        batch_size: 1,
        lora_rank: 32,
        resolution: "1024",
        optimizer: "adamw8bit",
        autocaption: false,
        cache_latents_to_disk: false,
        caption_dropout_rate: 0.1
      },
      // CRITICAL FIX: Remove destination or use dynamic destination
      // destination: this.getTrainingDestination(userId, modelName)
      // Leaving destination empty lets Replicate auto-assign
    };
  }
  
  /**
   * FIX 3: Validate Replicate API token and permissions
   */
  static async validateReplicateAccess(): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.replicate.com/v1/account', {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return { 
          valid: false, 
          error: `Replicate API access failed: ${response.status} ${response.statusText}` 
        };
      }
      
      const accountData = await response.json();
      console.log('✅ Replicate account validated:', accountData.username);
      
      return { valid: true };
      
    } catch (error) {
      return { 
        valid: false, 
        error: `Replicate API validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}