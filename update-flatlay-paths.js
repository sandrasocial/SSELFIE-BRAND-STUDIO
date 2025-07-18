const fs = require('fs').promises;
const path = require('path');

async function updateFlatlayPaths() {
  console.log('🔄 Updating flatlay paths to use local images...');
  
  try {
    // Read the current flatlay collections file
    const flatlayFile = await fs.readFile('client/src/data/flatlay-collections.ts', 'utf8');
    
    // Read the flatlay library file to update as well
    const libraryFile = await fs.readFile('client/src/pages/flatlay-library.tsx', 'utf8');
    
    // Update URLs from postimg.cc to local paths
    let updatedFlatlayFile = flatlayFile;
    let updatedLibraryFile = libraryFile;
    
    // Pattern to match postimg.cc URLs and replace with local paths
    const urlPattern = /url:\s*['"`](https:\/\/i\.postimg\.cc\/[^'"`]+)['"`]/g;
    
    // For flatlay collections file
    updatedFlatlayFile = updatedFlatlayFile.replace(urlPattern, (match, url) => {
      // Extract the filename and determine local path
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Determine collection based on context
      if (match.includes('lm-')) {
        return `url: '/flatlays/luxury-minimal/${filename}'`;
      } else if (match.includes('em-')) {
        return `url: '/flatlays/editorial-magazine/${filename}'`;
      } else if (match.includes('el-')) {
        return `url: '/flatlays/european-luxury/${filename}'`;
      } else if (match.includes('wm-')) {
        return `url: '/flatlays/wellness-mindset/${filename}'`;
      } else if (match.includes('bp-')) {
        return `url: '/flatlays/business-professional/${filename}'`;
      } else if (match.includes('pg-')) {
        return `url: '/flatlays/pink-girly/${filename}'`;
      }
      
      return match; // fallback
    });
    
    // For library file
    updatedLibraryFile = updatedLibraryFile.replace(urlPattern, (match, url) => {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      if (match.includes('lm-')) {
        return `url: '/flatlays/luxury-minimal/${filename}'`;
      } else if (match.includes('em-')) {
        return `url: '/flatlays/editorial-magazine/${filename}'`;
      } else if (match.includes('el-')) {
        return `url: '/flatlays/european-luxury/${filename}'`;
      } else if (match.includes('wm-')) {
        return `url: '/flatlays/wellness-mindset/${filename}'`;
      } else if (match.includes('bp-')) {
        return `url: '/flatlays/business-professional/${filename}'`;
      } else if (match.includes('pg-')) {
        return `url: '/flatlays/pink-girly/${filename}'`;
      }
      
      return match;
    });
    
    // Update backgroundImage references too
    const backgroundPattern = /backgroundImage:\s*['"`](https:\/\/i\.postimg\.cc\/[^'"`]+)['"`]/g;
    
    updatedFlatlayFile = updatedFlatlayFile.replace(backgroundPattern, (match, url) => {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      return `backgroundImage: '/flatlays/luxury-minimal/${filename}'`;
    });
    
    updatedLibraryFile = updatedLibraryFile.replace(backgroundPattern, (match, url) => {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      return `backgroundImage: '/flatlays/luxury-minimal/${filename}'`;
    });
    
    // Write updated files
    await fs.writeFile('client/src/data/flatlay-collections.ts', updatedFlatlayFile);
    await fs.writeFile('client/src/pages/flatlay-library.tsx', updatedLibraryFile);
    
    console.log('✅ Successfully updated flatlay paths to use local images');
    console.log('📁 Images now loading from /public/flatlays/ directories');
    
  } catch (error) {
    console.error('❌ Error updating flatlay paths:', error);
  }
}

// Run the update
updateFlatlayPaths().catch(console.error);