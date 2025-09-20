import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../server/db/drizzle';
import { hairLeads, insertHairLeadSchema } from '../shared/schema';

export const config = { runtime: 'nodejs20.x' } as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests for creating leads
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📧 Hair leads API: Handling lead creation');
    console.log('📧 Request body:', JSON.stringify(req.body, null, 2));

    // Validate the request body
    const leadData = insertHairLeadSchema.parse(req.body);

    // Additional validation for required Norwegian fields
    if (!leadData.navn || !leadData.epost) {
      return res.status(400).json({ 
        error: 'Navn og epost er påkrevd', 
        message: 'Name and email are required' 
      });
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadData.epost)) {
      return res.status(400).json({ 
        error: 'Ugyldig epost-adresse', 
        message: 'Invalid email address' 
      });
    }

    // Check if email already exists
    const existingLead = await db.query.hairLeads.findFirst({
      where: (leads, { eq }) => eq(leads.epost, leadData.epost)
    });

    if (existingLead) {
      console.log('📧 Email already exists:', leadData.epost);
      return res.status(400).json({ 
        error: 'Denne epost-adressen er allerede registrert', 
        message: 'This email is already registered' 
      });
    }

    // Insert the new lead
    const newLead = await db.insert(hairLeads).values({
      navn: leadData.navn,
      epost: leadData.epost,
      telefon: leadData.telefon || null,
      interesse: leadData.interesse || null,
      kilde: leadData.kilde || 'qr-code',
      status: 'new'
    }).returning();

    console.log('✅ Hair lead created successfully:', newLead[0].id);

    return res.status(201).json({
      success: true,
      message: 'Takk for din interesse! Vi kontakter deg snart.',
      englishMessage: 'Thank you for your interest! We will contact you soon.',
      leadId: newLead[0].id
    });

  } catch (error: any) {
    console.error('❌ Hair leads API error:', error);

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Ugyldig data',
        message: 'Invalid data provided',
        details: error.errors
      });
    }

    // Handle database errors
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(400).json({
        error: 'Denne epost-adressen er allerede registrert',
        message: 'This email is already registered'
      });
    }

    return res.status(500).json({
      error: 'Det oppstod en feil på serveren',
      message: 'Internal server error'
    });
  }
}
