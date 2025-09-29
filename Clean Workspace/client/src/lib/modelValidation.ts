/**
 * Model Validation Helper for User Model Enforcement
 * Ensures every user has a completed AI model before any generation
 */

interface ModelValidationResponse {
  error?: string;
  requiresTraining?: boolean;
  trainingStatus?: string;
  redirectTo?: string;
}

interface ModelValidationError extends Error {
  requiresTraining?: boolean;
  trainingStatus?: string;
  redirectTo?: string;
}

export function isModelValidationError(error: any): error is ModelValidationError {
  return error && typeof error === 'object' && 
         (error.requiresTraining === true || 
          error.message?.includes('AI model') || 
          error.message?.includes('training'));
}

export function handleModelValidationError(error: ModelValidationError, toast: any, navigate: any) {
  // Show user-friendly error message
  toast({
    title: "AI Model Required",
    description: error.message || "Please complete your AI model training first.",
    variant: "destructive",
  });
  
  // Redirect to training page after short delay
  setTimeout(() => {
    navigate(error.redirectTo || '/simple-training');
  }, 1500);
}

export function parseModelValidationResponse(response: any): ModelValidationResponse | null {
  if (response.requiresTraining || response.trainingStatus) {
    return {
      error: response.error,
      requiresTraining: response.requiresTraining,
      trainingStatus: response.trainingStatus,
      redirectTo: response.redirectTo
    };
  }
  return null;
}