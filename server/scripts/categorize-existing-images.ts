import { db } from '../drizzle';

// Helper function to detect category from prompt - same logic as in Maya unified routes
function detectCategoryFromPrompt(prompt: string): string {
  if (!prompt) return 'Lifestyle';
  
  const categories = ['business', 'fashion', 'lifestyle', 'travel'];
  const lowerPrompt = prompt.toLowerCase();
  
  for (const category of categories) {
    if (lowerPrompt.includes(category)) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }
  
  // Check for business-related keywords
  if (lowerPrompt.includes('professional') || lowerPrompt.includes('corporate') || 
      lowerPrompt.includes('office') || lowerPrompt.includes('suit') ||
      lowerPrompt.includes('executive') || lowerPrompt.includes('business')) {
    return 'Business';
  }
  
  // Check for lifestyle keywords
  if (lowerPrompt.includes('casual') || lowerPrompt.includes('home') || 
      lowerPrompt.includes('morning') || lowerPrompt.includes('wellness') ||
      lowerPrompt.includes('luxury routine') || lowerPrompt.includes('relaxed')) {
    return 'Lifestyle';
  }
  
  // Check for fashion keywords
  if (lowerPrompt.includes('dress') || lowerPrompt.includes('style') || 
      lowerPrompt.includes('fashion') || lowerPrompt.includes('elegant') ||
      lowerPrompt.includes('outfit') || lowerPrompt.includes('chic')) {
    return 'Fashion';
  }
  
  // Check for travel keywords
  if (lowerPrompt.includes('travel') || lowerPrompt.includes('city') || 
      lowerPrompt.includes('urban') || lowerPrompt.includes('street') ||
      lowerPrompt.includes('destination') || lowerPrompt.includes('location')) {
    return 'Travel';
  }
  
  return 'Lifestyle'; // Default category
}

async function categorizeExistingImages() {
  try {
    console.log('🔄 Starting categorization of existing AI images...');
    
    // Get all images without categories
    const result = await db.execute(`
      SELECT id, prompt, style 
      FROM ai_images 
      WHERE category IS NULL OR category = ''
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Found ${result.rows.length} images to categorize`);
    
    let businessCount = 0;
    let fashionCount = 0;
    let lifestyleCount = 0;
    let travelCount = 0;
    
    // Process each image
    for (const row of result.rows) {
      const category = detectCategoryFromPrompt(row.prompt || '');
      
      // Update the image with detected category
      await db.execute(`
        UPDATE ai_images 
        SET category = $1 
        WHERE id = $2
      `, [category, row.id]);
      
      // Count categories
      switch (category) {
        case 'Business': businessCount++; break;
        case 'Fashion': fashionCount++; break;
        case 'Lifestyle': lifestyleCount++; break;
        case 'Travel': travelCount++; break;
      }
      
      console.log(`✅ Image ${row.id}: "${row.prompt?.substring(0, 50)}..." → ${category}`);
    }
    
    console.log('\n📈 Categorization Results:');
    console.log(`• Business: ${businessCount} images`);
    console.log(`• Fashion: ${fashionCount} images`);
    console.log(`• Lifestyle: ${lifestyleCount} images`);
    console.log(`• Travel: ${travelCount} images`);
    console.log(`• Total: ${result.rows.length} images categorized`);
    
    // Verify the results
    const verification = await db.execute(`
      SELECT category, COUNT(*) as count 
      FROM ai_images 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    console.log('\n🔍 Verification - Categories in database:');
    verification.rows.forEach(row => {
      console.log(`• ${row.category}: ${row.count} images`);
    });
    
    console.log('\n✅ Image categorization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error categorizing images:', error);
    throw error;
  }
}

// Run the categorization immediately in ES module environment
categorizeExistingImages()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

export { categorizeExistingImages };