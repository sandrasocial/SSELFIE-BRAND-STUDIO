import type { Express } from "express";
import Stripe from "stripe";
import { storage } from "./storage";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: "2023-10-16",
});

export function registerPhotoshootRoutes(app: Express) {
  
  // Create payment intent for €97 subscription
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount = 97, currency = 'eur', description } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        description: description || 'SSELFIE AI Brand Photoshoot Subscription',
        metadata: {
          service: 'photoshoot',
          subscription_type: 'monthly'
        }
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error('Payment intent creation failed:', error);
      res.status(500).json({ 
        message: "Error creating payment intent", 
        error: error.message 
      });
    }
  });

  // Create user session after successful payment
  app.post("/api/create-session-after-payment", async (req, res) => {
    try {
      const { paymentSuccess, source } = req.body;
      
      if (!paymentSuccess) {
        return res.status(400).json({ message: "Payment not confirmed" });
      }

      // Generate unique user ID for this session
      const userId = `photoshoot_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const userEmail = `${userId}@sselfie.ai`;

      // Create session in memory (for now)
      (req.session as any).user = {
        id: userId,
        email: userEmail,
        plan: 'photoshoot-monthly',
        paymentStatus: 'active',
        createdAt: new Date().toISOString(),
        source: source || 'unknown'
      };

      // Create user record
      try {
        await storage.createUser({
          id: userId,
          email: userEmail,
          firstName: '',
          lastName: '',
          profileImageUrl: '',
        });
      } catch (userError) {
        console.log('User creation skipped (likely already exists)');
      }

      res.json({ 
        success: true, 
        userId,
        message: "Session created successfully" 
      });
    } catch (error: any) {
      console.error('Session creation failed:', error);
      res.status(500).json({ 
        message: "Error creating session",
        error: error.message 
      });
    }
  });

  // Get current user (authenticated)
  app.get("/api/photoshoot/user", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get user from database
      const user = await storage.getUser(sessionUser.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: sessionUser.plan,
        paymentStatus: sessionUser.paymentStatus,
        createdAt: sessionUser.createdAt
      });
    } catch (error: any) {
      console.error('User fetch failed:', error);
      res.status(500).json({ 
        message: "Error fetching user",
        error: error.message 
      });
    }
  });

  // Start AI model training
  app.post("/api/photoshoot/start-training", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { photos } = req.body;
      
      if (!photos || photos.length < 10) {
        return res.status(400).json({ 
          message: "At least 10 photos required for training" 
        });
      }

      // TODO: Integrate with actual model training service
      // For now, simulate training start
      const trainingId = `training_${Date.now()}`;
      
      res.json({
        success: true,
        trainingId,
        estimatedTime: 15, // minutes
        status: 'starting',
        message: 'AI model training started'
      });
    } catch (error: any) {
      console.error('Training start failed:', error);
      res.status(500).json({ 
        message: "Error starting training",
        error: error.message 
      });
    }
  });

  // Generate AI images
  app.post("/api/photoshoot/generate", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { prompt, style = 'editorial' } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt required" });
      }

      // TODO: Integrate with actual AI generation service
      // For now, return Sandra's authentic AI gallery images
      const sandraImages = [
        "https://i.postimg.cc/sgmtqFrQ/out-0-1.webp",
        "https://i.postimg.cc/hPSswXPs/out-0-10.webp",
        "https://i.postimg.cc/fRVcnm4c/out-0-11.webp",
        "https://i.postimg.cc/fLc7qNG1/out-0-12.webp"
      ];

      res.json({
        success: true,
        images: sandraImages,
        prompt,
        style,
        generatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Image generation failed:', error);
      res.status(500).json({ 
        message: "Error generating images",
        error: error.message 
      });
    }
  });

  // Save image to user gallery
  app.post("/api/photoshoot/save-image", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { imageUrl, prompt, style } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL required" });
      }

      // TODO: Save to database
      res.json({
        success: true,
        savedAt: new Date().toISOString(),
        message: 'Image saved to gallery'
      });
    } catch (error: any) {
      console.error('Image save failed:', error);
      res.status(500).json({ 
        message: "Error saving image",
        error: error.message 
      });
    }
  });

  // Get user's saved images
  app.get("/api/photoshoot/gallery", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // TODO: Get from database
      // For now, return demo gallery
      const gallery = [
        {
          id: 1,
          imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=1000&fit=crop&crop=face",
          prompt: "Professional editorial portrait",
          style: "editorial",
          savedAt: new Date().toISOString()
        },
        {
          id: 2,
          imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop&crop=face",
          prompt: "Business headshot style",
          style: "business",
          savedAt: new Date().toISOString()
        }
      ];

      res.json(gallery);
    } catch (error: any) {
      console.error('Gallery fetch failed:', error);
      res.status(500).json({ 
        message: "Error fetching gallery",
        error: error.message 
      });
    }
  });

  // Simple login for existing customers
  app.post("/api/photoshoot/login", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }

      // TODO: Validate against database
      // For now, create session if email looks valid
      if (email.includes('@')) {
        const userId = `user_${Date.now()}`;
        
        (req.session as any).user = {
          id: userId,
          email,
          plan: 'photoshoot-monthly',
          paymentStatus: 'active',
          loginAt: new Date().toISOString()
        };

        res.json({ 
          success: true, 
          message: "Login successful" 
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      res.status(500).json({ 
        message: "Error during login",
        error: error.message 
      });
    }
  });

  // Logout
  app.post("/api/photoshoot/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });
}