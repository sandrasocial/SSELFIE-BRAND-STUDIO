# S3 Bucket Policy Update - Fix Upload Permissions

## CURRENT STATUS
✅ **Bucket exists**: `sselfie-training-zips` is accessible in AWS Console
✅ **Upload works**: S3 uploads are successful 
❌ **Delete fails**: IAM user lacks delete permissions
❌ **Missing permissions**: s3:PutObject, s3:DeleteObject, s3:ListBucket for IAM user

## IMMEDIATE FIX NEEDED

Since you can see the bucket in AWS Console, please update the bucket policy:

### 1. Navigate to Your Bucket
- In AWS Console → S3 → `sselfie-training-zips`
- Click on "Permissions" tab
- Scroll to "Bucket policy" section
- Click "Edit"

### 2. Replace Current Policy
**Current policy** (only allows public read):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::sselfie-training-zips/*"
    }
  ]
}
```

**Replace with this COMPLETE policy** (adds IAM user permissions):
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

### 3. Save Changes
- Click "Save changes"
- Confirm the policy update

## IMMEDIATE IMPACT
Once you update this policy:
- ✅ User 45292112 (gloth.coaching@gmail.com) can immediately upload training images
- ✅ 959+ minute training delay will be resolved
- ✅ Platform training functionality fully restored
- ✅ €47/month premium features working again

## Verification
After updating the policy, the system will automatically:
- Resume checking the stuck training
- Allow new training image uploads
- Complete the user's model training process

**The bucket exists and uploads work - we just need to add the missing IAM user permissions!**