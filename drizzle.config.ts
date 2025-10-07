import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: [
    './shared/schema.ts',
    './shared/schema-maya.ts',
    './shared/styleguide-schema.ts'
  ],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  // Neon serverless driver doesn't need special configuration for schema operations
  // The connection will use whatever driver is configured in the app
});
