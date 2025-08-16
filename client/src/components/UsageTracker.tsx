import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface UsageStatus {
  canGenerate: boolean;
  remainingGenerations: number;
  totalUsed: number;
  totalAllowed: number;
  monthlyUsed?: number;
  monthlyAllowed?: number;
  resetDate?: string;
  reason?: string;
}

interface UsageStats {
  plan: string;
  planLimits: {
    totalGenerations: number | null;
    monthlyGenerations: number | null;
    cost: number;
    description: string;
    resetMonthly: boolean;
  };
  usage: UsageStatus;
  totalCostIncurred: number;
  lastGenerationAt: string | null;
}

export default function UsageTracker() {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: usageStatus } = useQuery<UsageStatus>({
    queryKey: ["/api/usage/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: usageStats } = useQuery<UsageStats>({
    queryKey: ["/api/usage/stats"],
    refetchInterval: 60000, // Refresh every minute
  });

  if (!usageStatus) {
    return null;
  }

  const getStatusColor = () => {
    // Admin users always show green
    if (usageStatus.remainingGenerations >= 999999) return "text-emerald-600";
    if (!usageStatus.canGenerate) return "text-red-500";
    if (usageStatus.remainingGenerations <= 10) return "text-yellow-600";
    return "text-emerald-600";
  };

  const getProgressPercentage = () => {
    if (usageStatus.monthlyAllowed) {
      // Monthly subscription
      return Math.min((usageStatus.monthlyUsed || 0) / usageStatus.monthlyAllowed * 100, 100);
    } else {
      // One-time AI Pack
      return Math.min(usageStatus.totalUsed / usageStatus.totalAllowed * 100, 100);
    }
  };

  const formatResetDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Resets today";
    if (diffDays === 1) return "Resets tomorrow";
    return `Resets in ${diffDays} days`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-none">
      {/* Compact Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-900">
              Usage
            </div>
            <div className={`text-sm font-bold ${getStatusColor()}`}>
              {usageStatus.remainingGenerations >= 999999 ? 'Unlimited' : `${usageStatus.remainingGenerations} remaining`}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!usageStatus.canGenerate && (
              <div className="text-xs text-red-500 font-medium">
                LIMIT REACHED
              </div>
            )}
            <div className="text-xs text-gray-400">
              {isExpanded ? "−" : "+"}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-none h-1">
          <div 
            className={`h-1 rounded-none transition-all duration-300 ${
              usageStatus.canGenerate ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && usageStats && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Plan Information */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
              Current Plan
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              {usageStats.plan === 'ai-pack' ? 'SSELFIE AI Pack' : 
               usageStats.plan === 'studio-founding' ? 'Studio Founding' : 
               'Studio Standard'}
            </div>
            <div className="text-xs text-gray-600">
              {usageStats.planLimits.description}
            </div>
          </div>

          {/* Usage Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Used</div>
              <div className="text-sm font-medium text-gray-900">
                {usageStats.planLimits.resetMonthly 
                  ? `${usageStatus.monthlyUsed || 0} this month`
                  : `${usageStatus.totalUsed} total`
                }
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">Allowed</div>
              <div className="text-sm font-medium text-gray-900">
                {usageStats.planLimits.resetMonthly 
                  ? `${usageStatus.monthlyAllowed || 0}/month`
                  : `${usageStatus.totalAllowed} total`
                }
              </div>
            </div>
          </div>

          {/* Reset Information for Monthly Plans */}
          {usageStats.planLimits.resetMonthly && usageStatus.resetDate && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Next Reset</div>
              <div className="text-sm font-medium text-gray-900">
                {formatResetDate(usageStatus.resetDate)}
              </div>
            </div>
          )}

          {/* Limit Reached Message */}
          {!usageStatus.canGenerate && usageStatus.reason && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-none">
              <div className="text-sm text-red-800">
                {usageStatus.reason}
              </div>
              {usageStats.plan === 'ai-pack' && (
                <div className="mt-2">
                  <a 
                    href="/pricing" 
                    className="text-sm text-red-600 hover:text-red-700 underline"
                  >
                    Upgrade to Studio for monthly generations
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Cost Information (for transparency) */}
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Total Cost Incurred</div>
            <div className="text-sm text-gray-600">
              ${usageStats.totalCostIncurred.toFixed(4)} USD
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Each generation costs ~$0.038 (4 images)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}