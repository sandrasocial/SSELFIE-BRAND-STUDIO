export interface SecurityConfig {
  csrfEnabled: boolean;
  rateLimitEnabled: boolean;
  maxRequestsPerWindow: number;
  timeWindow: number;
}

export interface CSRFToken {
  token: string;
  expires: Date;
}

export interface RateLimitInfo {
  windowMs: number;
  max: number;
  message: string;
}

export interface SecurityHeaders {
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
  'Content-Security-Policy': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
}