from PIL import Image
import numpy as np
import os

class MockImageGenerator:
    """Generate mock images for SSELFIE STUDIO testing"""
    
    @staticmethod
    def create_test_image(width=800, height=600, color=(255, 255, 255)):
        """Create a solid color test image"""
        image = Image.new('RGB', (width, height), color)
        return image
    
    @staticmethod
    def create_gradient_image(width=800, height=600):
        """Create a gradient test image"""
        array = np.zeros((height, width, 3), dtype=np.uint8)
        for x in range(width):
            for y in range(height):
                array[y, x] = [(x*255)//width, (y*255)//height, 100]
        return Image.fromarray(array)
    
    def generate_test_suite(self, output_dir='tests/fixtures/images'):
        """Generate a suite of test images"""
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        # Generate different types of test images
        test_images = {
            'solid_white.jpg': self.create_test_image(),
            'solid_black.jpg': self.create_test_image(color=(0, 0, 0)),
            'gradient.jpg': self.create_gradient_image(),
            'small.jpg': self.create_test_image(width=100, height=100),
            'large.jpg': self.create_test_image(width=2000, height=1500)
        }
        
        # Save all test images
        for filename, image in test_images.items():
            image.save(os.path.join(output_dir, filename))
            
        return test_images

if __name__ == '__main__':
    generator = MockImageGenerator()
    generator.generate_test_suite()