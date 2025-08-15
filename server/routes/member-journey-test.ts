import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';

const router = Router();

// Test complete member journey for real users
router.get('/test-member-journey', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        canTrain: false,
        canGenerate: false,
        canSaveToGallery: false
      });
    }

    // Test 1: Can user train AI model?
    const trainingTest = {
      hasSubscription: user.plan !== 'free',
      hasTrainingAccess: user.plan === 'full-access' || user.plan === 'sselfie-studio' || user.role === 'admin',
      currentTrainingStatus: 'unknown', // Will check user model status
      canStartTraining: false
    };

    // Check current user model status
    try {
      const userModel = await storage.getUserModel(userId);
      trainingTest.currentTrainingStatus = userModel?.trainingStatus || 'not_started';
      trainingTest.canStartTraining = trainingTest.hasTrainingAccess && 
        (trainingTest.currentTrainingStatus === 'not_started' || 
         trainingTest.currentTrainingStatus === 'failed');
    } catch (error) {
      trainingTest.currentTrainingStatus = 'not_started';
      trainingTest.canStartTraining = trainingTest.hasTrainingAccess;
    }

    // Test 2: Can user generate images?
    const generationTest = {
      hasModelTrained: trainingTest.currentTrainingStatus === 'completed',
      hasGenerationLimit: user.monthlyGenerationLimit !== 0,
      remainingGenerations: Math.max(0, (user.monthlyGenerationLimit || 0) - (user.generationsUsedThisMonth || 0)),
      canGenerate: false
    };
    
    generationTest.canGenerate = generationTest.hasModelTrained && 
      (generationTest.hasGenerationLimit || user.role === 'admin');

    // Test 3: Can user save to gallery?
    const galleryTest = {
      hasGalleryAccess: user.plan !== 'free',
      canSaveImages: false
    };
    
    galleryTest.canSaveImages = galleryTest.hasGalleryAccess;

    // Test 4: Check existing user data
    const userData = {
      id: user.id,
      email: user.email,
      plan: user.plan,
      role: user.role,
      monthlyLimit: user.monthlyGenerationLimit,
      monthlyUsed: user.generationsUsedThisMonth,
      mayaAccess: user.mayaAiAccess,
      victoriaAccess: user.victoriaAiAccess
    };

    // Overall assessment
    const canCompleteJourney = trainingTest.canStartTraining && 
                              generationTest.canGenerate && 
                              galleryTest.canSaveImages;

    const result = {
      timestamp: new Date().toISOString(),
      userId,
      userType: user.role || 'user',
      planType: user.plan || 'free',
      
      // Core journey capabilities
      canTrain: trainingTest.canStartTraining,
      canGenerate: generationTest.canGenerate,
      canSaveToGallery: galleryTest.canSaveImages,
      canCompleteFullJourney: canCompleteJourney,
      
      // Detailed test results
      trainingTest,
      generationTest,
      galleryTest,
      userData,
      
      // Recommendations
      blockers: [] as string[],
      recommendations: [] as string[]
    };

    // Identify blockers
    if (!trainingTest.canStartTraining) {
      result.blockers.push('Cannot start AI training');
      if (!trainingTest.hasSubscription) {
        result.recommendations.push('User needs subscription to train AI model');
      }
    }
    
    if (!generationTest.canGenerate) {
      result.blockers.push('Cannot generate images');
      if (!generationTest.hasModelTrained) {
        result.recommendations.push('User needs to complete AI training first');
      }
      if (!generationTest.hasGenerationLimit) {
        result.recommendations.push('User has no generation limit (check plan)');
      }
    }
    
    if (!galleryTest.canSaveImages) {
      result.blockers.push('Cannot save images to gallery');
      result.recommendations.push('User needs paid plan for gallery access');
    }

    res.json(result);
  } catch (error) {
    console.error('Member journey test error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      canTrain: false,
      canGenerate: false,
      canSaveToGallery: false,
      canCompleteFullJourney: false
    });
  }
});

// Test new user signup simulation
router.post('/simulate-new-user', async (req, res) => {
  try {
    const { email, plan = 'free' } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required for simulation' });
    }

    // Simulate what a new user would experience
    const simulatedUser = {
      id: `sim_${Date.now()}`,
      email,
      plan,
      role: 'user',
      monthlyGenerationLimit: plan === 'full-access' ? 100 : (plan === 'basic' ? 30 : 5),
      generationsUsedThisMonth: 0,
      mayaAiAccess: true,
      victoriaAiAccess: plan === 'full-access'
    };

    const simulation = {
      timestamp: new Date().toISOString(),
      simulatedUser,
      
      // What this user can do immediately
      canAccessMaya: simulatedUser.mayaAiAccess,
      canAccessVictoria: simulatedUser.victoriaAiAccess,
      canStartTraining: simulatedUser.plan !== 'free',
      expectedTrainingTime: '20 minutes',
      
      // After training completion
      canGenerateImages: true,
      monthlyImageLimit: simulatedUser.monthlyGenerationLimit,
      canSaveToGallery: simulatedUser.plan !== 'free',
      
      // User journey flow
      journeySteps: {
        step1: 'Signup/Login - Available',
        step2: simulatedUser.plan !== 'free' ? 'Training - Available' : 'Training - Requires Upgrade',
        step3: 'Maya AI Photoshoot - Available after training',
        step4: 'Victoria Builder - ' + (simulatedUser.victoriaAiAccess ? 'Available' : 'Coming Soon'),
        step5: 'Workspace/Gallery - ' + (simulatedUser.plan !== 'free' ? 'Available' : 'Requires Upgrade')
      },
      
      recommendation: simulatedUser.plan === 'free' ? 
        'User should upgrade to full-access for complete experience' :
        'User has full access to all features'
    };

    res.json(simulation);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Simulation failed'
    });
  }
});

export default router;