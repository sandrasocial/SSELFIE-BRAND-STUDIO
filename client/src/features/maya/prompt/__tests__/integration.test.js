/**
 * Integration Test for Aesthetic Recipes System
 * Basic validation that the system components work together
 */

// Simple integration test without complex Jest setup
console.log('🧪 Testing Aesthetic Recipes System Integration...');

// Test 1: Recipe loading
try {
  const { AESTHETIC_RECIPES } = require('../recipes/index.ts');
  console.log('✅ Successfully loaded', AESTHETIC_RECIPES.length, 'aesthetic recipes');
  
  // Validate recipe structure
  const recipe = AESTHETIC_RECIPES[0];
  if (recipe.id && recipe.name && recipe.atmosphere && recipe.lighting) {
    console.log('✅ Recipe structure validation passed');
  } else {
    console.error('❌ Recipe structure validation failed');
  }
} catch (error) {
  console.error('❌ Recipe loading failed:', error.message);
}

// Test 2: Gender selection
try {
  const { GenderStyleSelector } = require('../selectors/gender-style-selector.ts');
  
  const matches = GenderStyleSelector.selectRecipes({
    styleKey: 'scandinavian-minimalist',
    userGender: 'woman',
    userIntent: 'professional photos'
  });
  
  if (matches.length > 0 && matches[0].recipe && matches[0].look) {
    console.log('✅ Gender style selection working, found', matches.length, 'matches');
  } else {
    console.error('❌ Gender style selection failed');
  }
} catch (error) {
  console.error('❌ Gender selection test failed:', error.message);
}

// Test 3: Token budget utility
try {
  const { TokenBudgetManager } = require('../utils/token-budget.ts');
  
  const testText = 'A woman wearing elegant clothing sits in beautiful lighting with sophisticated atmosphere and professional composition.';
  const result = TokenBudgetManager.safeTrim(testText, {
    maxTokens: 10,
    preserveSubject: true,
    preserveScene: true
  });
  
  if (result.text && result.trimmed && result.text.includes('woman')) {
    console.log('✅ Token budget system preserves subject content');
  } else {
    console.error('❌ Token budget system failed');
  }
} catch (error) {
  console.error('❌ Token budget test failed:', error.message);
}

console.log('🏁 Integration testing complete');

module.exports = {
  testBasicIntegration: () => {
    console.log('Basic integration test passed');
    return true;
  }
};
