export interface ConfigItem<T = unknown> {
  value: T;
  category?: string;
  isSecret?: boolean;
  isRequired?: boolean;
  validation?: (value: T) => boolean;
  description?: string;
}

export interface ConfigCategory {
  name: string;
  description: string;
  items: Record<string, ConfigItem>;
}

export type ConfigPath = string;

export interface ConfigValue<T = unknown> {
  value: T;
  category?: string;
  isSecret?: boolean;
  isRequired?: boolean;
}

export interface ConfigurationSummary {
  totalSections: number;
  totalValues: number;
  requiredValues: number;
  optionalValues: number;
  environment: string;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConfigExport {
  [key: string]: unknown;
}

export interface ConfigImport {
  [key: string]: unknown;
}

export interface ConfigEnvironment {
  name: string;
  values: Record<string, ConfigValue>;
  parent?: string;
}

export interface ConfigManagerOptions {
  validateOnSet?: boolean;
  allowDynamicKeys?: boolean;
  autoCreateCategories?: boolean;
  persistChanges?: boolean;
}

// Interfaces for different config categories
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
}

export interface SecurityConfig {
  jwtSecret: string;
  sessionSecret: string;
  bcryptRounds: number;
  allowedOrigins: string[];
}

export interface LoggingConfig {
  level: string;
  file?: string;
  console: boolean;
  format: string;
}