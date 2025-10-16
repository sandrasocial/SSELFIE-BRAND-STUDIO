import * as React from 'react';
import { UnifiedNavigation } from './unified-navigation.js';

interface MemberNavigationProps {
  transparent?: boolean;
  darkText?: boolean;
  showAuth?: boolean;
}

// Re-export the unified navigation as MemberNavigation for backward compatibility
export function MemberNavigation(props: MemberNavigationProps) {
  return <UnifiedNavigation {...props} />;
}