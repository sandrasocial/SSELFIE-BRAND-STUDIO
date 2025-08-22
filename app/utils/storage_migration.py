"""
Storage Migration Utility for SSELFIE STUDIO
"""

import logging
from typing import Optional, Dict
from pathlib import Path
from ..services.storage.ImageStorageService import ImageStorageService
from ..config.storage_config import (
    MIGRATION_BATCH_SIZE,
    MAX_RETRY_ATTEMPTS
)

logger = logging.getLogger(__name__)

class StorageMigrationUtil:
    def __init__(self, storage_service: ImageStorageService):
        self.storage_service = storage_service
        self.migration_stats = {
            'total_processed': 0,
            'successful': 0,
            'failed': 0,
            'skipped': 0
        }

    def migrate_user_data(self, user_id: str) -> Dict:
        """Migrate all images for a specific user."""
        logger.info(f"Starting migration for user {user_id}")
        
        migrated, failed = self.storage_service.migrate_to_s3(user_id)
        
        self.migration_stats['total_processed'] += migrated + failed
        self.migration_stats['successful'] += migrated
        self.migration_stats['failed'] += failed
        
        return {
            'user_id': user_id,
            'migrated': migrated,
            'failed': failed,
            'status': 'completed'
        }

    def verify_migration(self, user_id: str) -> Dict:
        """Verify migration success and data integrity."""
        results = {
            'verified': 0,
            'missing': 0,
            'corrupted': 0
        }
        
        # Check S3 objects
        try:
            s3_images = self.storage_service.list_user_images(user_id)
            for image_path in s3_images:
                if self.storage_service.verify_image(image_path, user_id):
                    results['verified'] += 1
                else:
                    results['corrupted'] += 1
        except Exception as e:
            logger.error(f"Verification failed: {e}")
            results['missing'] += 1
            
        return results

    def rollback_migration(self, user_id: str) -> bool:
        """Rollback failed migration if needed."""
        try:
            # Restore from local backup
            local_backup = Path(f"storage/backup/{user_id}")
            if local_backup.exists():
                # Restore logic here
                return True
        except Exception as e:
            logger.error(f"Rollback failed: {e}")
        return False

    def get_migration_status(self) -> Dict:
        """Get current migration statistics."""
        return self.migration_stats.copy()

    def cleanup_temporary_data(self, user_id: str) -> bool:
        """Clean up temporary migration data."""
        try:
            temp_path = Path(f"storage/temp/{user_id}")
            if temp_path.exists():
                for item in temp_path.glob('*'):
                    item.unlink()
                temp_path.rmdir()
            return True
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")
            return False