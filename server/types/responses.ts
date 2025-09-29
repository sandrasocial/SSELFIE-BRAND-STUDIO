export interface SuccessResponse<T> {
  data: T;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}