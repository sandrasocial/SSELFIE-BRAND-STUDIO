import AWS from 'aws-sdk';

console.log('🏗️ CREATING NEW S3 BUCKET WITH PROPER PERMISSIONS...');

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

const BUCKET_NAME = 'sselfie-training-zips';

// Correct bucket policy with full permissions for IAM user
const BUCKET_POLICY = {
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

async function createBucketWithPolicy() {
  try {
    // Check if bucket already exists
    try {
      await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
      console.log('✅ Bucket already exists, updating policy...');
    } catch (error) {
      if (error.statusCode === 404) {
        console.log('🏗️ Creating new S3 bucket...');
        
        // Create the bucket
        await s3.createBucket({
          Bucket: BUCKET_NAME,
          CreateBucketConfiguration: {
            LocationConstraint: 'us-east-1'
          }
        }).promise();
        
        console.log('✅ S3 bucket created successfully!');
        
        // Wait a moment for bucket to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw error;
      }
    }
    
    console.log('📋 Applying bucket policy...');
    
    // Apply the correct policy
    await s3.putBucketPolicy({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(BUCKET_POLICY)
    }).promise();
    
    console.log('✅ Bucket policy applied successfully!');
    
    // Configure CORS for web uploads
    console.log('🌐 Configuring CORS policy...');
    
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: ['*'],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000
        }
      ]
    };
    
    await s3.putBucketCors({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration
    }).promise();
    
    console.log('✅ CORS policy configured!');
    
    // Test access
    console.log('🧪 Testing bucket access...');
    
    const listResult = await s3.listObjects({ Bucket: BUCKET_NAME, MaxKeys: 5 }).promise();
    console.log(`✅ List test passed - bucket ready for use`);
    
    // Test upload
    const testKey = `setup-test-${Date.now()}.txt`;
    await s3.upload({
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: 'Bucket setup verification test',
      ContentType: 'text/plain'
    }).promise();
    
    console.log('✅ Upload test successful');
    
    // Clean up test file
    await s3.deleteObject({ Bucket: BUCKET_NAME, Key: testKey }).promise();
    console.log('✅ Cleanup test successful');
    
    console.log('🎉 S3 BUCKET SETUP COMPLETED SUCCESSFULLY!');
    console.log(`📦 Bucket: ${BUCKET_NAME}`);
    console.log('👤 IAM User: sselfie-s3-user has full access');
    console.log('🌍 Public read access enabled for Replicate');
    console.log('🔧 CORS configured for web uploads');
    console.log('');
    console.log('✅ USER 45292112 (gloth.coaching@gmail.com) CAN NOW UPLOAD TRAINING IMAGES!');
    
  } catch (error) {
    console.error('❌ BUCKET SETUP FAILED:', error);
    console.error('Error details:', error.message);
    
    if (error.code === 'AccessDenied') {
      console.log('');
      console.log('🔐 ACCESS DENIED - Manual AWS Console Setup Required:');
      console.log('1. Log into AWS Console at console.aws.amazon.com');
      console.log('2. Navigate to S3 service');
      console.log('3. Create bucket: sselfie-training-zips');
      console.log('4. Apply the bucket policy shown above');
      console.log('5. Configure CORS for web uploads');
    }
    
    process.exit(1);
  }
}

createBucketWithPolicy();