const SecurityChecks = {
  async runAllChecks() {
    const results = {
      rateLimit: await this.checkRateLimiting(),
      activityMonitoring: await this.checkActivityMonitoring(),
      suspiciousPatterns: await this.checkPatternDetection()
    };
    
    return this.generateReport(results);
  },

  async checkRateLimiting() {
    // Test rate limiting thresholds
    const tests = [
      this.testAuthRateLimit(),
      this.testContentRateLimit(),
      this.testBurstDetection()
    ];
    
    return Promise.all(tests);
  },

  async checkActivityMonitoring() {
    // Verify activity tracking
    const tests = [
      this.testLoginTracking(),
      this.testRequestTracking(),
      this.testLocationTracking()
    ];
    
    return Promise.all(tests);
  },

  async checkPatternDetection() {
    // Test pattern recognition
    const tests = [
      this.testFailedLoginPattern(),
      this.testBurstRequestPattern(),
      this.testLocationChangePattern()
    ];
    
    return Promise.all(tests);
  },

  generateReport(results) {
    // Create detailed security report
    return {
      timestamp: new Date(),
      summary: this.summarizeResults(results),
      details: results,
      recommendations: this.generateRecommendations(results)
    };
  }
}