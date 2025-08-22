// OLGA'S CONTEXT MAPPING SYSTEM
// Eliminates "missing context" problems with clear file location guidance

export const FILE_LOCATION_GUIDE = {
  controllers: {
    location: "server/routes.ts",
    purpose: "Handle HTTP requests and route to services",
    example: "User authentication routes, payment endpoints",
    template: "router.post('/api/auth/login', authController.login)"
  },
  services: {
    location: "server/services/",
    purpose: "Implement business logic and data processing",
    example: "AuthenticationService.ts, ImageProcessingService.ts",
    template: "export class AuthenticationService { ... }"
  },
  components: {
    location: "client/src/components/",
    purpose: "Reusable UI elements and React components",
    example: "Button.tsx, LoginForm.tsx, Dashboard.tsx",
    template: "export function ComponentName({ props }: Props) { ... }"
  },
  pages: {
    location: "client/src/pages/",
    purpose: "Full page components and route handlers",
    example: "LandingPage.tsx, WorkspacePage.tsx, AdminPage.tsx",
    template: "export function PageName() { ... }"
  },
  types: {
    location: "shared/schema.ts",
    purpose: "Database schemas and shared TypeScript types",
    example: "User model, Subscription model, API types",
    template: "export const users = pgTable('users', { ... })"
  },
  utilities: {
    location: "client/src/lib/ OR server/utils/",
    purpose: "Helper functions and utility modules",
    example: "dateFormatters.ts, validationHelpers.ts",
    template: "export function utilityFunction() { ... }"
  },
  styles: {
    location: "client/src/styles/",
    purpose: "CSS files and styling modules",
    example: "globals.css, components.css",
    template: ".class-name { ... }"
  },
  assets: {
    location: "client/src/assets/ OR attached_assets/",
    purpose: "Images, fonts, and static files",
    example: "logo.png, brand-assets.svg",
    template: "import assetPath from '@assets/filename'"
  }
};

export const NAVIGATION_HELPERS = {
  findExistingImplementation: [
    "Search for similar functionality in current location",
    "Check naming patterns in target directory",
    "Review existing file structure",
    "Follow established conventions"
  ],
  chooseCorrectLocation: {
    "Handling user requests": "server/routes.ts",
    "Processing business logic": "server/services/",
    "Showing UI to users": "client/src/pages/ or client/src/components/",
    "Defining data structure": "shared/schema.ts",
    "Helper functions": "client/src/lib/ or server/utils/",
    "Styling appearance": "client/src/styles/"
  },
  quickLocationCheck: {
    "Does it handle HTTP requests?": "server/routes.ts",
    "Does it render UI?": "client/src/",
    "Does it process data?": "server/services/",
    "Is it shared between frontend/backend?": "shared/",
    "Is it a utility?": "lib/ or utils/"
  }
};

export const CONTEXT_PRESERVATION = {
  beforeMovingFiles: [
    "Check all import statements",
    "Update path references",
    "Verify TypeScript compilation",
    "Test functionality after move"
  ],
  documentingChanges: [
    "Note reason for location choice",
    "Document any new patterns",
    "Update related documentation",
    "Inform relevant domain owners"
  ]
};