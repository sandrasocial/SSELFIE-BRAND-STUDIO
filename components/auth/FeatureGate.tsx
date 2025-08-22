import { useAuth } from '@/hooks/useAuth';

interface FeatureGateProps {
  children: React.ReactNode;
  requiredSubscription: 'creator' | 'entrepreneur';
  fallback?: React.ReactNode;
}

export const FeatureGate = ({ 
  children, 
  requiredSubscription,
  fallback 
}: FeatureGateProps) => {
  const { user } = useAuth();

  if (!user) {
    return fallback || null;
  }

  const subscriptionTiers = {
    creator: ['creator', 'entrepreneur'],
    entrepreneur: ['entrepreneur']
  };

  const hasAccess = subscriptionTiers[requiredSubscription].includes(user.subscription);

  if (!hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
};