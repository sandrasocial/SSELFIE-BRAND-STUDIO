/**
 * STARTUP GUARD: Ensure concept_cards table exists
 * 
 * Bypasses drizzle-kit interactive prompt by creating the table programmatically
 * Uses CREATE TABLE IF NOT EXISTS for idempotent startup execution
 */

import { db } from '../drizzle';
import { sql } from 'drizzle-orm';

export async function ensureConceptCardsTable(): Promise<void> {
  try {
    console.log('🔧 DATABASE: Ensuring concept_cards table exists...');
    
    // Create concept_cards table without foreign key constraints (standalone for hybrid backend)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS concept_cards (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        conversation_id VARCHAR,
        client_id VARCHAR,
        title VARCHAR NOT NULL,
        description TEXT,
        images JSONB,
        tags JSONB,
        status VARCHAR DEFAULT 'draft',
        sort_order INTEGER DEFAULT 0,
        generated_images JSONB,
        is_loading BOOLEAN DEFAULT false,
        is_generating BOOLEAN DEFAULT false,
        has_generated BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes for performance (idempotent)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_concept_cards_user ON concept_cards(user_id);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_concept_cards_conversation ON concept_cards(conversation_id);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_concept_cards_client_id ON concept_cards(user_id, client_id);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_concept_cards_sort ON concept_cards(sort_order);
    `);

    console.log('✅ DATABASE: concept_cards table and indexes ensured');
    
  } catch (error) {
    console.error('❌ DATABASE: Failed to ensure concept_cards table:', error);
    throw error;
  }
}