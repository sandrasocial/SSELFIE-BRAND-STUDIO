import { db } from '../drizzle';
import { ImageStorageService } from '../image-storage-service';

async function migrateTempUrls() {
  const imageStorage = new ImageStorageService();
  
  try {
    console.log('🔄 Starting migration of temporary URLs to permanent S3 URLs...');
    
    // Get all images with temporary URLs
    const result = await db.execute(`
      SELECT id, image_url, user_id, created_at 
      FROM ai_images 
      WHERE image_url LIKE '%replicate%' 
         OR image_url LIKE '%temp%'
         OR image_url LIKE '%pbxt.replicate.delivery%'
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Found ${result.rows.length} images with temporary URLs`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const row of result.rows) {
      try {
        console.log(`🔄 Migrating image ${row.id}: ${String(row.image_url).substring(0, 60)}...`);
        
        // Use the image storage service to migrate to permanent S3 URL
        const permanentUrl = await ImageStorageService.migrateTempUrlToS3(String(row.image_url), String(row.user_id));
        
        if (permanentUrl && permanentUrl !== row.image_url) {
          // Update the image with permanent URL
          await db.execute(`
            UPDATE ai_images 
            SET image_url = $1 
            WHERE id = $2
          `, [permanentUrl, String(row.id)]);
          
          console.log(`✅ Image ${row.id}: Migrated to permanent S3 URL`);
          console.log(`   Old: ${String(row.image_url).substring(0, 50)}...`);
          console.log(`   New: ${String(permanentUrl).substring(0, 50)}...`);
          successCount++;
        } else {
          console.log(`⚠️  Image ${row.id}: Migration skipped (may already be permanent)`);
        }
        
      } catch (error) {
        console.error(`❌ Image ${row.id}: Migration failed:`, error);
        failureCount++;
      }
    }
    
    console.log('\n📈 Migration Results:');
    console.log(`✅ Successfully migrated: ${successCount} images`);
    console.log(`❌ Failed migrations: ${failureCount} images`);
    console.log(`📊 Total processed: ${result.rows.length} images`);
    
    // Verify the results
    const verification = await db.execute(`
      SELECT 
        CASE 
          WHEN image_url LIKE '%s3%' OR image_url LIKE '%amazonaws%' THEN 'S3'
          WHEN image_url LIKE '%replicate%' OR image_url LIKE '%temp%' THEN 'Temporary'
          ELSE 'Other'
        END as url_type,
        COUNT(*) as count 
      FROM ai_images 
      GROUP BY url_type 
      ORDER BY count DESC
    `);
    
    console.log('\n🔍 Verification - URL Types in database:');
    verification.rows.forEach(row => {
      console.log(`• ${row.url_type}: ${row.count} images`);
    });
    
    console.log('\n✅ URL migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error migrating URLs:', error);
    throw error;
  }
}

// Run the migration immediately in ES module environment
migrateTempUrls()
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });

export { migrateTempUrls };