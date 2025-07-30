// SSELFIE Studio Subscriber Import Routes
// Flodesk & ManyChat Integration for Email List Migration

import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import FlodeskImportService from '../services/flodesk-import';
import { ManyChatImportService } from '../services/manychat-import';
import { randomUUID } from 'crypto';
import { storage } from '../storage';

const router = Router();

// Admin-only middleware for subscriber imports
const isAdmin = async (req: any, res: any, next: any) => {
  const user = req.user;
  if (!user || user.claims.email !== 'ssa@ssasocial.com') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Import subscribers from Flodesk
router.post('/flodesk/import', isAuthenticated, isAdmin, async (req, res) => {
  try {
    console.log('🚀 Starting Flodesk subscriber import...');
    
    const flodeskService = new FlodeskImportService();
    const subscribers = await flodeskService.importSubscribers((progress, total) => {
      console.log(`📊 Flodesk import progress: ${progress}/${total}`);
    });

    // Store subscribers in database
    const { db } = await import('../db');
    const { importedSubscribers } = await import('../../shared/schema');
    
    const insertedSubscribers = [];
    for (const subscriber of subscribers) {
      try {
        const [inserted] = await db
          .insert(importedSubscribers)
          .values({
            id: randomUUID(),
            email: subscriber.email,
            firstName: subscriber.firstName,
            lastName: subscriber.lastName,
            source: subscriber.source,
            originalId: subscriber.originalId || subscriber.email,
            status: subscriber.status,
            tags: subscriber.tags,
            customFields: subscriber.customFields,
            importedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        
        insertedSubscribers.push(inserted);
      } catch (error: any) {
        // Skip duplicates silently
        if (error.code === '23505') {
          console.log(`⏭️ Skipping duplicate subscriber: ${subscriber.email}`);
        } else {
          console.error('Error inserting subscriber:', subscriber.email, error);
        }
      }
    }

    res.json({
      success: true,
      message: `Successfully imported ${insertedSubscribers.length} Flodesk subscribers`,
      imported: insertedSubscribers.length,
      total: subscribers.length
    });

  } catch (error) {
    console.error('Flodesk import error:', error);
    res.status(500).json({ 
      error: 'Failed to import Flodesk subscribers',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Import subscribers from ManyChat
router.post('/manychat/import', isAuthenticated, isAdmin, async (req, res) => {
  try {
    console.log('🚀 Starting ManyChat API subscriber import...');
    
    if (!process.env.MANYCHAT_API_KEY) {
      return res.status(400).json({ 
        error: 'ManyChat API key not configured',
        details: 'Please add MANYCHAT_API_KEY to environment variables'
      });
    }

    // Make direct API call to ManyChat
    const response = await fetch('https://api.manychat.com/fb/subscriber/findBySystemField', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MANYCHAT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        field_name: 'email',
        field_value: '*' // Get all subscribers with email
      })
    });

    if (!response.ok) {
      console.error('ManyChat API error:', response.status, response.statusText);
      return res.status(400).json({ 
        error: 'ManyChat API error',
        details: `API returned ${response.status}: ${response.statusText}`
      });
    }

    const data = await response.json();
    console.log('📊 ManyChat API response:', data);

    // For now, return success with placeholder data
    // We'll implement the full import logic once we confirm API access
    res.json({
      success: true,
      message: 'ManyChat API connection successful',
      imported: 0,
      total: 0,
      apiResponse: data
    });

  } catch (error) {
    console.error('ManyChat import error:', error);
    res.status(500).json({ 
      error: 'Failed to import ManyChat subscribers',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Import from both platforms
router.post('/import-all', isAuthenticated, isAdmin, async (req, res) => {
  try {
    console.log('🚀 Starting complete subscriber import from all platforms...');
    
    const results = {
      flodesk: { success: false, count: 0, error: null },
      manychat: { success: false, count: 0, error: null }
    };

    // Import from Flodesk
    try {
      const flodeskService = new FlodeskImportService();
      const flodeskSubscribers = await flodeskService.importSubscribers();
      
      const { db } = await import('../db');
      const { importedSubscribers } = await import('../../shared/schema');
      
      for (const subscriber of flodeskSubscribers) {
        try {
          await db
            .insert(importedSubscribers)
            .values(subscriber)
            .onConflictDoNothing();
          results.flodesk.count++;
        } catch (error) {
          console.error('Error inserting Flodesk subscriber:', error);
        }
      }
      
      results.flodesk.success = true;
    } catch (error) {
      results.flodesk.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Flodesk import failed:', error);
    }

    // Import from ManyChat
    try {
      const manychatService = new ManyChatImportService();
      const manychatSubscribers = await manychatService.importSubscribers();
      
      const { db } = await import('../db');
      const { importedSubscribers } = await import('../../shared/schema');
      
      for (const subscriber of manychatSubscribers) {
        try {
          await db
            .insert(importedSubscribers)
            .values(subscriber)
            .onConflictDoNothing();
          results.manychat.count++;
        } catch (error) {
          console.error('Error inserting ManyChat subscriber:', error);
        }
      }
      
      results.manychat.success = true;
    } catch (error) {
      results.manychat.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('ManyChat import failed:', error);
    }

    res.json({
      success: results.flodesk.success || results.manychat.success,
      message: 'Subscriber import completed',
      results: {
        flodesk: {
          imported: results.flodesk.count,
          success: results.flodesk.success,
          error: results.flodesk.error
        },
        manychat: {
          imported: results.manychat.count,
          success: results.manychat.success,
          error: results.manychat.error
        },
        total: results.flodesk.count + results.manychat.count
      }
    });

  } catch (error) {
    console.error('Complete import error:', error);
    res.status(500).json({ 
      error: 'Failed to complete subscriber import',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get import status and statistics
router.get('/status', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { db } = await import('../db');
    const { importedSubscribers } = await import('../../shared/schema');
    const { sql } = await import('drizzle-orm');

    const stats = await db
      .select({
        source: importedSubscribers.source,
        total: sql<number>`count(*)`,
        active: sql<number>`sum(case when status = 'active' then 1 else 0 end)`,
        withEmail: sql<number>`sum(case when email is not null then 1 else 0 end)`
      })
      .from(importedSubscribers)
      .groupBy(importedSubscribers.source);

    res.json({
      success: true,
      stats,
      lastImport: await db
        .select({ importedAt: importedSubscribers.importedAt })
        .from(importedSubscribers)
        .orderBy(sql`imported_at desc`)
        .limit(1)
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      error: 'Failed to get import status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;