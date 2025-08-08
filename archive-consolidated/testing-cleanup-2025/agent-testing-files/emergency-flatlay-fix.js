#!/usr/bin/env node

// EMERGENCY FLATLAY COLLECTIONS FIX - COMPLETE REBUILD FROM ACTUAL FILESYSTEM
// This script scans the actual file structure and creates collections that match reality

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const flatlayDir = path.join(__dirname, 'public', 'flatlays');

console.log('🚨 EMERGENCY FLATLAY RECONSTRUCTION');
console.log('📁 Scanning actual folders in:', flatlayDir);

// Get all actual directories (ignoring files like UPLOAD_GUIDE.md)
const actualFolders = fs.readdirSync(flatlayDir)
  .filter(item => {
    const fullPath = path.join(flatlayDir, item);
    return fs.statSync(fullPath).isDirectory();
  });

console.log('✅ Found actual folders:', actualFolders);

// Create collections based on ACTUAL folders with proper mapping
const collections = [];

actualFolders.forEach(folder => {
  const folderPath = path.join(flatlayDir, folder);
  const images = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.png'))
    .sort();

  console.log(`📦 Processing ${folder}: ${images.length} images`);

  // Map folder names to proper collection info
  const collectionMap = {
    'luxury-minimal': {
      name: 'Luxury Minimal',
      description: 'Clean white backgrounds, designer accessories, minimal styling',
      aesthetic: 'Clean sophistication with generous white space',
      colors: ['#ffffff', '#f8f9fa', '#e9ecef', '#000000', '#6c757d']
    },
    'editorial-magazine': {
      name: 'Editorial Magazine', 
      description: 'High-fashion editorial styling with dramatic lighting',
      aesthetic: 'Sophisticated editorial with dramatic contrast',
      colors: ['#000000', '#ffffff', '#f5f5f5', '#333333', '#666666']
    },
    'european-luxury': {
      name: 'European Luxury',
      description: 'Sophisticated European lifestyle with luxury accessories',
      aesthetic: 'Refined European elegance with premium materials',
      colors: ['#8B4513', '#D2691E', '#F5F5DC', '#000000', '#DAA520']
    },
    'business-professional': {
      name: 'Business Professional',
      description: 'Professional workspace styling with corporate elegance',
      aesthetic: 'Executive sophistication with organized precision',
      colors: ['#2C3E50', '#34495E', '#ECF0F1', '#95A5A6', '#000000']
    },
    'wellness-mindset': {
      name: 'Wellness Mindset',
      description: 'Mindful wellness lifestyle with natural elements',
      aesthetic: 'Serene wellness with organic textures',
      colors: ['#A8E6CF', '#FFD3A5', '#FD8A8A', '#F8F8FF', '#6A994E']
    },
    'pink-girly': {
      name: 'Pink and Girly',
      description: 'Feminine pink styling with playful elegance',
      aesthetic: 'Soft feminine charm with romantic touches',
      colors: ['#FFB6C1', '#FFC0CB', '#FF69B4', '#FFFFFF', '#F8F8FF']
    }
  };

  const collectionInfo = collectionMap[folder] || {
    name: folder.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: `Curated ${folder} lifestyle collection`,
    aesthetic: `${folder} aesthetic styling`,
    colors: ['#000000', '#ffffff', '#f5f5f5', '#333333', '#666666']
  };

  const collection = {
    id: folder,
    name: collectionInfo.name,
    description: collectionInfo.description,
    aesthetic: collectionInfo.aesthetic,
    backgroundImage: `/flatlays/${folder}/${images[0]}`,
    colors: collectionInfo.colors,
    fonts: ['Times New Roman', 'Helvetica Neue', 'Arial'],
    images: images.map((image, index) => ({
      id: `${folder}-${index + 1}`,
      url: `/flatlays/${folder}/${image}`,
      title: `${collectionInfo.name} ${String(index + 1).padStart(3, '0')}`,
      category: collectionInfo.name,
      description: `${collectionInfo.name} lifestyle flatlay`
    }))
  };

  collections.push(collection);
  console.log(`✅ Created collection "${collectionInfo.name}" with ${images.length} images`);
});

// Generate the TypeScript file
const tsContent = `// EMERGENCY FLATLAY COLLECTIONS REBUILD - ALIGNED WITH ACTUAL FILESYSTEM
// Generated on ${new Date().toISOString()}
// Total collections: ${collections.length}
// Total images: ${collections.reduce((sum, c) => sum + c.images.length, 0)}

export interface FlatlayImage {
  id: string;
  url: string;
  title: string;
  category: string;
  description: string;
}

export interface FlatlayCollection {
  id: string;
  name: string;
  description: string;
  aesthetic: string;
  backgroundImage: string;
  images: FlatlayImage[];
  colors: string[];
  fonts: string[];
}

// WORKING flatlay collections with verified file paths from actual filesystem
export const cleanedFlatlayCollections: FlatlayCollection[] = ${JSON.stringify(collections, null, 2)};

// Collection summary:
${collections.map(c => `// ${c.name}: ${c.images.length} images`).join('\n')}
`;

// Write the new collections file
const outputPath = path.join(__dirname, 'client', 'src', 'data', 'cleaned-flatlay-collections.ts');
fs.writeFileSync(outputPath, tsContent);

console.log('\n🎉 EMERGENCY FLATLAY FIX COMPLETE!');
console.log(`📄 Updated: ${outputPath}`);
console.log(`📊 Total collections: ${collections.length}`);
console.log(`📊 Total images: ${collections.reduce((sum, c) => sum + c.images.length, 0)}`);
console.log('\n📋 Collection Summary:');
collections.forEach(c => {
  console.log(`   ${c.name}: ${c.images.length} images`);
});