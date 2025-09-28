import { useEffect, useState } from 'react';
import { FeatureFlag, featureFlags } from '../shared/feature-flags.js';

interface UseFeatureFlagOptions {
  defaultValue?: boolean;
  scope?: 'global' | 'user' | 'beta';
}

export function useFeatureFlag(
  flagName: string,
  options: UseFeatureFlagOptions = {}
): [boolean, (enabled: boolean) => void] {
  const [isEnabled, setIsEnabled] = useState(() => {
    const flag = featureFlags[flagName];
    return flag?.enabled ?? options.defaultValue ?? false;
  });

  // Check dependencies
  useEffect(() => {
    const flag = featureFlags[flagName];
    if (flag?.dependencies?.length) {
      const dependenciesMet = flag.dependencies.every(
        (dep: string) => featureFlags[dep]?.enabled
      );
      if (!dependenciesMet) {
        setIsEnabled(false);
      }
    }
  }, [flagName]);

  const setEnabled = (enabled: boolean) => {
    if (featureFlags[flagName]) {
      featureFlags[flagName].enabled = enabled;
      setIsEnabled(enabled);
    }
  };

  return [isEnabled, setEnabled];
}