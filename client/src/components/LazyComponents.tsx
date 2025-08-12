// ZARA'S FRONTEND OPTIMIZATION: Lazy loading components to reduce bundle size
import { lazy } from 'react';

// Large components that can be loaded on-demand
export const AdminConsultingAgents = lazy(() => import('../pages/admin-consulting-agents'));
export const TrainingEditor = lazy(() => import('../pages/training-editor'));
export const ImageGeneration = lazy(() => import('../pages/image-generation'));
export const MemberWorkspace = lazy(() => import('../pages/member-workspace'));
export const BusinessStrategist = lazy(() => import('../pages/business-strategist'));

// Heavy utility components
export const ReactMarkdown = lazy(() => import('react-markdown'));
export const CodeEditor = lazy(() => import('../components/code-editor'));

// Marketing automation components
export const EmailCampaigns = lazy(() => import('../pages/email-campaigns'));
export const MarketingAutomation = lazy(() => import('../pages/marketing-automation'));