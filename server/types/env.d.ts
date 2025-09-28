declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      LOG_LEVEL?: string;
      NEW_ERROR_HANDLING?: string;
      ENHANCED_LOGGING?: string;
      REQUEST_MONITORING?: string;
      UNIFIED_AI_SERVICE?: string;
      ROUTE_CONSOLIDATION?: string;
      DATABASE_ABSTRACTION?: string;
      COMPREHENSIVE_TESTING?: string;
      PERFORMANCE_MONITORING?: string;
      SECURITY_HARDENING?: string;
      VERBOSE_LOGGING?: string;
      MODEL_BASE_PATH?: string;
      TEMP_PATH?: string;
      AWS_S3_BUCKET?: string;
      AWS_REGION?: string;
      SLACK_WEBHOOK_URL?: string;
      ERROR_EMAIL?: string;
      SECURITY_EMAIL?: string;
      npm_package_version: string;
      ERROR_LOG_PATH?: string;
      MONITORING_ENDPOINT?: string;
      LOG_REMOTE_ENDPOINT?: string;

      // Add other environment variables used in the project
      [key: string]: string | undefined;
    }
  }
}

export {};