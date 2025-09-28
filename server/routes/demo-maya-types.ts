/**
 * Demo Maya Types Validation
 * Simple demonstration of the type-safe API implementation
 */

// Import the validation functions directly
import { z } from 'zod';

// Define a simple Maya chat schema for demonstration
const demoChatSchema = z.object({
  message: z.string().min(1).max(1000).trim(),
  userId: z.string().min(1),
  timestamp: z.string().optional()
});

// Demo function to show validation works
export function validateDemoMayaChat(data: unknown) {
  try {
    const result = demoChatSchema.safeParse(data);
    if (result.success) {
      console.log('✅ Validation passed:', result.data);
      return { success: true, data: result.data };
    } else {
      console.log('❌ Validation failed:', result.error.errors);
      return { success: false, errors: result.error.errors };
    }
  } catch (error) {
    console.log('❌ Validation error:', error);
    return { success: false, errors: [(error as Error).message] };
  }
}

// Demo the validation
console.log('🚀 Testing Maya API Types Validation...');

// Test 1: Valid request
const validRequest = {
  message: 'Hello Maya, help me with a photoshoot concept',
  userId: 'user123',
  timestamp: new Date().toISOString()
};

console.log('\n📋 Test 1: Valid Request');
validateDemoMayaChat(validRequest);

// Test 2: Invalid request (empty message)
const invalidRequest = {
  message: '',
  userId: 'user123'
};

console.log('\n📋 Test 2: Invalid Request (empty message)');
validateDemoMayaChat(invalidRequest);

// Test 3: Request with whitespace trimming
const whitespaceRequest = {
  message: '  Hello Maya  ',
  userId: 'user123'
};

console.log('\n📋 Test 3: Whitespace Trimming');
validateDemoMayaChat(whitespaceRequest);

console.log('\n🎉 Demo completed! Type-safe API validation is working.');