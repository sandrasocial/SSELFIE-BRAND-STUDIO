// 🔒 ARCHITECTURE VALIDATOR - IMMUTABLE CORE PROTECTION
// This module validates that the correct FLUX LoRA architecture is being used
// and prevents any deviations from the established pattern

/**
 * 🔒 IMMUTABLE CORE ARCHITECTURE VALIDATION
 * 
 * Ensures all generation requests use the correct pattern:
 * - Base Model: black-forest-labs/flux-dev-lora
 * - User LoRA: Loaded via lora_weights parameter
 * - Zero Cross-Contamination: Each user gets only their own LoRA
 */

export class ArchitectureValidator {
  
  // 🔒 IMMUTABLE BASE MODEL - NEVER CHANGE
  private static readonly REQUIRED_BASE_MODEL = "black-forest-labs/flux-dev-lora:a53fd9255ecba80d99eaab4706c698f861fd47b098012607557385416e46aae5";
  
  // 🔒 IMMUTABLE TRAINING MODEL - NEVER CHANGE
  // This model is ONLY used for training user LoRA weights, NOT for generation
  private static readonly REQUIRED_TRAINING_MODEL = "ostris/flux-dev-lora-trainer:26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2";

  /**
   * Validates that a generation request follows the correct architecture
   */
  static validateGenerationRequest(requestBody: any, userId: string): void {
    // Check base model
    if (requestBody.version !== this.REQUIRED_BASE_MODEL) {
      throw new Error(`🔒 ARCHITECTURE VIOLATION: Must use base model ${this.REQUIRED_BASE_MODEL}`);
    }

    // Check that lora_weights parameter exists
    if (!requestBody.input?.lora_weights) {
      throw new Error(`🔒 ARCHITECTURE VIOLATION: lora_weights parameter is required for user isolation`);
    }

    // Check that lora_weights contains user ID (ensures user isolation)
    if (!requestBody.input.lora_weights.includes(userId)) {
      throw new Error(`🔒 ARCHITECTURE VIOLATION: User ${userId} can only use their own LoRA weights`);
    }

    // Check that lora_scale is set for maximum effect
    if (requestBody.input.lora_scale !== 1.0) {
      throw new Error(`🔒 ARCHITECTURE VIOLATION: lora_scale must be 1.0 for maximum likeness`);
    }

    // Validate expert quality parameters
    this.validateExpertParameters(requestBody.input);
  }

  /**
   * Validates expert quality parameters are maintained
   */
  private static validateExpertParameters(input: any): void {
    const requiredParams = {
      guidance: 2.8,
      num_inference_steps: 35,
      output_quality: 95
    };

    for (const [param, expectedValue] of Object.entries(requiredParams)) {
      if (input[param] !== expectedValue) {
        throw new Error(`🔒 QUALITY VIOLATION: ${param} must be ${expectedValue} for expert results`);
      }
    }
  }

  /**
   * Validates training request uses correct trainer
   */
  static validateTrainingRequest(version: string): void {
    if (version !== this.REQUIRED_TRAINING_MODEL) {
      throw new Error(`🔒 TRAINING VIOLATION: Must use trainer ${this.REQUIRED_TRAINING_MODEL}`);
    }
  }

  /**
   * Ensures user model exists and is properly trained
   */
  static validateUserModel(userModel: any, userId: string): void {
    if (!userModel) {
      throw new Error(`User ${userId} must complete AI training before generating images`);
    }

    if (userModel.trainingStatus !== 'completed') {
      throw new Error(`User ${userId} model training is not completed. Current status: ${userModel.trainingStatus}`);
    }

    if (!userModel.replicateModelId) {
      throw new Error(`User ${userId} model missing LoRA weights reference`);
    }

    // Ensure the model reference contains the user ID (prevents cross-contamination)
    if (!userModel.replicateModelId.includes(userId)) {
      throw new Error(`🔒 ISOLATION VIOLATION: User ${userId} model reference must contain their user ID`);
    }
  }

  /**
   * Logs architecture compliance for audit purposes
   */
  static logArchitectureCompliance(userId: string, action: string): void {
    console.log(`🔒 ARCHITECTURE COMPLIANCE: User ${userId} - ${action} - Using correct FLUX LoRA architecture`);
  }
}