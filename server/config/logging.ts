// Simple console logger - no external dependencies
export const logger = {
  info: (data: any) => {
    if (typeof data === 'object') {
      console.log(`[INFO] ${new Date().toISOString()}:`, JSON.stringify(data));
    } else {
      console.log(`[INFO] ${new Date().toISOString()}: ${data}`);
    }
  },
  error: (data: any) => {
    if (typeof data === 'object') {
      console.error(`[ERROR] ${new Date().toISOString()}:`, JSON.stringify(data));
    } else {
      console.error(`[ERROR] ${new Date().toISOString()}: ${data}`);
    }
  },
  warn: (data: any) => {
    if (typeof data === 'object') {
      console.warn(`[WARN] ${new Date().toISOString()}:`, JSON.stringify(data));
    } else {
      console.warn(`[WARN] ${new Date().toISOString()}: ${data}`);
    }
  }
};

// Simple performance tracking - no external dependencies
export const trackPerformance = (name: string, fn: Function) => {
  return async (...args: any[]) => {
    const startTime = Date.now();
    try {
      const result = await fn(...args);
      console.log(`[PERF] ${name}: ${Date.now() - startTime}ms`);
      return result;
    } catch (error) {
      console.error(`[PERF ERROR] ${name}:`, error);
      throw error;
    }
  };
};