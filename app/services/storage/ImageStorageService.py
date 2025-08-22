import boto3
import logging
from pathlib import Path
from typing import Optional, Union
from botocore.exceptions import ClientError

class ImageStorageService:
    def __init__(self, local_storage_path: str = "storage/images", 
                 bucket_name: str = "sselfie-studio-images"):
        self.local_storage_path = Path(local_storage_path)
        self.bucket_name = bucket_name
        self.s3_client = None
        self.logger = logging.getLogger(__name__)
        
        # Ensure local storage exists
        self.local_storage_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize S3 client
        try:
            self.s3_client = boto3.client('s3')
            self.logger.info("S3 client initialized successfully")
        except Exception as e:
            self.logger.warning(f"Failed to initialize S3 client: {e}")
            
    def store_image(self, image_data: bytes, image_name: str,
                    user_id: str) -> tuple[bool, str]:
        """Store image with S3 primary and local fallback."""
        image_path = f"{user_id}/{image_name}"
        
        # Try S3 first
        if self.s3_client:
            try:
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=image_path,
                    Body=image_data
                )
                self.logger.info(f"Image {image_name} stored in S3")
                return True, f"s3://{self.bucket_name}/{image_path}"
            except ClientError as e:
                self.logger.error(f"S3 storage failed: {e}")
                
        # Local fallback
        try:
            local_path = self.local_storage_path / user_id
            local_path.mkdir(exist_ok=True)
            full_path = local_path / image_name
            
            with open(full_path, 'wb') as f:
                f.write(image_data)
            self.logger.info(f"Image {image_name} stored locally")
            return True, str(full_path)
        except Exception as e:
            self.logger.error(f"Local storage failed: {e}")
            return False, str(e)
            
    def retrieve_image(self, image_path: str, user_id: str) -> Optional[bytes]:
        """Retrieve image from S3 or local storage."""
        # Try S3 first
        if self.s3_client:
            try:
                response = self.s3_client.get_object(
                    Bucket=self.bucket_name,
                    Key=f"{user_id}/{image_path}"
                )
                return response['Body'].read()
            except ClientError as e:
                self.logger.warning(f"S3 retrieval failed: {e}")
        
        # Try local
        try:
            local_path = self.local_storage_path / user_id / image_path
            if local_path.exists():
                return local_path.read_bytes()
        except Exception as e:
            self.logger.error(f"Local retrieval failed: {e}")
        
        return None
        
    def migrate_to_s3(self, user_id: str) -> tuple[int, int]:
        """Migrate local images to S3."""
        if not self.s3_client:
            return 0, 0
            
        migrated = 0
        failed = 0
        local_path = self.local_storage_path / user_id
        
        if not local_path.exists():
            return 0, 0
            
        for image_file in local_path.glob('*'):
            try:
                image_data = image_file.read_bytes()
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=f"{user_id}/{image_file.name}",
                    Body=image_data
                )
                migrated += 1
            except Exception as e:
                self.logger.error(f"Migration failed for {image_file}: {e}")
                failed += 1
                
        return migrated, failed
        
    def recover_gallery_images(self, user_id: str) -> dict:
        """Recover all gallery images for a user."""
        results = {
            'recovered': 0,
            'failed': 0,
            'sources': {
                's3': 0,
                'local': 0
            }
        }
        
        # Try S3 first
        if self.s3_client:
            try:
                response = self.s3_client.list_objects_v2(
                    Bucket=self.bucket_name,
                    Prefix=f"{user_id}/"
                )
                for obj in response.get('Contents', []):
                    try:
                        self.retrieve_image(obj['Key'].split('/')[-1], user_id)
                        results['recovered'] += 1
                        results['sources']['s3'] += 1
                    except Exception:
                        results['failed'] += 1
            except ClientError as e:
                self.logger.error(f"S3 recovery failed: {e}")
        
        # Check local storage
        local_path = self.local_storage_path / user_id
        if local_path.exists():
            for image_file in local_path.glob('*'):
                if image_file.is_file():
                    try:
                        image_file.read_bytes()  # Verify readable
                        results['recovered'] += 1
                        results['sources']['local'] += 1
                    except Exception:
                        results['failed'] += 1
                        
        return results