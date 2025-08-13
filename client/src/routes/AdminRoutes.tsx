import { Route, Switch } from "wouter";
import { lazy, Suspense } from 'react';
import AdminRoute from '../guards/AdminRoute';

// Admin Consulting Agents Pages
const AdminConsultingAgents = lazy(() => import('../pages/admin-consulting-agents'));
const AdminDashboard = lazy(() => import('../pages/admin-dashboard'));
const AdminBusinessOverview = lazy(() => import('../pages/admin-business-overview'));
const AdminSubscriberImport = lazy(() => import('../pages/admin-subscriber-import'));
const BridgeMonitor = lazy(() => import('../pages/admin/bridge-monitor'));
const AdminAccessOnly = lazy(() => import('../pages/admin-access-only'));

// Legacy admin components (protected but archived)
const AgentApproval = lazy(() => import('../pages/agent-approval'));
const AgentCommandCenter = lazy(() => import('../pages/agent-command-center'));
const RachelChat = lazy(() => import('../pages/rachel-chat'));
const RachelActivation = lazy(() => import('../pages/rachel-activation'));

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
    </div>
  );
}

export default function AdminRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        {/* SANDRA'S ADMIN DASHBOARD SYSTEM */}
        <Route path="/admin" component={(props) => <AdminRoute component={AdminDashboard} {...props} />} />
        <Route path="/admin/consulting-agents" component={(props) => <AdminRoute component={AdminConsultingAgents} {...props} />} />
        <Route path="/admin/business-overview" component={(props) => <AdminRoute component={AdminBusinessOverview} {...props} />} />
        <Route path="/admin/subscriber-import" component={(props) => <AdminRoute component={AdminSubscriberImport} {...props} />} />
        <Route path="/admin/bridge-monitor" component={(props) => <AdminRoute component={BridgeMonitor} {...props} />} />
        
        {/* ADMIN ACCESS FALLBACK */}
        <Route path="/admin-access-only" component={AdminAccessOnly} />
        
        {/* LEGACY ADMIN ROUTES - ARCHIVED BUT PROTECTED */}
        <Route path="/agent-approval" component={(props) => <AdminRoute component={AgentApproval} {...props} />} />
        <Route path="/agent-command-center" component={(props) => <AdminRoute component={AgentCommandCenter} {...props} />} />
        <Route path="/rachel-chat" component={(props) => <AdminRoute component={RachelChat} {...props} />} />
        <Route path="/rachel-activation" component={(props) => <AdminRoute component={RachelActivation} {...props} />} />
        
        {/* MARKETING AUTOMATION - ADMIN ONLY */}
        <Route path="/marketing-automation" component={(props) => <AdminRoute component={lazy(() => import('../pages/marketing-automation'))} {...props} />} />
      </Switch>
    </Suspense>
  );
}