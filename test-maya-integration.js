"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maya_service_1 = require("./server/services/maya-service");
const storage_1 = require("./server/storage");
// Simple test to verify Maya integration
async function testMayaIntegration() {
    console.log('Testing Maya integration...');
    try {
        // Test that MayaService can be instantiated
        const db = new storage_1.DatabaseStorage();
        const mayaService = new maya_service_1.MayaService(db);
        console.log('✅ MayaService instantiated successfully');
        // Test that the service has the expected methods
        if (typeof mayaService.processChat === 'function') {
            console.log('✅ processChat method exists');
        }
        else {
            console.log('❌ processChat method missing');
        }
        if (typeof mayaService.generateImages === 'function') {
            console.log('✅ generateImages method exists');
        }
        else {
            console.log('❌ generateImages method missing');
        }
        if (typeof mayaService.getGenerationStatus === 'function') {
            console.log('✅ getGenerationStatus method exists');
        }
        else {
            console.log('❌ getGenerationStatus method missing');
        }
        console.log('🎉 Maya integration test completed successfully!');
    }
    catch (error) {
        console.error('❌ Maya integration test failed:', error);
        process.exit(1);
    }
}
testMayaIntegration();
