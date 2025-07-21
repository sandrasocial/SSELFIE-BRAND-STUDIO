import AWS from 'aws-sdk';

console.log('🔧 EMERGENCY S3 POLICY FIX STARTING...');

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

const BUCKET_NAME = 'sselfie-training-zips';

// Fixed bucket policy that allows both IAM user and public access
const FIXED_POLICY = {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowSSelfieS3UserFullAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::440740774281:user/sselfie-s3-user"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::sselfie-training-zips",
        "arn:aws:s3:::sselfie-training-zips/*"
      ]
    },
    {
      "Sid": "AllowReplicatePublicReadAccess",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::sselfie-training-zips/*"
    }
  ]
};

async function fixS3Policy() {
  try {
    console.log('📋 Current policy check...');
    
    // Get current policy
    try {
      const currentPolicy = await s3.getBucketPolicy({ Bucket: BUCKET_NAME }).promise();
      console.log('🔍 Current bucket policy:', JSON.stringify(JSON.parse(currentPolicy.Policy), null, 2));
    } catch (error) {
      console.log('⚠️ Could not get current policy:', error.message);
    }
    
    console.log('🔧 Applying fixed bucket policy...');
    
    // Apply the fixed policy
    await s3.putBucketPolicy({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(FIXED_POLICY)
    }).promise();
    
    console.log('✅ SUCCESS: S3 bucket policy updated successfully!');
    console.log('📋 New policy applied:', JSON.stringify(FIXED_POLICY, null, 2));
    
    // Test access
    console.log('🧪 Testing S3 access...');
    const listResult = await s3.listObjects({ Bucket: BUCKET_NAME, MaxKeys: 5 }).promise();
    console.log(`✅ S3 access test passed - found ${listResult.Contents?.length || 0} objects`);
    
    // Test upload
    const testKey = `access-test-${Date.now()}.txt`;
    await s3.upload({
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: 'S3 access verification test',
      ContentType: 'text/plain'
    }).promise();
    
    console.log('✅ Upload test successful');
    
    // Clean up test file
    await s3.deleteObject({ Bucket: BUCKET_NAME, Key: testKey }).promise();
    console.log('✅ Cleanup test successful');
    
    console.log('🎉 EMERGENCY S3 FIX COMPLETED SUCCESSFULLY!');
    console.log('👤 User 45292112 (gloth.coaching@gmail.com) can now upload training images');
    
  } catch (error) {
    console.error('❌ EMERGENCY S3 FIX FAILED:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

fixS3Policy();