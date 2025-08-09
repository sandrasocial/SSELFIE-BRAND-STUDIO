import React from 'react';
import { Route, Switch } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

// Import your pages
import Landing from '@/pages/landing';
import EditorialLanding from '@/pages/editorial-landing';
import About from '@/pages/about';
import HowItWorks from '@/pages/how-it-works';
import Contact from '@/pages/contact';
import Pricing from '@/pages/pricing';
import Login from '@/pages/login';
import NotFound from '@/pages/not-found';

// Public routes configuration
const publicRoutes = [
  { path: '/', component: Landing },
  { path: '/editorial-landing', component: EditorialLanding },
  { path: '/about', component: About },
  { path: '/how-it-works', component: HowItWorks },
  { path: '/contact', component: Contact },
  { path: '/pricing', component: Pricing },
  { path: '/login', component: Login },
];

export const Routes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      {/* Public Routes */}
      {publicRoutes.map(({ path, component: Component }) => (
        <Route key={path} path={path}>
          <Component />
        </Route>
      ))}

      {/* Protected Routes */}
      {isAuthenticated ? (
        <Route path="/app/*">
          <ProtectedRoutes />
        </Route>
      ) : (
        <Route path="/app/*">
          <Navigate to="/login" />
        </Route>
      )}

      {/* 404 Route */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
};

export default Routes;