&lt;template>
  &lt;div class="style-transform-container">
    &lt;div class="transform-header">
      &lt;h2>Style Your Photos&lt;/h2>
      &lt;p class="transform-description">Transform your photos with AI-powered style presets&lt;/p>
    &lt;/div>

    &lt;div class="transform-options">
      &lt;div class="upload-section">
        &lt;input 
          type="file" 
          @change="handleFileUpload" 
          accept="image/*"
          class="file-input"
        >
        &lt;div class="preview" v-if="selectedImage">
          &lt;img :src="selectedImage" alt="Selected photo">
        &lt;/div>
      &lt;/div>

      &lt;div class="style-presets">
        &lt;h3>Choose Your Style&lt;/h3>
        &lt;div class="preset-grid">
          &lt;button 
            v-for="preset in stylePresets" 
            :key="preset.id"
            @click="applyStyle(preset.id)"
            class="preset-button"
          >
            {{ preset.name }}
          &lt;/button>
        &lt;/div>
      &lt;/div>
    &lt;/div>

    &lt;div class="transform-actions">
      &lt;button 
        @click="transformImage" 
        :disabled="!selectedImage || !selectedStyle"
        class="transform-button"
      >
        Transform Photo
      &lt;/button>
    &lt;/div>

    &lt;div class="result-section" v-if="transformedImage">
      &lt;img :src="transformedImage" alt="Transformed photo">
      &lt;button @click="downloadImage" class="download-button">
        Download
      &lt;/button>
    &lt;/div>
  &lt;/div>
&lt;/template>

&lt;script>
import { ref } from 'vue'
import { transformService } from '@/services/transformService'

export default {
  name: 'StyleTransform',
  setup() {
    const selectedImage = ref(null)
    const selectedStyle = ref(null)
    const transformedImage = ref(null)
    
    const stylePresets = [
      { id: 'professional', name: 'Professional' },
      { id: 'creative', name: 'Creative' },
      { id: 'minimal', name: 'Minimal' },
      { id: 'bold', name: 'Bold' },
      { id: 'vintage', name: 'Vintage' }
    ]

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          selectedImage.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const applyStyle = (styleId) => {
      selectedStyle.value = styleId
    }

    const transformImage = async () => {
      try {
        const result = await transformService.transform({
          image: selectedImage.value,
          style: selectedStyle.value
        })
        transformedImage.value = result.transformedImage
      } catch (error) {
        console.error('Transform failed:', error)
        // Add proper error handling here
      }
    }

    const downloadImage = () => {
      if (transformedImage.value) {
        const link = document.createElement('a')
        link.href = transformedImage.value
        link.download = 'transformed-image.jpg'
        link.click()
      }
    }

    return {
      selectedImage,
      selectedStyle,
      transformedImage,
      stylePresets,
      handleFileUpload,
      applyStyle,
      transformImage,
      downloadImage
    }
  }
}
&lt;/script>

&lt;style scoped>
.style-transform-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.transform-header {
  text-align: center;
  margin-bottom: 2rem;
}

.transform-description {
  color: #666;
  margin-top: 0.5rem;
}

.transform-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.upload-section {
  border: 2px dashed #ccc;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.preview img {
  max-width: 100%;
  max-height: 300px;
  margin-top: 1rem;
  border-radius: 4px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.preset-button {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-button:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
}

.transform-actions {
  text-align: center;
  margin: 2rem 0;
}

.transform-button {
  padding: 1rem 2rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
}

.transform-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result-section {
  text-align: center;
}

.result-section img {
  max-width: 100%;
  max-height: 500px;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.download-button {
  padding: 0.8rem 1.5rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
&lt;/style>