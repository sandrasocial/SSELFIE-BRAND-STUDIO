const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');

// Create rate limiter
const waitlistLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5 // limit each IP to 5 requests per hour
});

// Initialize database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Valid plan types matching Sandra's pricing strategy
const VALID_PLAN_TYPES = ['creator', 'entrepreneur'];

/**
 * @api {post} /api/waitlist/join Join Waitlist
 * @apiName JoinWaitlist
 * @apiGroup Waitlist
 * @apiDescription Join the SSELFIE Studio waitlist for early access
 *
 * @apiParam {String} email User's email address
 * @apiParam {String} plan_type Desired plan type (creator/entrepreneur)
 */
router.post('/join', waitlistLimiter, async (req, res) => {
    try {
        const { email, plan_type } = req.body;
        
        // Enhanced input validation
        if (!email || !plan_type) {
            return res.status(400).json({ 
                error: 'Both email and plan type are required to join the waitlist'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Please provide a valid email address'
            });
        }

        // Validate plan type
        const normalizedPlanType = plan_type.toLowerCase();
        if (!VALID_PLAN_TYPES.includes(normalizedPlanType)) {
            return res.status(400).json({
                error: 'Please select either the creator (€27/month) or entrepreneur (€67/month) plan'
            });
        }

        // Check for existing email
        const checkQuery = 'SELECT id FROM waitlist WHERE email = $1';
        const checkResult = await pool.query(checkQuery, [email]);
        
        if (checkResult.rows.length > 0) {
            return res.status(409).json({
                error: 'This email is already on our waitlist',
                waitlistId: checkResult.rows[0].id
            });
        }
        
        // Add to waitlist
        const query = 'INSERT INTO waitlist (email, plan_type) VALUES ($1, $2) RETURNING id, created_at';
        const values = [email, normalizedPlanType];
        
        const result = await pool.query(query, values);
        
        // TODO: Integrate with email service for confirmation
        // Will be handled in separate task
        
        res.status(200).json({
            success: true,
            message: 'Welcome to the SSELFIE Studio waitlist! We\'ll notify you when early access becomes available.',
            data: {
                waitlistId: result.rows[0].id,
                joinedAt: result.rows[0].created_at,
                plan: normalizedPlanType
            }
        });
    } catch (error) {
        console.error('Waitlist error:', error);
        
        // Handle specific database errors
        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({ 
                error: 'This email is already on our waitlist'
            });
        }
        
        res.status(500).json({ 
            error: 'We encountered an issue adding you to the waitlist. Please try again shortly.'
        });
    }
});

module.exports = router;