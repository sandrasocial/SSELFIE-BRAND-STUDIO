import unittest
import boto3
import os
from moto import mock_s3
from datetime import datetime

class TestImageStorage(unittest.TestCase):
    """Test suite for SSELFIE STUDIO image storage operations"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        os.environ['AWS_ACCESS_KEY_ID'] = 'testing'
        os.environ['AWS_SECRET_ACCESS_KEY'] = 'testing'
        os.environ['AWS_SECURITY_TOKEN'] = 'testing'
        os.environ['AWS_SESSION_TOKEN'] = 'testing'
        
    def setUp(self):
        """Set up test fixtures before each test method"""
        self.bucket_name = 'sselfie-studio-test'
        self.mock_s3 = mock_s3()
        self.mock_s3.start()
        self.s3_client = boto3.client('s3')
        self.s3_client.create_bucket(Bucket=self.bucket_name)
        
    def tearDown(self):
        """Clean up after each test method"""
        self.mock_s3.stop()
        
    def test_upload_image(self):
        """Test image upload functionality"""
        test_image_path = 'tests/fixtures/test_image.jpg'
        key = f'users/test/{datetime.now().strftime("%Y%m%d_%H%M%S")}.jpg'
        
        with open(test_image_path, 'rb') as image_file:
            self.s3_client.upload_fileobj(image_file, self.bucket_name, key)
            
        # Verify upload
        response = self.s3_client.list_objects_v2(Bucket=self.bucket_name)
        self.assertEqual(len(response['Contents']), 1)
        self.assertEqual(response['Contents'][0]['Key'], key)
        
    def test_download_image(self):
        """Test image download functionality"""
        key = 'test_download.jpg'
        content = b'test image content'
        
        # Upload test content
        self.s3_client.put_object(Bucket=self.bucket_name, Key=key, Body=content)
        
        # Download and verify
        response = self.s3_client.get_object(Bucket=self.bucket_name, Key=key)
        downloaded_content = response['Body'].read()
        self.assertEqual(downloaded_content, content)
        
    def test_delete_image(self):
        """Test image deletion functionality"""
        key = 'test_delete.jpg'
        content = b'test image content'
        
        # Upload test content
        self.s3_client.put_object(Bucket=self.bucket_name, Key=key, Body=content)
        
        # Delete and verify
        self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
        response = self.s3_client.list_objects_v2(Bucket=self.bucket_name)
        self.assertEqual(response.get('KeyCount', 0), 0)

if __name__ == '__main__':
    unittest.main()