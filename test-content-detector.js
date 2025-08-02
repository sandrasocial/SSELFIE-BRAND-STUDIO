// Quick test of ContentDetector
import { ContentDetector } from './server/utils/content-detection.js';

const testMessage = 'Hey Elena, How are you today?';
const result = ContentDetector.analyzeMessage(testMessage);

console.log('Message:', testMessage);
console.log('Detected Type:', result.detectedType);
console.log('Needs Claude:', result.needsClaudeGeneration);
console.log('Reasoning:', result.reasoning);
console.log('Full result:', JSON.stringify(result, null, 2));