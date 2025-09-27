import { db } from '../../drizzle.js';
import { pgTable, serial, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  fullName: text('full_name'),
  phone: text('phone'),
  location: text('location'),
  instagramHandle: text('instagram_handle'),
  websiteUrl: text('website_url'),
  bio: text('bio'),
  brandVibe: text('brand_vibe'),
  goals: text('goals'),
  replicateModelId: text('replicate_model_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export interface UserProfile {
  id: number;
  userId: string;
  fullName: string | null;
  phone: string | null;
  location: string | null;
  instagramHandle: string | null;
  websiteUrl: string | null;
  bio: string | null;
  brandVibe: string | null;
  goals: string | null;
  replicateModelId: string | null;
  createdAt: Date;
  updatedAt: Date;
}