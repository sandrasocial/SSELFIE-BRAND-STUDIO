interface ProtectedRouteConfig {
  path: string;
  methods: string[];
  roles: string[];
}

// Define protected routes and their required roles
export const protectedRoutes: ProtectedRouteConfig[] = [
  {
    path: '/api/user/profile',
    methods: ['GET', 'PUT'],
    roles: ['user', 'admin']
  },
  {
    path: '/api/admin/*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    roles: ['admin']
  },
  {
    path: '/api/photos/*',
    methods: ['POST', 'PUT', 'DELETE'],
    roles: ['user', 'admin']
  },
  {
    path: '/api/settings/*',
    methods: ['GET', 'PUT'],
    roles: ['user', 'admin']
  }
];

// Helper function to check if a route requires protection
export const requiresAuth = (path: string, method: string): boolean => {
  return protectedRoutes.some(route => {
    const pathMatch = route.path.endsWith('*') 
      ? path.startsWith(route.path.slice(0, -1))
      : path === route.path;
    return pathMatch && route.methods.includes(method);
  });
};

// Get required roles for a route
export const getRequiredRoles = (path: string, method: string): string[] => {
  const route = protectedRoutes.find(r => {
    const pathMatch = r.path.endsWith('*') 
      ? path.startsWith(r.path.slice(0, -1))
      : path === r.path;
    return pathMatch && r.methods.includes(method);
  });
  return route?.roles || [];
};