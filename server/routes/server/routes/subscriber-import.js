"use strict";
// SSELFIE Studio Subscriber Import Routes
// Flodesk & ManyChat Integration for Email List Migration
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flodesk_import_1 = require("../services/flodesk-import");
const manychat_import_1 = require("../services/manychat-import");
const crypto_1 = require("crypto");
const admin_middleware_1 = require("../middleware/admin-middleware");
const router = (0, express_1.Router)();
// Import subscribers from Flodesk
router.post('/flodesk/import', admin_middleware_1.requireAdmin, async (req, res) => {
    try {
        console.log('🚀 Starting Flodesk subscriber import...');
        const flodeskService = new flodesk_import_1.default();
        const subscribers = await flodeskService.importSubscribers((progress, total) => {
            console.log(`📊 Flodesk import progress: ${progress}/${total}`);
        });
        // Store subscribers in database
        const { db } = await Promise.resolve().then(() => require('../db'));
        const { importedSubscribers } = await Promise.resolve().then(() => require('../../shared/schema'));
        const insertedSubscribers = [];
        for (const subscriber of subscribers) {
            try {
                const [inserted] = await db
                    .insert(importedSubscribers)
                    .values({
                    id: (0, crypto_1.randomUUID)(),
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
            }
            catch (error) {
                // Skip duplicates silently
                if (error.code === '23505') {
                    console.log(`⏭️ Skipping duplicate subscriber: ${subscriber.email}`);
                }
                else {
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
    }
    catch (error) {
        console.error('Flodesk import error:', error);
        res.status(500).json({
            error: 'Failed to import Flodesk subscribers',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Import subscribers from ManyChat (Direct API not supported - Use manual export)
router.post('/manychat/import', admin_middleware_1.requireAdmin, async (req, res) => {
    try {
        console.log('🚀 ManyChat API limitation check...');
        if (!process.env.MANYCHAT_API_KEY) {
            return res.status(400).json({
                error: 'ManyChat API key not configured',
                details: 'Please add MANYCHAT_API_KEY to environment variables'
            });
        }
        // Test API connection to confirm key works
        const testResponse = await fetch('https://api.manychat.com/fb/page/getInfo', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.MANYCHAT_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });
        if (!testResponse.ok) {
            return res.status(400).json({
                error: 'ManyChat API authentication failed',
                details: `API returned ${testResponse.status}: ${testResponse.statusText}`
            });
        }
        const pageData = await testResponse.json();
        console.log('✅ ManyChat API connected to page:', pageData.data?.name);
        // ManyChat API limitation: No bulk subscriber endpoint exists
        res.json({
            success: false,
            message: 'ManyChat API Limitation: Bulk subscriber import not supported',
            details: 'ManyChat intentionally does not provide a bulk subscriber list endpoint. Please use manual export method.',
            apiConnected: true,
            pageName: pageData.data?.name,
            recommendation: 'Use manual export: Bulk Actions → Export Custom to System Field → Facebook PSID'
        });
    }
    catch (error) {
        console.error('ManyChat API test error:', error);
        res.status(500).json({
            error: 'Failed to test ManyChat API connection',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Import from both platforms
router.post('/import-all', admin_middleware_1.requireAdmin, async (req, res) => {
    try {
        console.log('🚀 Starting complete subscriber import from all platforms...');
        const results = {
            flodesk: { success: false, count: 0, error: null },
            manychat: { success: false, count: 0, error: null }
        };
        // Import from Flodesk
        try {
            const flodeskService = new flodesk_import_1.default();
            const flodeskSubscribers = await flodeskService.importSubscribers();
            const { db } = await Promise.resolve().then(() => require('../db'));
            const { importedSubscribers } = await Promise.resolve().then(() => require('../../shared/schema'));
            for (const subscriber of flodeskSubscribers) {
                try {
                    await db
                        .insert(importedSubscribers)
                        .values(subscriber)
                        .onConflictDoNothing();
                    results.flodesk.count++;
                }
                catch (error) {
                    console.error('Error inserting Flodesk subscriber:', error);
                }
            }
            results.flodesk.success = true;
        }
        catch (error) {
            results.flodesk.error = error instanceof Error ? error.message : 'Unknown error';
            console.error('Flodesk import failed:', error);
        }
        // Import from ManyChat
        try {
            const manychatService = new manychat_import_1.ManyChatImportService();
            const manychatSubscribers = await manychatService.importSubscribers();
            const { db } = await Promise.resolve().then(() => require('../db'));
            const { importedSubscribers } = await Promise.resolve().then(() => require('../../shared/schema'));
            for (const subscriber of manychatSubscribers) {
                try {
                    await db
                        .insert(importedSubscribers)
                        .values(subscriber)
                        .onConflictDoNothing();
                    results.manychat.count++;
                }
                catch (error) {
                    console.error('Error inserting ManyChat subscriber:', error);
                }
            }
            results.manychat.success = true;
        }
        catch (error) {
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
    }
    catch (error) {
        console.error('Complete import error:', error);
        res.status(500).json({
            error: 'Failed to complete subscriber import',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get import status and statistics
router.get('/status', admin_middleware_1.requireAdmin, async (req, res) => {
    try {
        const { db } = await Promise.resolve().then(() => require('../db'));
        const { importedSubscribers } = await Promise.resolve().then(() => require('../../shared/schema'));
        const { sql } = await Promise.resolve().then(() => require('drizzle-orm'));
        const stats = await db
            .select({
            source: importedSubscribers.source,
            total: sql `count(*)`,
            active: sql `sum(case when status = 'active' then 1 else 0 end)`,
            withEmail: sql `sum(case when email is not null then 1 else 0 end)`
        })
            .from(importedSubscribers)
            .groupBy(importedSubscribers.source);
        res.json({
            success: true,
            stats,
            lastImport: await db
                .select({ importedAt: importedSubscribers.importedAt })
                .from(importedSubscribers)
                .orderBy(sql `imported_at desc`)
                .limit(1)
        });
    }
    catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            error: 'Failed to get import status',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
