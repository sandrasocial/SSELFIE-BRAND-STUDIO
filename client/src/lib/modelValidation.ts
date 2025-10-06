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

type ToastFunction = (message: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => void;
type NavigateFunction = (path: string) => void;

export function isModelValidationError(error: unknown): error is ModelValidationError {
  return error !== null && typeof error === 'object' && 
         ('requiresTraining' in error || 
          ('message' in error && typeof error.message === 'string' && 
           (error.message.includes('AI model') || error.message.includes('training'))));
}

export function handleModelValidationError(error: ModelValidationError, toast: ToastFunction, navigate: NavigateFunction) {
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

export function parseModelValidationResponse(response: unknown): ModelValidationResponse | null {
  if (response && typeof response === 'object' && 
      ('requiresTraining' in response || 'trainingStatus' in response)) {
    const resp = response as Record<string, unknown>;
    return {
      error: typeof resp.error === 'string' ? resp.error : undefined,
      requiresTraining: typeof resp.requiresTraining === 'boolean' ? resp.requiresTraining : undefined,
      trainingStatus: typeof resp.trainingStatus === 'string' ? resp.trainingStatus : undefined,
      redirectTo: typeof resp.redirectTo === 'string' ? resp.redirectTo : undefined
    };
  }
  return null;
}