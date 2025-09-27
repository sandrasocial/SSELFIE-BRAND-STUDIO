// Migrate script to apply Drizzle migrations
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import * as fs from 'fs';

// Load .env.server file
dotenv.config({ path: '.env.server' });

const setupDb = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in .env.server');
  }

  try {
    // Connect to database
    const client = neon(process.env.DATABASE_URL!);
    const db = drizzle(client);

    // Helper function to split SQL preserving dollar-quoted strings
    function splitSqlPreservingQuotes(sql: string): string[] {
      const queries: string[] = [];
      let currentQuery = '';
      let inQuote = false;
      let quoteChar = '';
      let dollarQuote = '';

      for (let i = 0; i < sql.length; i++) {
        const char = sql[i];
        const nextChar = sql[i + 1];

        if (!inQuote && char === '$' && nextChar === '$') {
          inQuote = true;
          quoteChar = '$$';
          currentQuery += char;
        } else if (inQuote && char === '$' && nextChar === '$' && quoteChar === '$$') {
          inQuote = false;
          quoteChar = '';
          currentQuery += char;
        } else if (!inQuote && char === ';') {
          currentQuery = currentQuery.trim();
          if (currentQuery) {
            queries.push(currentQuery);
          }
          currentQuery = '';
        } else {
          currentQuery += char;
        }
      }

      currentQuery = currentQuery.trim();
      if (currentQuery) {
        queries.push(currentQuery);
      }

      return queries;
    }

    // Run setup.sql first
    console.log('Running setup script...');
    const setupContent = await fs.promises.readFile('./setup.sql', 'utf-8');
    const setupQueries = splitSqlPreservingQuotes(setupContent);
    
    for (const query of setupQueries) {
      try {
        await client.query(query);
        console.log('  ✓ Executed query successfully');
      } catch (error: any) {
        if (error.code === '42P07') { // duplicate table
          console.log('  ℹ Table already exists, skipping');
        } else if (error.code === '42P01') { // table doesn't exist
          console.log('  ℹ Referenced table does not exist yet, skipping');
        } else if (error.code === '42701') { // duplicate column
          console.log('  ℹ Column already exists, skipping');
        } else {
          console.error('  ❌ Error:', error.message);
        }
      }
    }
    
    console.log('\n✅ Setup completed!\n');

  } catch (error) {
    console.error('Failed to run setup:', error);
    process.exit(1);
  }
};

setupDb();