// Direct Shannon Murray Account Creation Script
import { storage } from './server/storage.js';

async function createShannonAccount() {
  try {
    console.log('🎯 Creating Shannon Murray\'s complete SSELFIE Studio account...');
    
    // Generate unique user ID
    const shannonUserId = `shannon-${Date.now()}`;
    
    // 1. Create Shannon's user account with Full Access plan
    const newUser = await storage.upsertUser({
      id: shannonUserId,
      email: "shannon@soulresets.com",
      firstName: "Shannon",
      lastName: "Murray",
      plan: "full-access", // €67 Full Access plan
      monthlyGenerationLimit: 100,
      mayaAiAccess: true,
      victoriaAiAccess: true,
      role: "user"
    });
    
    console.log('✅ User account created:', newUser);
    
    // 2. Create Shannon's detailed profile
    const userProfile = await storage.upsertUserProfile({
      userId: shannonUserId,
      fullName: "Shannon Murray",
      phone: "+34682307718",
      location: "Marbella, Spain", 
      instagramHandle: "@shannonmurray87",
      bio: "Sound healer helping overwhelmed women find their way back to calm. Former anxious hairdresser turned healer - I know the journey from racing minds to peaceful hearts.",
      brandVibe: "Sound healing business focused on helping overwhelmed women find calm through healing sessions",
      goals: "Grow Soul Resets business through online presence and client bookings"
    });
    
    console.log('✅ User profile created:', userProfile);
    
    // 3. Create onboarding data with business information
    const onboardingData = await storage.saveOnboardingData({
      userId: shannonUserId,
      brandStory: "Sound healing sessions for overwhelmed women seeking sacred pauses for the soul. Former anxious hairdresser turned sound healer, helping women go from racing minds to peaceful hearts.",
      personalMission: "Help overwhelmed women find their way back to calm through sound healing",
      businessGoals: "Grow Soul Resets business through online presence and client bookings",
      targetAudience: "Women who give to everyone else but struggle to give to themselves - overwhelmed, anxious, running on empty",
      completed: true
    });
    
    console.log('✅ Onboarding data created:', onboardingData);
    
    // 4. Create Shannon's business data for her services
    console.log('📝 Shannon\'s Business Details:');
    console.log('Business Name: Soul Resets');
    console.log('Services:');
    console.log('- Private 1-to-1 Sound Healing: €150 (75-90 min)');
    console.log('- Group Sound Bath Sessions: €25 per person (45-60 min)');
    console.log('- Private Group Cacao Ceremonies: €65 per person (90 min)');
    console.log('- Package Deal: 4 sessions for €555 (save €45)');
    console.log('Brand Colors: Coastal blues (#6D96A6, #BFD1E0) and warm neutrals (#FDF6ED, #F0E4D6, #CCBAA5)');
    
    return {
      success: true,
      message: 'Shannon Murray\'s complete SSELFIE Studio account created successfully',
      user: newUser,
      profile: userProfile,
      onboarding: onboardingData,
      userId: shannonUserId
    };
    
  } catch (error) {
    console.error('❌ Error creating Shannon\'s account:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the account creation
createShannonAccount().then(result => {
  console.log('\n🎉 SHANNON ACCOUNT CREATION RESULT:');
  console.log(JSON.stringify(result, null, 2));
}).catch(error => {
  console.error('🚨 CREATION FAILED:', error);
});