#!/usr/bin/env node
// Shannon Murray Complete Account Setup via API
import fetch from 'node-fetch';

async function createShannonCompleteAccount() {
  try {
    console.log('🎯 Creating Shannon Murray\'s complete SSELFIE Studio account...');
    
    const accountData = {
      email: "shannon@soulresets.com",
      firstName: "Shannon", 
      lastName: "Murray",
      businessName: "Soul Resets",
      businessDescription: "Sound healing sessions for overwhelmed women seeking sacred pauses for the soul. Former anxious hairdresser turned sound healer, helping women go from racing minds to peaceful hearts.",
      location: "Marbella, Spain",
      phone: "+34682307718",
      instagramHandle: "@shannonmurray87",
      brandColors: {
        primary: "#6D96A6",    // Coastal blue
        secondary: "#BFD1E0",  // Light blue
        accent: "#FDF6ED",     // Warm cream
        neutral1: "#F0E4D6",   // Light beige
        neutral2: "#CCBAA5"    // Warm taupe
      },
      bio: "Sound healer helping overwhelmed women find their way back to calm. Former anxious hairdresser turned healer - I know the journey from racing minds to peaceful hearts.",
      services: [
        {
          name: "Private 1-to-1 Sound Healing",
          price: "€150",
          duration: "75-90 minutes",
          description: "Completely personalized healing experience with crystal singing bowls, chakra balancing, gentle touch therapy with essential oils"
        },
        {
          name: "Group Sound Bath Sessions", 
          price: "€25 per person",
          duration: "45-60 minutes",
          description: "Sound healing in stunning natural locations with guided meditation and crystal energy"
        },
        {
          name: "Private Group Cacao Ceremonies",
          price: "€65 per person", 
          duration: "90 minutes",
          description: "Sacred cacao ceremony with crystal bowl sound healing journey and heart-opening connection"
        }
      ],
      pricing: {
        individual_session: "€150",
        group_session: "€25 per person", 
        cacao_ceremony: "€65 per person",
        package_deal: "4 sessions for €555 (save €45)"
      }
    };

    // Create account via API
    const response = await fetch('http://localhost:5000/api/white-label/create-client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': 'sandra-admin-2025'
      },
      body: JSON.stringify(accountData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Shannon Murray account created successfully!');
      console.log('📧 Email:', result.user?.email);
      console.log('👤 User ID:', result.user?.id);
      console.log('💎 Plan:', result.user?.plan);
      console.log('🎯 Maya AI Access:', result.user?.mayaAiAccess);
      console.log('🏗️ Victoria AI Access:', result.user?.victoriaAiAccess);
      return result;
    } else {
      console.error('❌ Account creation failed:', result);
      return null;
    }
    
  } catch (error) {
    console.error('🚨 Error creating Shannon\'s account:', error);
    return null;
  }
}

// Execute the setup
createShannonCompleteAccount().then(result => {
  if (result) {
    console.log('\n🎉 SHANNON\'S COMPLETE SSELFIE STUDIO ACCOUNT IS READY!');
    console.log('🔗 She can now login at: https://sselfie.ai');
    console.log('📱 Business: Soul Resets');
    console.log('🎵 Services: Sound healing, group sessions, cacao ceremonies');
    console.log('🌊 Brand: Coastal blues and warm neutrals');
    console.log('🎯 Target: Overwhelmed women seeking calm');
  } else {
    console.log('❌ Setup failed - check logs above');
  }
}).catch(console.error);