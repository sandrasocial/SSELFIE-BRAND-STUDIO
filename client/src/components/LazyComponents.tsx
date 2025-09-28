// ZARA'S FRONTEND OPTIMIZATION: Lazy loading components to reduce bundle size
import { lazy } from 'react';

// Large components that can be loaded on-demand (using existing pages)
// REMOVED: AdminConsultingAgents - admin components removed for Maya journey focus
export const MayaPhotoshoot = lazy(() => import('../pages/maya.js'));
export const VictoriaChat = lazy(() => import('../pages/victoria-chat.js'));

// Heavy utility components
export const ReactMarkdown = lazy(() => import('react-markdown'));

// Marketing automation components  
export const MarketingAutomation = lazy(() => import('../pages/marketing-automation.js'));