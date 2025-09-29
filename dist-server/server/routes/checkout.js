import { requireStackAuth } from '../stack-auth.js';
import { storage } from "../storage.js";
import Stripe from "stripe";
export function registerCheckoutRoutes(app) {
    if (!process.env['STRIPE_SECRET_KEY']) {
        throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
    }
    const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'], {
        apiVersion: "2025-08-27.basil",
    });
    app.post("/api/create-retrain-checkout-session", requireStackAuth, async (req, res) => {
        try {
            const { successUrl, cancelUrl } = req.body;
            const userId = req.user.id;
            if (!userId) {
                return res.status(401).json({ message: 'User authentication required for retraining' });
            }
            const user = await storage.getUser(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const retrainingConfig = {
                name: 'AI Model Retraining',
                description: 'One-time retraining session for your personal AI model',
                amount: 1000,
            };
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: retrainingConfig.name,
                                description: retrainingConfig.description,
                            },
                            unit_amount: retrainingConfig.amount,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    plan: 'retraining-session',
                    userId: userId,
                    type: 'retrain'
                },
                customer_email: user.email || undefined,
            });
            console.log(`🔄 RETRAINING SESSION: Created checkout for user ${userId} - ${session.id}`);
            res.json({ url: session.url });
        }
        catch (error) {
            console.error('Retraining checkout session creation error:', error);
            res.status(500).json({ message: "Error creating retraining checkout session: " + error.message });
        }
    });
    app.post("/api/create-checkout-session", async (req, res) => {
        try {
            const { successUrl, cancelUrl, plan = 'sselfie-studio' } = req.body;
            const planConfig = {
                'sselfie-studio': {
                    name: 'SSELFIE STUDIO',
                    description: 'Personal AI model + 100 monthly photos + Maya AI photographer',
                    amount: 4700,
                }
            };
            const selectedPlan = planConfig['sselfie-studio'];
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: selectedPlan.name,
                                description: selectedPlan.description,
                            },
                            unit_amount: selectedPlan.amount,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    plan: plan,
                    flow: successUrl.includes('/checkout?status=success') ? 'modal' : 'page'
                }
            });
            res.json({ url: session.url });
        }
        catch (error) {
            console.error('Checkout session creation error:', error);
            res.status(500).json({ message: "Error creating checkout session: " + error.message });
        }
    });
    app.get("/api/subscription", requireStackAuth, async (req, res) => {
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(401).json({ message: 'User authentication required' });
            }
            const user = await storage.getUser(userId);
            if (!user || !user.stripeCustomerId) {
                return res.status(404).json({ message: 'No subscription found' });
            }
            const subscriptions = await stripe.subscriptions.list({
                customer: user.stripeCustomerId,
                status: 'all',
                limit: 1,
            });
            if (subscriptions.data.length === 0) {
                return res.status(404).json({ message: 'No subscription found' });
            }
            res.json(subscriptions.data[0]);
        }
        catch (error) {
            console.error('Error fetching subscription:', error);
            res.status(500).json({ message: "Error fetching subscription: " + error.message });
        }
    });
    app.get("/api/invoices", requireStackAuth, async (req, res) => {
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(401).json({ message: 'User authentication required' });
            }
            const user = await storage.getUser(userId);
            if (!user || !user.stripeCustomerId) {
                return res.status(404).json({ message: 'No customer found' });
            }
            const invoices = await stripe.invoices.list({
                customer: user.stripeCustomerId,
                limit: 10,
            });
            res.json(invoices.data);
        }
        catch (error) {
            console.error('Error fetching invoices:', error);
            res.status(500).json({ message: "Error fetching invoices: " + error.message });
        }
    });
    app.post("/api/subscription/cancel", requireStackAuth, async (req, res) => {
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(401).json({ message: 'User authentication required' });
            }
            const user = await storage.getUser(userId);
            if (!user || !user.stripeSubscriptionId) {
                return res.status(404).json({ message: 'No subscription found' });
            }
            const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
                cancel_at_period_end: true,
            });
            res.json(subscription);
        }
        catch (error) {
            console.error('Error canceling subscription:', error);
            res.status(500).json({ message: "Error canceling subscription: " + error.message });
        }
    });
    app.post("/api/subscription/reactivate", requireStackAuth, async (req, res) => {
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(401).json({ message: 'User authentication required' });
            }
            const user = await storage.getUser(userId);
            if (!user || !user.stripeSubscriptionId) {
                return res.status(404).json({ message: 'No subscription found' });
            }
            const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
                cancel_at_period_end: false,
            });
            res.json(subscription);
        }
        catch (error) {
            console.error('Error reactivating subscription:', error);
            res.status(500).json({ message: "Error reactivating subscription: " + error.message });
        }
    });
    app.post("/api/create-payment-intent", async (req, res) => {
        try {
            const { amount, plan, currency = 'eur' } = req.body;
            if (!amount || !plan) {
                return res.status(400).json({ message: 'Amount and plan are required' });
            }
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency,
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    plan,
                },
                description: `SSELFIE ${plan} subscription`,
            });
            res.json({ clientSecret: paymentIntent.client_secret });
        }
        catch (error) {
            console.error('Payment intent creation error:', error);
            res.status(500).json({ message: "Error creating payment intent: " + error.message });
        }
    });
    app.post('/api/webhook/stripe', async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
            return res.status(500).send('Webhook configuration error');
        }
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const plan = paymentIntent.metadata.plan;
            try {
                console.log(`Payment succeeded for plan ${plan}, payment intent: ${paymentIntent.id}`);
            }
            catch (error) {
                console.error('Post-payment processing error:', error);
            }
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { plan, userId, type, flow } = session.metadata || {};
            console.log(`💰 PAYMENT SUCCESS: Flow=${flow || 'legacy'}, Plan=${plan}, Session=${session.id}`);
            if (plan === 'retraining-session' && type === 'retrain' && userId) {
                try {
                    console.log(`🔄 RETRAINING PAYMENT: Successful payment for user ${userId} - session ${session.id}`);
                    await grantRetrainingAccess(userId, session.id);
                    console.log(`✅ RETRAINING ACCESS: Granted to user ${userId}`);
                }
                catch (error) {
                    console.error('Retraining payment processing error:', error);
                }
            }
            else if (plan === 'sselfie-studio' || !plan) {
                try {
                    console.log(`💰 SUBSCRIPTION PAYMENT: Flow=${flow || 'legacy'}, Session=${session.id}`);
                    await handleSubscriptionPayment(session, flow);
                    console.log(`✅ SUBSCRIPTION ACCESS: Granted for session ${session.id}`);
                }
                catch (error) {
                    console.error('Subscription payment processing error:', error);
                }
            }
        }
        res.json({ received: true });
    });
}
async function grantRetrainingAccess(userId, sessionId) {
    try {
        await storage.updateUserRetrainingAccess(userId, {
            hasRetrainingAccess: true,
            retrainingSessionId: sessionId,
            retrainingPaidAt: new Date(),
        });
        console.log(`🔄 RETRAINING ACCESS: User ${userId} can now access training with session ${sessionId}`);
    }
    catch (error) {
        console.error('Error granting retraining access:', error);
        throw error;
    }
}
async function handleSubscriptionPayment(session, flow) {
    try {
        const customerEmail = session.customer_email || session.customer_details?.email;
        if (!customerEmail) {
            console.log('No customer email found in session, skipping user creation');
            return;
        }
        console.log(`📧 Processing subscription for email: ${customerEmail} (flow: ${flow || 'legacy'})`);
        let user = await storage.getUserByEmail(customerEmail);
        if (user) {
            console.log(`👤 Updating existing user: ${user.id} (flow: ${flow || 'legacy'})`);
            await storage.updateUserProfile(user.id, {
                plan: 'sselfie-studio',
                monthlyGenerationLimit: 100,
                generationsUsedThisMonth: 0,
                stripeCustomerId: session.customer,
                mayaAiAccess: true,
                updatedAt: new Date(),
            });
            console.log(`✅ User ${user.id} upgraded to SSELFIE STUDIO plan`);
        }
        else {
            console.log(`👤 Creating new user for email: ${customerEmail} (flow: ${flow || 'legacy'})`);
            const newUserId = generateUserId();
            await storage.createUser({
                id: newUserId,
                email: customerEmail,
                plan: 'sselfie-studio',
                monthlyGenerationLimit: 100,
                generationsUsedThisMonth: 0,
                stripeCustomerId: session.customer,
                mayaAiAccess: true,
                victoriaAiAccess: false,
                role: 'user',
                preferredOnboardingMode: 'conversational',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log(`✅ New user ${newUserId} created with SSELFIE STUDIO plan`);
        }
        if (flow === 'modal') {
            console.log('🎯 MODAL FLOW: Payment processed for enhanced modal system');
        }
        else {
            console.log('📄 LEGACY FLOW: Payment processed for legacy page system');
        }
    }
    catch (error) {
        console.error('Error handling subscription payment:', error);
        throw error;
    }
}
function generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
async function triggerPostPurchaseAutomation(userId, plan) {
    try {
        const user = await storage.getUser(userId);
        if (!user)
            return;
        const existingOnboarding = await storage.getOnboardingData(userId);
        if (!existingOnboarding) {
            await storage.saveOnboardingData({
                userId,
                currentStep: plan === 'basic' ? 1 : 2,
                brandVoice: '',
                targetAudience: '',
                businessGoals: '',
            });
        }
        console.log(`Post-purchase automation completed for user ${userId}, plan ${plan}`);
    }
    catch (error) {
        console.error('Automation error:', error);
    }
}
//# sourceMappingURL=checkout.js.map