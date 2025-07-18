import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';
import { createWriteStream } from 'fs';

// Import the flatlay collections data
const flatlayData = `
const flatlayCollections = [
  {
    id: 'luxury-minimal',
    name: 'Luxury Minimal',
    images: [
      { id: 'lm-1', url: 'https://i.postimg.cc/1tfNMJvk/file-16.png', title: 'Clean Workspace' },
      { id: 'lm-2', url: 'https://i.postimg.cc/6qZ4xTJz/file-19.png', title: 'Minimal Setup' },
      { id: 'lm-3', url: 'https://i.postimg.cc/4NzH8K1x/file-20.png', title: 'Beauty Minimal' },
      { id: 'lm-4', url: 'https://i.postimg.cc/V5ysqFhW/file-21.png', title: 'Planning Flatlay' },
      { id: 'lm-5', url: 'https://i.postimg.cc/yY9cwp7B/file-22.png', title: 'Executive Setup' },
      { id: 'lm-6', url: 'https://i.postimg.cc/bvFZG1q3/file-23.png', title: 'Content Creation' }
    ]
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine', 
    images: [
      { id: 'em-1', url: 'https://i.postimg.cc/02VLGyr8/1.png', title: 'Editorial Magazine 1' },
      { id: 'em-2', url: 'https://i.postimg.cc/xjR7Y1vK/10.png', title: 'Editorial Magazine 2' },
      { id: 'em-3', url: 'https://i.postimg.cc/TwC83VLX/100.png', title: 'Editorial Magazine 3' },
      { id: 'em-4', url: 'https://i.postimg.cc/90nvGcY8/101.png', title: 'Editorial Magazine 4' },
      { id: 'em-5', url: 'https://i.postimg.cc/j25pwDPn/102.png', title: 'Editorial Magazine 5' },
      { id: 'em-6', url: 'https://i.postimg.cc/9F43cqcv/103.png', title: 'Editorial Magazine 6' }
    ]
  }
];
`;

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = createWriteStream(filepath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✅ Downloaded: ${path.basename(filepath)}`);
          resolve();
        });
        
        fileStream.on('error', (err) => {
          reject(err);
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function migrateFlatlayImages() {
  console.log('🚀 Starting flatlay image migration...');
  
  // Parse flatlay collections from the actual file
  const flatlayFile = await fs.readFile('client/src/pages/flatlay-library.tsx', 'utf8');
  
  // Extract URLs using regex
  const urlPattern = /url:\s*['"`](https:\/\/i\.postimg\.cc\/[^'"`]+)['"`]/g;
  const urls = [];
  let match;
  
  while ((match = urlPattern.exec(flatlayFile)) !== null) {
    urls.push(match[1]);
  }
  
  console.log(`📊 Found ${urls.length} flatlay images to migrate`);
  
  // Create directories for each collection
  const collections = ['luxury-minimal', 'editorial-magazine', 'european-luxury', 'wellness-mindset', 'business-professional', 'pink-girly'];
  
  for (const collection of collections) {
    const dir = path.join('public', 'flatlays', collection);
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.error(`❌ Failed to create directory ${dir}:`, err);
      }
    }
  }
  
  // Download images
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    
    // Determine collection based on position
    let collection = 'luxury-minimal';
    if (i >= 19 && i < 100) collection = 'editorial-magazine';
    else if (i >= 100 && i < 150) collection = 'european-luxury';
    else if (i >= 150 && i < 200) collection = 'wellness-mindset';
    else if (i >= 200 && i < 250) collection = 'business-professional';
    else if (i >= 250) collection = 'pink-girly';
    
    // Extract filename from URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const extension = filename.includes('.') ? filename.split('.').pop() : 'png';
    const localFilename = `${collection}-${String(i + 1).padStart(3, '0')}.${extension}`;
    const localPath = path.join('public', 'flatlays', collection, localFilename);
    
    try {
      await downloadImage(url, localPath);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed to download ${url}:`, err.message);
      failCount++;
    }
    
    // Add delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 Migration complete:`);
  console.log(`✅ Successfully downloaded: ${successCount} images`);
  console.log(`❌ Failed downloads: ${failCount} images`);
  
  return { successCount, failCount };
}

// Run migration
migrateFlatlayImages().catch(console.error);