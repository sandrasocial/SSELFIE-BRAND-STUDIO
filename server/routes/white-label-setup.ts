import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";
import { requireAdmin, checkAdminAccess } from "../middleware/admin-middleware";
import type { Request, Response } from "express";

const router = Router();

// White-label client setup endpoint
router.post("/api/white-label/create-client", requireAdmin, async (req: any, res: Response) => {
  try {
    // Admin authorization already handled by middleware

    const {
      email,
      firstName,
      lastName,
      businessName,
      businessDescription,
      services,
      pricing,
      location,
      phone,
      instagramHandle,
      brandColors,
      bio
    } = req.body;

    // Generate unique user ID for Shannon
    const clientUserId = `shannon-${Date.now()}`;

    // Create Shannon's user account with Full Access plan
    const newUser = await storage.upsertUser({
      id: clientUserId,
      email,
      firstName,
      lastName,
      plan: "full-access", // €67 Full Access plan
      monthlyGenerationLimit: 100,
      mayaAiAccess: true,
      victoriaAiAccess: true,
      role: "user"
    });

    // Create her detailed profile
    const userProfile = await storage.upsertUserProfile({
      userId: clientUserId,
      fullName: `${firstName} ${lastName}`,
      phone,
      location,
      instagramHandle,
      bio,
      brandVibe: `Sound healing business focused on helping overwhelmed women find calm through healing sessions`,
      goals: "Grow Soul Resets business through online presence and client bookings"
    });

    // Create onboarding data with business information
    const onboardingData = await storage.saveOnboardingData({
      userId: clientUserId,
      brandStory: businessDescription,
      personalMission: `Help overwhelmed women find their way back to calm through sound healing`,
      businessGoals: "Grow Soul Resets business through online presence and client bookings",
      targetAudience: "Women who give to everyone else but struggle to give to themselves - overwhelmed, anxious, running on empty",
      completed: true,
      // No preferences field in schema - stored separately
    });

    console.log(`✅ Created white-label client account for ${email}`);

    res.json({
      success: true,
      message: `Successfully created ${businessName} account`,
      user: newUser,
      profile: userProfile,
      onboarding: onboardingData
    });

  } catch (error) {
    console.error("❌ White-label client creation error:", error);
    res.status(500).json({ 
      error: "Failed to create client account",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export { router as whitelabelRoutes };