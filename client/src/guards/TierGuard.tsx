import { ReactNode } from 'react';
import { useAuth } from '../hooks/use-auth';

interface TierGuardProps {
  requiredTier: 'creator' | 'entrepreneur';
  children: ReactNode;
}

// Upgrade prompt component for tier restrictions
function UpgradePrompt({ currentTier, requiredTier }: { currentTier: string; requiredTier: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Upgrade Required
          </h2>
          <div className="w-12 h-px bg-black mx-auto mb-4"></div>
        </div>
        
        <p className="text-gray-600 mb-6 font-light">
          This feature requires the <span className="font-medium capitalize">{requiredTier}</span> tier. 
          You're currently on the <span className="capitalize">{currentTier}</span> plan.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="w-full bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors font-light"
          >
            View Pricing Plans
          </button>
          
          <button 
            onClick={() => window.location.href = '/workspace'}
            className="w-full border border-gray-300 text-gray-700 px-6 py-3 hover:bg-gray-50 transition-colors font-light"
          >
            Back to Workspace
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p><strong>Entrepreneur Tier (€67/month)</strong> includes:</p>
          <ul className="mt-2 space-y-1">
            <li>✓ Victoria AI website builder</li>
            <li>✓ Business integrations</li>
            <li>✓ Priority support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function TierGuard({ requiredTier, children }: TierGuardProps) {
  const { user } = useAuth();
  
  // Get user's subscription tier
  const userTier = user?.subscription?.tier || 'creator'; // Default to creator tier
  
  // Admin bypass - Sandra has access to all tiers
  const isAdmin = user?.email === 'sandra@sselfie.ai' || 
                  user?.adminBypass === true;
  
  if (isAdmin) {
    return <>{children}</>;
  }
  
  // Check if user meets tier requirement
  if (requiredTier === 'entrepreneur' && userTier !== 'entrepreneur') {
    return <UpgradePrompt currentTier={userTier} requiredTier={requiredTier} />;
  }
  
  return <>{children}</>;
}