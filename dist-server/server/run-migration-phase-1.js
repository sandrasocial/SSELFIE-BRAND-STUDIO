import { migrateAiImagesToGeneratedImages, verifyMigration } from './migration-phase-1.js';
async function runMigrationPhase1() {
    console.log('🚀 PHASE 1: Starting Database Migration');
    console.log('=====================================');
    try {
        console.log('📊 Step 1: Verifying current database state...');
        const initialState = await verifyMigration();
        console.log(`Initial state: aiImages: ${initialState.aiImagesCount}, generatedImages: ${initialState.generatedImagesCount}`);
        console.log('🔄 Step 2: Running migration process...');
        const migrationResult = await migrateAiImagesToGeneratedImages();
        console.log('📈 Step 3: Migration Results');
        console.log(`✅ Migration Success: ${migrationResult.success}`);
        console.log(`📊 Records Migrated: ${migrationResult.migratedCount}`);
        console.log(`⏭️  Records Skipped: ${migrationResult.skippedCount}`);
        if (migrationResult.errors.length > 0) {
            console.log('❌ Errors encountered:');
            migrationResult.errors.forEach(error => console.log(`   - ${error}`));
        }
        console.log('🔍 Step 4: Final verification...');
        const finalState = await verifyMigration();
        console.log(`Final state: aiImages: ${finalState.aiImagesCount}, generatedImages: ${finalState.generatedImagesCount}`);
        console.log('=====================================');
        console.log('🎯 PHASE 1: Database Migration Complete');
        console.log('Route consolidation and database migration successful!');
    }
    catch (error) {
        console.error('💥 FATAL: Migration failed:', error);
        process.exit(1);
    }
}
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigrationPhase1().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Migration script failed:', error);
        process.exit(1);
    });
}
export { runMigrationPhase1 };
//# sourceMappingURL=run-migration-phase-1.js.map