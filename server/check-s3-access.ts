#!/usr/bin/env tsx
// Quick S3 access check and diagnosis
import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';

async function checkS3Access() {
  console.log('🔍 S3 ACCESS CHECK: Diagnosing S3 permissions...');
  
  const s3Client = new S3Client({
    region: 'eu-north-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  
  const bucket = 'sselfie-training-zips';
  const userId = '42585527';
  
  try {
    // Test 1: Can we access the known working image?
    console.log('📝 Test 1: Checking known working image...');
    const knownKey = `images/${userId}/tracker_435_img_0_1753971646031.png`;
    
    const headCommand = new HeadObjectCommand({
      Bucket: bucket,
      Key: knownKey
    });
    
    const headResult = await s3Client.send(headCommand);
    console.log('✅ Known image exists:', {
      size: headResult.ContentLength,
      type: headResult.ContentType,
      lastModified: headResult.LastModified
    });
    
    // Test 2: Can we list objects in the images directory?
    console.log('\n📝 Test 2: Attempting to list images directory...');
    
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: `images/${userId}/`,
      MaxKeys: 10
    });
    
    const listResult = await s3Client.send(listCommand);
    
    if (listResult.Contents && listResult.Contents.length > 0) {
      console.log(`✅ Found ${listResult.Contents.length} objects in images directory:`);
      listResult.Contents.forEach((obj, index) => {
        if (obj.Key) {
          console.log(`   ${index + 1}. ${obj.Key}`);
        }
      });
    } else {
      console.log('⚠️ No objects found or listing restricted');
    }
    
  } catch (error) {
    console.error('❌ S3 ACCESS ERROR:', error);
    
    if (error instanceof Error && error.message.includes('AccessDenied')) {
      console.log('\n🔧 SOLUTION REQUIRED:');
      console.log('Your AWS user needs the following S3 permissions:');
      console.log('   - s3:GetObject (you have this)');
      console.log('   - s3:ListBucket (you might be missing this)');
      console.log('   - s3:GetBucketLocation');
      console.log('\nTo fix this, you need to:');
      console.log('1. Go to AWS IAM console');
      console.log('2. Find your sselfie-s3-user');
      console.log('3. Add ListBucket permission for the bucket');
      console.log('4. Or provide your AWS administrator these details');
    }
  }
}

checkS3Access().catch(console.error);