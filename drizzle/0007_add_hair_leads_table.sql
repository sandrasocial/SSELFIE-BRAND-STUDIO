-- Migration: Add hair_leads table for Norwegian QR code signups
-- Created: 2025-01-20
-- Purpose: Capture hair salon leads from QR code signups with Norwegian fields

CREATE TABLE IF NOT EXISTS "hair_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"navn" varchar NOT NULL,
	"epost" varchar NOT NULL,
	"telefon" varchar,
	"kilde" varchar DEFAULT 'qr-code',
	"interesse" text,
	"levelpartner_synced" boolean DEFAULT false,
	"levelpartner_synced_at" timestamp,
	"status" varchar DEFAULT 'new',
	"notater" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_hair_leads_epost" ON "hair_leads" ("epost");
CREATE INDEX IF NOT EXISTS "idx_hair_leads_created" ON "hair_leads" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_hair_leads_kilde" ON "hair_leads" ("kilde");
