"""
SSELFIE STUDIO Storage Configuration
"""

import os
from pathlib import Path

# Storage Paths
BASE_STORAGE_PATH = Path("storage")
IMAGE_STORAGE_PATH = BASE_STORAGE_PATH / "images"
TEMP_STORAGE_PATH = BASE_STORAGE_PATH / "temp"

# AWS S3 Configuration
AWS_S3_BUCKET = os.getenv("SSELFIE_S3_BUCKET", "sselfie-studio-images")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# Storage Limits
MAX_IMAGE_SIZE_MB = 10
SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'gif']

# Migration Settings
MIGRATION_BATCH_SIZE = 100
MAX_RETRY_ATTEMPTS = 3

# Recovery Settings
RECOVERY_TIMEOUT = 300  # seconds
MAX_RECOVERY_BATCH = 1000