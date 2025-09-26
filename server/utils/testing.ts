/**
 * Testing utilities for server components
 */

export interface TestConfig {
  mode: 'unit' | 'integration';
  enableMocks: boolean;
  timeoutMs?: number;
}

export const testingSystem = {
  config: {
    mode: 'unit' as const,
    enableMocks: true,
    timeoutMs: 5000
  },

  /**
   * Configure test environment
   */
  configure(config: Partial<TestConfig>): void {
    Object.assign(this.config, config);
  },

  /**
   * Reset test environment to defaults
   */
  reset(): void {
    this.config = {
      mode: 'unit',
      enableMocks: true,
      timeoutMs: 5000
    };
  }
};