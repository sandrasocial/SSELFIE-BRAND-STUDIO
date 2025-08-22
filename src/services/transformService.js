import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api';

class TransformService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 second timeout for transformations
    });
  }

  /**
   * Transform an image using the selected style
   * @param {Object} params
   * @param {string} params.image - Base64 encoded image
   * @param {string} params.style - Style preset ID
   * @returns {Promise<Object>} Transformed image result
   */
  async transform(params) {
    try {
      const response = await this.client.post('/transform', {
        image: params.image,
        style: params.style,
      });

      return {
        transformedImage: response.data.transformedImage,
        metadata: response.data.metadata
      };
    } catch (error) {
      console.error('Image transformation failed:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to transform image. Please try again.'
      );
    }
  }

  /**
   * Get available style presets
   * @returns {Promise<Array>} List of available style presets
   */
  async getStylePresets() {
    try {
      const response = await this.client.get('/transform/presets');
      return response.data.presets;
    } catch (error) {
      console.error('Failed to fetch style presets:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to load style presets. Please try again.'
      );
    }
  }

  /**
   * Validate image before transformation
   * @param {File} file - Image file to validate
   * @returns {Promise<boolean>} Validation result
   */
  async validateImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await this.client.post('/transform/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.valid;
    } catch (error) {
      console.error('Image validation failed:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to validate image. Please try again.'
      );
    }
  }
}

export const transformService = new TransformService();