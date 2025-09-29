export function validateMayaPrompt(prompt, options) {
    const issues = [];
    const suggestions = [];
    const wordCount = prompt.split(/\s+/).filter(word => word.length > 0).length;
    const targetRange = options.targetWordCount || { min: 50, max: 500 };
    if (wordCount < targetRange.min) {
        issues.push(`Prompt too short: ${wordCount} words (optimal: ${targetRange.min}-${targetRange.max})`);
        suggestions.push('Add more specific physical details, camera settings, or environmental description');
    }
    else if (wordCount > targetRange.max) {
        issues.push(`Prompt too long: ${wordCount} words (optimal: ${targetRange.min}-${targetRange.max})`);
        suggestions.push('Condense description while preserving core styling intelligence');
    }
    const triggerWordMatches = prompt.match(new RegExp(options.triggerWord, 'gi'));
    const triggerWordCount = triggerWordMatches?.length || 0;
    const hasValidTriggerWord = triggerWordCount === 1;
    if (triggerWordCount === 0) {
        issues.push(`Missing trigger word: "${options.triggerWord}"`);
        suggestions.push('Ensure trigger word appears exactly once at the start of the prompt');
    }
    else if (triggerWordCount > 1) {
        issues.push(`Duplicate trigger word: "${options.triggerWord}" appears ${triggerWordCount} times`);
        suggestions.push('Remove duplicate instances of trigger word');
    }
    if (options.requiredElements) {
        for (const element of options.requiredElements) {
            if (!prompt.toLowerCase().includes(element.toLowerCase())) {
                issues.push(`Missing required element: "${element}"`);
                suggestions.push(`Add "${element}" to improve FLUX generation quality`);
            }
        }
    }
    if (options.forbiddenElements) {
        for (const element of options.forbiddenElements) {
            if (prompt.toLowerCase().includes(element.toLowerCase())) {
                issues.push(`Contains forbidden element: "${element}"`);
                suggestions.push(`Remove "${element}" - may interfere with FLUX generation`);
            }
        }
    }
    const technicalElements = [
        'camera', 'lens', 'aperture', 'lighting', 'photography'
    ];
    const hasTechnicalSpecs = technicalElements.some(element => prompt.toLowerCase().includes(element));
    if (!hasTechnicalSpecs) {
        issues.push('Missing technical photography specifications');
        suggestions.push('Add camera model, lens specs, aperture, or lighting details');
    }
    const conversationalMarkers = ['**', '#', '- ', '• ', 'Maya', 'styling', 'intelligence'];
    const hasConversationalMarkers = conversationalMarkers.some(marker => prompt.includes(marker));
    if (hasConversationalMarkers) {
        issues.push('Contains conversational or formatting markers');
        suggestions.push('Clean prompt to remove conversation-style formatting');
    }
    return {
        isValid: issues.length === 0,
        issues,
        suggestions,
        wordCount,
        hasValidTriggerWord
    };
}
export function cleanMayaPrompt(prompt) {
    let cleaned = prompt;
    console.log('🎯 MAYA CONVERSATION EXTRACTION: Advanced cleaning with duplicate detection');
    cleaned = cleaned
        .replace(/^[^.!?]*(?:major|MAJOR)\s+[""'][^""']*[""']\s+energy\s*[.!?]$/gi, '')
        .replace(/^[^.!?]*(?:let me create something|I'm creating something)[^.!?]*[.!?]/gi, '')
        .replace(/^[^.!?]*(?:that shows your|showing your)[^.!?]*[.!?]/gi, '')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/^[^.!?]*(?:Oh honey|honey|babe|love|trust me|chef's kiss)[^.!?]*[.!?]/gi, '')
        .replace(/[.!?]\s*(?:your empire-building era|this look says|you're ready to|and this look|ready to own)[^.!?]*[.!?]?$/gi, '.')
        .replace(/(?:OMG|omg|Yes|YES)!?\s*/gi, '')
        .replace(/(?:I'm obsessing over|let me create)/gi, '')
        .replace(/I can help you.*?(?=\w)/gi, '')
        .replace(/Here's.*?(?=\w)/gi, '')
        .replace(/FLUX\s+1\.1\s+PRO\s+STYLING\s+PROMPT:\s*/gi, '')
        .replace(/\[Shot\s*type:.*?\]/gi, '')
        .replace(/\[Environment:.*?\]/gi, '')
        .replace(/\[Styling\s*focus:.*?\]/gi, '')
        .replace(/\[Mood:.*?\]/gi, '')
        .replace(/\[Camera:.*?\]/gi, '')
        .replace(/\[Lighting:.*?\]/gi, '')
        .replace(/\[Style:.*?\]/gi, '')
        .replace(/\[(?!TRIGGER)[A-Za-z\s]+:.*?\]/gi, '')
        .replace(/(?:transformation|before and after|split|diptych|side.by.side|comparison|vs\.|versus)/gi, '')
        .replace(/(?:from .+ to .+|evolution from|journey from|transition from)/gi, '')
        .replace(/\*\*[^*]+\*\*/g, '')
        .replace(/#{1,6}\s+/g, '')
        .replace(/[-•]\s+/g, '')
        .replace(/^\s*[\-\*]\s+/gm, '')
        .replace(/\n\s*\n/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^[\s,]+|[\s,]+$/g, '')
        .replace(/,\s*,+/g, ', ')
        .trim();
    console.log(`🔍 BEFORE CLEANING: ${prompt.substring(0, 150)}...`);
    console.log(`✅ AFTER CLEANING: ${cleaned.substring(0, 150)}...`);
    return cleaned;
}
export function hasTechnicalPrefix(prompt) {
    const technicalIndicators = [
        'professional photography', 'shot with', 'captured with', 'photographed',
        'Canon EOS', 'Sony A7', 'Nikon Z', 'lens', 'aperture', 'ISO'
    ];
    return technicalIndicators.some(indicator => prompt.toLowerCase().includes(indicator.toLowerCase()));
}
export function addAnatomyKeywords(prompt) {
    const hasAnatomyKeywords = /(?:hands|fingers|anatomy|positioning)/i.test(prompt);
    if (!hasAnatomyKeywords && prompt.length < 100) {
        return `${prompt}, natural positioning`;
    }
    return prompt;
}
export const FLUX_QUALITY_TAGS = [
    'professional photography',
    'natural skin texture',
    'authentic presence',
    'sharp focus',
    'natural expression',
    'high resolution',
    'DSLR quality'
];
export const CAMERA_SPECS = {
    closeUp: 'Canon EOS R5, 85mm f/1.4 lens, f/2.8 aperture, shallow depth of field, focus on eyes',
    halfBody: 'Sony A7R V, 50mm f/1.2 lens, f/2.8 aperture, natural perspective, balanced composition',
    fullBody: 'Canon EOS R5, 35mm f/1.8 lens, f/4 aperture, full scene coverage, environmental context'
};
//# sourceMappingURL=generation-validator.js.map