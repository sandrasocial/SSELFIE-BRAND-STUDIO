import React from 'react';
import { UnifiedNavigation } from './unified-navigation.js';

// Re-export the unified navigation as MemberNavigation for backward compatibility
export function MemberNavigation(props: any) {
  return <UnifiedNavigation {...props} />;
}