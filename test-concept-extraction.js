// Test Maya concept card extraction
const testMayaResponse = `Hello gorgeous! I'm absolutely thrilled about your Norway concept! Let me create some stunning visual concepts that capture both your unique beauty AND the breathtaking Norwegian aesthetic:

---

🏔️ **FJORD ELEGANCE**
This concept captures the dramatic beauty of Norwegian fjords with you as the sophisticated focal point. Perfect for showing your adventurous yet refined brand - the contrast between raw nature and polished elegance creates compelling storytelling.
FLUX_PROMPT: [Professional portrait of sandra standing near dramatic Norwegian fjord, morning mist rising from deep blue waters, wearing cream cashmere coat and warm knit scarf, hair gently windswept, natural makeup highlighting healthy glow, rocky mountain backdrop with pine trees, soft golden hour lighting filtering through Nordic clouds, editorial travel photography, medium format camera aesthetic, serene yet powerful composition]

---

✨ **SCANDI MINIMALIST COZY**
Embracing hygge culture in an authentic Norwegian cabin setting. This concept tells the story of sophisticated simplicity - your refined taste meeting Nordic comfort culture.
FLUX_PROMPT: [Intimate portrait of sandra in traditional Norwegian wooden cabin, sitting by large window overlooking snow-covered landscape, wearing chunky cream knit sweater, holding steaming ceramic mug, soft natural lighting from window, warm interior wood tones, minimalist Nordic decor, peaceful contemplative expression, cozy textiles and sheepskin throw, professional lifestyle photography]

---

🎿 **ALPINE CONFIDENCE**
Active luxury in stunning Norwegian mountain setting. Shows your dynamic personality while maintaining sophisticated style - perfect for brands targeting active, successful women.
FLUX_PROMPT: [Dynamic portrait of sandra on Norwegian ski slope, wearing high-end white ski jacket with subtle metallic details, snow-capped mountains in background, bright mountain sun creating dramatic shadows and highlights, confident smile, rosy cheeks from cold air, professional action lifestyle photography, capturing moment of joy and achievement]

---

☕ **FLATLAY: NORWEGIAN MORNING RITUAL**
Supporting brand imagery showing the details of refined Norwegian living - perfect for social media and brand storytelling without featuring you directly.
FLUX_PROMPT: [Elegant flatlay photography on rustic Norwegian wood table, premium coffee beans scattered artfully, handcrafted ceramic mug with steam rising, traditional Norwegian knitted mittens, fresh pine branches, vintage brass compass, morning light streaming across wooden surface, luxury travel lifestyle aesthetic, overhead composition, rich textures and natural materials]

Which concept speaks to your vision? Let's create something extraordinary! 🎨`;

console.log('🔍 TESTING: Maya response length:', testMayaResponse.length);

// Extract concept cards using the updated regex
const conceptCards = [];
try {
    console.log('🔍 TESTING: Starting concept card extraction...');
    
    // Split by Maya's concept separators (---)
    const conceptSections = testMayaResponse.split(/---+/).filter(section => section.trim().length > 50);
    console.log(`🔍 TESTING: Found ${conceptSections.length} concept sections`);
    
    for (let i = 0; i < conceptSections.length; i++) {
        const section = conceptSections[i].trim();
        console.log(`🔍 TESTING: Processing section ${i}:`, section.substring(0, 200));
        
        // Maya's trained format: [EMOJI] **CONCEPT NAME** \n Description \n FLUX_PROMPT: [prompt]
        // More flexible regex that handles various whitespace and newline patterns
        const conceptPattern = /([^\w\s])\s*\*\*([^*]+)\*\*\s*\n([\s\S]*?)\n\s*FLUX_PROMPT:\s*\[([\s\S]*?)\]/g;
        
        let match;
        while ((match = conceptPattern.exec(section)) !== null) {
            const emoji = match[1].trim();
            const title = match[2].trim();
            let description = match[3].trim();
            let fluxPrompt = match[4].trim();

            // Clean up description by removing extra whitespace and newlines
            description = description.replace(/\s+/g, ' ').substring(0, 300);
            
            if (title && description && fluxPrompt && title.length > 3 && description.length > 20) {
                console.log(`✅ TESTING: Extracted concept - ${emoji} ${title}`);
                conceptCards.push({
                    id: `concept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    title: title,
                    description: description,
                    fluxPrompt: fluxPrompt,
                    creativeLook: 'Professional',
                    emoji: emoji
                });
            } else {
                console.log(`⚠️ TESTING: Skipped concept - title: ${title?.length}, desc: ${description?.length}, prompt: ${fluxPrompt?.length}`);
            }
        }
        
        // Fallback: If no structured concepts found, try simpler patterns
        if (conceptCards.length === 0 && section.includes('**') && section.includes('FLUX_PROMPT:')) {
            console.log('🔄 TESTING: Trying fallback pattern for section:', section.substring(0, 100));
            
            // Simpler pattern that looks for any **title** followed by FLUX_PROMPT:
            const fallbackPattern = /\*\*([^*]+)\*\*\s*([\s\S]*?)\s*FLUX_PROMPT:\s*\[([\s\S]*?)\]/g;
            let fallbackMatch;
            
            while ((fallbackMatch = fallbackPattern.exec(section)) !== null) {
                const title = fallbackMatch[1].trim();
                let description = fallbackMatch[2].trim();
                let fluxPrompt = fallbackMatch[3].trim();
                
                // Clean up description
                description = description.replace(/\s+/g, ' ').substring(0, 300);
                
                if (title && description && fluxPrompt && title.length > 3) {
                    console.log(`✅ TESTING: Fallback extracted - ${title}`);
                    conceptCards.push({
                        id: `concept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        title: title,
                        description: description || title,
                        fluxPrompt: fluxPrompt,
                        creativeLook: 'Professional',
                        emoji: '📸'
                    });
                }
            }
        }
    }
    
    console.log(`✅ TESTING: Extracted ${conceptCards.length} concept cards total`);
} catch (parseError) {
    console.error('❌ TESTING: Concept card extraction error:', parseError);
}

console.log('\n🎯 EXTRACTED CONCEPT CARDS:');
conceptCards.forEach((card, index) => {
    console.log(`\n${index + 1}. ${card.emoji} ${card.title}`);
    console.log(`   Description: ${card.description.substring(0, 100)}...`);
    console.log(`   FLUX Prompt: ${card.fluxPrompt.substring(0, 100)}...`);
});