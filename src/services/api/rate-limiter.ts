interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // in milliseconds
}

class RateLimiter {
  private requests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.config.timeWindow
    );

    if (this.requests.length >= this.config.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.config.timeWindow - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.checkLimit();
    }

    this.requests.push(now);
    return true;
  }
}

export const rateLimiters = {
  twitter: new RateLimiter({ maxRequests: 300, timeWindow: 15 * 60 * 1000 }), // 300 requests per 15 minutes
  news: new RateLimiter({ maxRequests: 100, timeWindow: 24 * 60 * 60 * 1000 }), // 100 requests per day
  salesforce: new RateLimiter({ maxRequests: 100000, timeWindow: 24 * 60 * 60 * 1000 }), // 100k requests per day
  hubspot: new RateLimiter({ maxRequests: 100, timeWindow: 10 * 1000 }), // 100 requests per 10 seconds
};