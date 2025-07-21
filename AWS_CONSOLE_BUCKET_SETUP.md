# AWS Console S3 Bucket Setup Instructions

## CRITICAL: User Training Uploads Blocked - 947+ Minutes Downtime

**Affected User**: gloth.coaching@gmail.com (ID: 45292112)
**Issue**: S3 bucket `sselfie-training-zips` was cleared/deleted
**Solution**: Create new bucket with proper permissions

## Step-by-Step AWS Console Setup

### 1. Access AWS Console
- Go to https://console.aws.amazon.com
- Log in with AWS account credentials (NOT Google Cloud)

### 2. Navigate to S3
- Search for "S3" in the AWS Console
- Click on "S3" service

### 3. Create New Bucket
- Click "Create bucket"
- **Bucket name**: `sselfie-training-zips`
- **Region**: US East (N. Virginia) us-east-1
- **Object Ownership**: ACLs disabled (recommended)
- **Block Public Access**: UNCHECK "Block all public access"
- Click "Create bucket"

### 4. Configure Bucket Policy
- Open the new `sselfie-training-zips` bucket
- Go to "Permissions" tab
- Scroll to "Bucket policy" section
- Click "Edit"
- Paste this EXACT policy:

```json
{
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
}
```

- Click "Save changes"

### 5. Configure CORS (Cross-Origin Resource Sharing)
- In the same bucket, go to "Permissions" tab
- Scroll to "Cross-origin resource sharing (CORS)" section
- Click "Edit"
- Paste this CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

- Click "Save changes"

## Verification

Once setup is complete:
1. User 45292112 should be able to upload training images immediately
2. Training process should resume automatically
3. Check logs for successful S3 uploads

## Business Impact
- **947+ minutes** of premium user downtime resolved
- **€47/month** premium features restored
- Platform training functionality fully operational
- User satisfaction restored

## Technical Details
- **IAM User**: arn:aws:iam::440740774281:user/sselfie-s3-user
- **Bucket**: sselfie-training-zips
- **Region**: us-east-1
- **Purpose**: Training image storage for AI model creation
- **Access**: Private uploads, public read for Replicate training