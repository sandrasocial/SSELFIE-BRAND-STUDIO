import { enhanced_file_editor } from './server/tools/enhanced_file_editor';

async function demonstrateEnhancedEditor() {
  console.log('🚀 Demonstrating Enhanced File Editor Capabilities');
  
  try {
    // Test 1: Line Replace - Change line 12 without exact string matching
    console.log('\n1️⃣ Testing line_replace (line 12)...');
    const result1 = await enhanced_file_editor({
      command: 'line_replace',
      path: 'test_enhanced_editor.ts',
      line_number: 12,
      line_content: '    console.log("Enhanced TestClass initialized with new capabilities");'
    });
    console.log('✅ Result:', result1);
    
    // Test 2: Section Replace - Replace lines 15-17 with new implementation
    console.log('\n2️⃣ Testing section_replace (lines 15-17)...');
    const result2 = await enhanced_file_editor({
      command: 'section_replace',
      path: 'test_enhanced_editor.ts',
      start_line: 15,
      end_line: 17,
      section_content: `  addItem(item: TestInterface): void {
    // Enhanced validation
    if (item && typeof item.id === 'number' && item.name) {
      this.data.push(item);
      console.log(\`Item \${item.name} added successfully\`);
    }
  }`
    });
    console.log('✅ Result:', result2);
    
    // Test 3: Multi-Replace - Multiple replacements in one call
    console.log('\n3️⃣ Testing multi_replace...');
    const result3 = await enhanced_file_editor({
      command: 'multi_replace',
      path: 'test_enhanced_editor.ts',
      replacements: [
        { old: 'TestInterface', new: 'EnhancedTestInterface' },
        { old: 'TestClass', new: 'EnhancedTestClass' },
        { old: 'testInstance', new: 'enhancedInstance' }
      ]
    });
    console.log('✅ Result:', result3);
    
    console.log('\n🎉 All enhanced file editor tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during demonstration:', error.message);
  }
}

// Run the demonstration
if (require.main === module) {
  demonstrateEnhancedEditor();
}

export { demonstrateEnhancedEditor };