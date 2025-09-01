import { storage } from '../storage';
import { PLANS } from '../config/plans';

// Edge guard to normalize any stragglers on first request
export async function normalizePlanMiddleware(req: any, res: any, next: any) {
  if (req.user && req.user.claims) {
    const user = await storage.getUser(req.user.claims.sub);
    
    if (user) {
      const legacy = new Set(['basic', 'pro', 'full-access', 'studio', 'free', null]);
      
      // If user has legacy plan, normalize to sselfie-studio
      if (legacy.has(user.plan) && user.role !== 'admin') {
        console.log(`🔄 Normalizing legacy plan "${user.plan}" to sselfie-studio for user ${user.email}`);
        
        await storage.updateUser(user.id, { 
          plan: 'sselfie-studio', 
          monthlyGenerationLimit: PLANS.sselfieStudio.monthlyGenerations 
        });
      }
    }
  }
  
  next();
}