// Test BUILD Assistant Voice - Sandra Authenticity Check
// Tests the BUILD website assistant to ensure it speaks exactly like Sandra

async function testBuildAssistantVoice() {
  console.log('🎯 Testing BUILD Assistant Voice for Sandra Authenticity...');
  
  try {
    // Simulate onboarding data
    const mockOnboardingData = {
      personalBrandName: "Confident Beauty Coach",
      businessType: "Coaching & Consulting", 
      targetAudience: "Women entrepreneurs who want to feel confident",
      userStory: "I help women overcome their self-doubt and build confidence through their personal brand"
    };

    // Test message to BUILD assistant
    const response = await fetch('http://localhost:5000/api/victoria-website-chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This would be real auth in practice
      },
      body: JSON.stringify({
        message: "I want my homepage to feel warm and inviting, but also show I'm professional. What do you think?",
        onboardingData: mockOnboardingData,
        conversationHistory: [],
        userId: 'test-user'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ BUILD Assistant Response:');
      console.log(data.response);
      
      // Check for Sandra voice patterns
      const response_text = data.response.toLowerCase();
      const sandraPatterns = [
        'hey beautiful',
        'here\'s the thing',
        'your people',
        'this could be',
        'gorgeous',
        'amazing',
        'excited',
        'gets it'
      ];
      
      const foundPatterns = sandraPatterns.filter(pattern => 
        response_text.includes(pattern)
      );
      
      console.log('\n🔍 Sandra Voice Patterns Found:');
      foundPatterns.forEach(pattern => console.log(`✓ "${pattern}"`));
      
      if (foundPatterns.length >= 2) {
        console.log('\n🎉 SUCCESS: BUILD Assistant is using Sandra\'s authentic voice!');
      } else {
        console.log('\n⚠️  WARNING: Response doesn\'t feel like Sandra\'s voice');
      }
    } else {
      console.log('❌ Error:', response.status, await response.text());
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run the test
testBuildAssistantVoice();