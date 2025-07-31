#!/usr/bin/env node

/**
 * CRITICAL S3 PERMISSIONS FIX
 * 
 * This script fixes the AWS S3 access denied errors by applying the correct bucket policy
 * that explicitly allows sselfie-s3-user access to the sselfie-training-zips bucket.
 */

import AWS from 'aws-sdk';
import fs from 'fs';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

const BUCKET_NAME = 'sselfie-training-zips';

// Correct bucket policy that explicitly allows sselfie-s3-user
const FIXED_BUCKET_POLICY = {
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

async function fixS3Permissions() {
  try {
    console.log('🔧 FIXING S3 PERMISSIONS FOR SSELFIE-TRAINING-ZIPS BUCKET...');
    console.log('📋 Current issue: sselfie-s3-user being denied access with AccessDenied errors');
    
    // Get current bucket policy
    console.log('📊 Checking current bucket policy...');
    try {
      const currentPolicy = await s3.getBucketPolicy({ Bucket: BUCKET_NAME }).promise();
      console.log('📄 Current policy:', JSON.stringify(JSON.parse(currentPolicy.Policy), null, 2));
    } catch (error) {
      if (error.code === 'NoSuchBucketPolicy') {
        console.log('⚠️  No bucket policy currently exists');
      } else {
        console.log('❌ Error getting current policy:', error.message);
      }
    }
    
    // Apply the fixed bucket policy
    console.log('🔧 Applying fixed bucket policy...');
    const putPolicyParams = {
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(FIXED_BUCKET_POLICY)
    };
    
    await s3.putBucketPolicy(putPolicyParams).promise();
    console.log('✅ SUCCESS: Fixed bucket policy applied!');
    
    // Verify the fix
    console.log('🔍 Verifying the fix...');
    const verifyPolicy = await s3.getBucketPolicy({ Bucket: BUCKET_NAME }).promise();
    const appliedPolicy = JSON.parse(verifyPolicy.Policy);
    
    console.log('✅ VERIFICATION: New policy applied successfully');
    console.log('📄 Applied policy:', JSON.stringify(appliedPolicy, null, 2));
    
    // Test access with a simple operation
    console.log('🧪 Testing S3 access...');
    try {
      await s3.listObjectsV2({ Bucket: BUCKET_NAME, MaxKeys: 1 }).promise();
      console.log('✅ SUCCESS: S3 access test passed!');
      console.log('🎉 UPLOAD SYSTEM SHOULD NOW BE WORKING!');
      console.log('📝 Users can now upload selfies for AI training');
    } catch (testError) {
      console.log('❌ S3 access test failed:', testError.message);
      console.log('🔍 Additional troubleshooting may be needed');
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR fixing S3 permissions:', error);
    console.error('🆘 Manual intervention required');
    console.error('📋 Error details:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    });
  }
}

// Run the fix
fixS3Permissions().catch(console.error);