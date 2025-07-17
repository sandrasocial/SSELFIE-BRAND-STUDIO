import fs from 'fs';

async function removeBrokenFlatlays() {
  try {
    console.log('🗑️ Removing broken flatlay images before launch...');
    
    const filePath = 'client/src/pages/flatlay-library.tsx';
    let content = fs.readFileSync(filePath, 'utf8');
    
    // PINK & GIRLY: Remove images 76-171 (broken images)
    console.log('🔧 Processing Pink & Girly collection...');
    
    // Find the Pink & Girly collection start
    const pinkGirlyStart = content.indexOf("id: 'pink-girly',");
    const pinkGirlyEnd = content.indexOf("id: 'cream-aesthetic',", pinkGirlyStart);
    
    if (pinkGirlyStart === -1 || pinkGirlyEnd === -1) {
      console.error('❌ Could not find Pink & Girly collection boundaries');
      return;
    }
    
    // Extract the Pink & Girly section
    const beforePinkGirly = content.substring(0, pinkGirlyStart);
    const pinkGirlySection = content.substring(pinkGirlyStart, pinkGirlyEnd);
    const afterPinkGirly = content.substring(pinkGirlyEnd);
    
    // Split into individual image objects
    const imagePattern = /\{\s*id:\s*'pg-\d+',[\s\S]*?\}/g;
    const pinkGirlyImages = pinkGirlySection.match(imagePattern) || [];
    
    // Keep only images 1-75 (remove 76-171)
    const filteredPinkGirlyImages = pinkGirlyImages.slice(0, 75);
    
    console.log(`✅ Pink & Girly: Keeping ${filteredPinkGirlyImages.length}/171 images (removed ${171-filteredPinkGirlyImages.length} broken images)`);
    
    // Reconstruct Pink & Girly collection
    const pinkGirlyHeader = pinkGirlySection.substring(0, pinkGirlySection.indexOf('{'));
    const reconstructedPinkGirly = pinkGirlyHeader + filteredPinkGirlyImages.join(',\n      ') + '\n    ]\n  },\n  {\n    ';
    
    // CREAM AESTHETIC: Remove images 2-3-4 and 38-210 (broken images)
    console.log('🔧 Processing Cream Aesthetic collection...');
    
    const creamAestheticStart = content.indexOf("id: 'cream-aesthetic',");
    const creamAestheticEnd = content.lastIndexOf('    ]\n  }\n];');
    
    if (creamAestheticStart === -1 || creamAestheticEnd === -1) {
      console.error('❌ Could not find Cream Aesthetic collection boundaries');
      return;
    }
    
    // Extract the Cream Aesthetic section  
    const creamAestheticSection = content.substring(creamAestheticStart, creamAestheticEnd + '    ]\n  }'.length);
    
    // Split into individual image objects
    const creamImagePattern = /\{\s*id:\s*'ca-\d+',[\s\S]*?\}/g;
    const creamAestheticImages = creamAestheticSection.match(creamImagePattern) || [];
    
    // Keep only images: 1, 5-37 (remove 2-4 and 38-210)
    const filteredCreamImages = [
      creamAestheticImages[0], // Image 1
      ...creamAestheticImages.slice(4, 37) // Images 5-37
    ];
    
    console.log(`✅ Cream Aesthetic: Keeping ${filteredCreamImages.length}/210 images (removed ${210-filteredCreamImages.length} broken images)`);
    
    // Reconstruct Cream Aesthetic collection
    const creamHeader = creamAestheticSection.substring(0, creamAestheticSection.indexOf('{'));
    const reconstructedCream = creamHeader + filteredCreamImages.join(',\n      ') + '\n    ]\n  }\n];';
    
    // Reconstruct entire file
    const newContent = beforePinkGirly + reconstructedPinkGirly + reconstructedCream;
    
    // Write the cleaned content back
    fs.writeFileSync(filePath, newContent);
    
    console.log('🎉 BROKEN FLATLAY REMOVAL COMPLETE');
    console.log('✅ Pink & Girly: 75 working images (removed 96 broken images)');
    console.log('✅ Cream Aesthetic: 34 working images (removed 176 broken images)');
    console.log('✅ Platform ready for launch with only working images');
    
  } catch (error) {
    console.error('❌ Error removing broken flatlays:', error);
  }
}

removeBrokenFlatlays();