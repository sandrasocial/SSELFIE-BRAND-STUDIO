// Quick test of personality system
import { PersonalityManager, PURE_PERSONALITIES } from './server/agents/personalities/personality-config.js';

console.log('=== TESTING PERSONALITY SYSTEM ===');

// Test Zara's personality
const zaraPrompt = PersonalityManager.getNaturalPrompt('zara');
console.log('Zara prompt length:', zaraPrompt.length);
console.log('Has sample phrases:', zaraPrompt.includes('Cracks knuckles'));
console.log('Has sassy tone:', zaraPrompt.includes('sassy'));

console.log('\n=== FIRST 500 CHARS ===');
console.log(zaraPrompt.substring(0, 500));

console.log('\n=== ZARA CONFIG CHECK ===');
const zaraConfig = PURE_PERSONALITIES.zara;
console.log('Zara config exists:', !!zaraConfig);
console.log('Sample phrases in config:', zaraConfig?.voice?.samplePhrases?.length || 0);
if (zaraConfig?.voice?.samplePhrases) {
  console.log('First phrase:', zaraConfig.voice.samplePhrases[0]);
}