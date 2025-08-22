const Redis = require('redis');

class RedisManager {
  constructor() {
    this.client = null;
  }

  async connect() {
    try {
      this.client = Redis.createClient({
        url: process.env.REDIS_URL,
        retry_strategy: (options) => {
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      await this.client.connect();
      
      this.client.on('error', (err) => console.error('Redis Client Error', err));
      this.client.on('connect', () => console.log('Redis Client Connected'));
      
      return this.client;
    } catch (error) {
      console.error('Redis connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }
    return this.client;
  }
}

module.exports = new RedisManager();