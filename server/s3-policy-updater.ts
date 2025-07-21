import AWS from 'aws-sdk';
import fs from 'fs';

/**
 * S3 Policy Updater - Fix Critical S3 Permissions Issue
 * Updates the bucket policy to allow sselfie-s3-user proper access
 */
export class S3PolicyUpdater {
  private static s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
  });

  private static readonly BUCKET_NAME = 'sselfie-training-zips';

  /**
   * Fixed bucket policy that allows both IAM user and public access
   */
  private static readonly FIXED_POLICY = {
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

  /**
   * Apply the fixed bucket policy to resolve user upload issues
   */
  static async applyFixedBucketPolicy(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔧 S3 POLICY FIX: Applying corrected bucket policy...');
      
      const policyParams = {
        Bucket: this.BUCKET_NAME,
        Policy: JSON.stringify(this.FIXED_POLICY)
      };

      await this.s3.putBucketPolicy(policyParams).promise();
      
      console.log('✅ S3 POLICY FIX: Bucket policy updated successfully');
      return { 
        success: true, 
        message: 'S3 bucket policy updated successfully. Users can now upload training images.' 
      };

    } catch (error) {
      console.error('❌ S3 POLICY FIX: Failed to update bucket policy:', error);
      return { 
        success: false, 
        message: `Failed to update S3 bucket policy: ${error.message}` 
      };
    }
  }

  /**
   * Get current bucket policy for debugging
   */
  static async getCurrentBucketPolicy(): Promise<{ success: boolean; policy: any; message: string }> {
    try {
      console.log('🔍 S3 POLICY CHECK: Getting current bucket policy...');
      
      const result = await this.s3.getBucketPolicy({
        Bucket: this.BUCKET_NAME
      }).promise();

      const policy = JSON.parse(result.Policy || '{}');
      console.log('📋 Current bucket policy:', JSON.stringify(policy, null, 2));
      
      return { 
        success: true, 
        policy, 
        message: 'Current bucket policy retrieved successfully' 
      };

    } catch (error) {
      console.error('❌ S3 POLICY CHECK: Failed to get bucket policy:', error);
      return { 
        success: false, 
        policy: null, 
        message: `Failed to get bucket policy: ${error.message}` 
      };
    }
  }

  /**
   * Test S3 access after policy update
   */
  static async testS3Access(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 S3 ACCESS TEST: Testing bucket access...');
      
      // Test listing bucket contents
      const listResult = await this.s3.listObjects({
        Bucket: this.BUCKET_NAME,
        MaxKeys: 5
      }).promise();

      console.log(`✅ S3 ACCESS TEST: Can list bucket - found ${listResult.Contents?.length || 0} objects`);
      
      // Test upload (small test file)
      const testKey = `test-access-${Date.now()}.txt`;
      await this.s3.upload({
        Bucket: this.BUCKET_NAME,
        Key: testKey,
        Body: 'S3 access test',
        ContentType: 'text/plain'
      }).promise();

      console.log('✅ S3 ACCESS TEST: Upload test successful');
      
      // Clean up test file
      await this.s3.deleteObject({
        Bucket: this.BUCKET_NAME,
        Key: testKey
      }).promise();

      console.log('✅ S3 ACCESS TEST: Delete test successful');
      
      return { 
        success: true, 
        message: 'S3 access test passed - bucket is accessible for uploads and downloads' 
      };

    } catch (error) {
      console.error('❌ S3 ACCESS TEST: Failed:', error);
      return { 
        success: false, 
        message: `S3 access test failed: ${error.message}` 
      };
    }
  }
}