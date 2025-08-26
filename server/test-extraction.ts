#!/usr/bin/env tsx

// Test script for manual LoRA extraction
import { ManualLoRAExtractor } from './manual-lora-extraction.js';

async function testExtraction() {
  try {
    console.log('🔧 Starting manual LoRA extraction test...');
    const extractor = new ManualLoRAExtractor();
    const result = await extractor.extractWeightsForUser('42585527');
    
    if (result) {
      console.log('✅ SUCCESS: LoRA weights found:', result);
    } else {
      console.log('❌ No LoRA weights found');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testExtraction();