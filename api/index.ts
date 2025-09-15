import { app, setupApp } from '../server/index.js';

export default async function handler(req: any, res: any) {
  // Initialize the app if not already done
  await setupApp();
  
  // Handle the request
  return app(req, res);
}
