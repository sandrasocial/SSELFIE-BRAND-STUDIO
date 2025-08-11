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
  },
  debug: (data: any) => {
    if (process.env.NODE_ENV === 'development') {
      if (typeof data === 'object') {
        console.debug(`[DEBUG] ${new Date().toISOString()}:`, JSON.stringify(data));
      } else {
        console.debug(`[DEBUG] ${new Date().toISOString()}: ${data}`);
      }
    }
  }
};