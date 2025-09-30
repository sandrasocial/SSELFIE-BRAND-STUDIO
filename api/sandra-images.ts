import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 25
} as const;

// Map of image names to URLs from SandraImages library
const sandraImageMap: Record<string, string> = {
  // Hero images frequently used
  'hero-editorial.jpg': "https://i.postimg.cc/rwTG02cZ/out-1-23.png", // homepage hero
  'brand-essence.jpg': "https://i.postimg.cc/bNF14sGc/out-1-4.png", // about hero
  'pricing-hero.jpg': "https://i.postimg.cc/nrKdm7Vj/out-2-4.webp", // pricing hero
  'method-hero.jpg': "https://i.postimg.cc/HkNwfjh8/out-2-14.jpg", // method hero
  'contact-hero.jpg': "https://i.postimg.cc/HsrPfn0G/out-2-26.png", // contact hero
  'ai-hero.jpg': "https://i.postimg.cc/4NG0n2wN/out-1-12.png", // AI page hero
  'dashboard-hero.jpg': "https://i.postimg.cc/htszBH6F/file-47.png", // dashboard hero
  
  // Editorial shots
  'laptop1.jpg': "https://i.postimg.cc/brm1yv3n/out-0_(3).png", // working shot
  'laptop2.jpg': "https://i.postimg.cc/3wFLgvhG/out-1-19.png", // engaged with work
  'phone1.jpg': "https://i.postimg.cc/9Q0P8yJj/story_2.jpg", // creating content
  'phone2.jpg': "https://i.postimg.cc/Vk6M70XM/out-1_(20).jpg", // taking selfie
  'thinking.jpg': "https://i.postimg.cc/6QPS39bD/out-1_(13).png", // contemplative
  'laughing.jpg': "https://i.postimg.cc/7hcLgCB4/out-1-25.webp", // joy moment
  'mirror.jpg': "https://i.postimg.cc/nrKdm7Vj/out-2_(4).webp", // transformation
  'ai-success.jpg': "https://i.postimg.cc/76vVdbWY/out-0-7.png", // AI success
  
  // Journey/transformation
  'rock-bottom.jpg': "https://i.postimg.cc/BQMcBm5g/story1.jpg", // honest before
  'building.jpg': "https://i.postimg.cc/0j0cpxZ5/out-0-10.png", // work phase
  'success.jpg': "https://i.postimg.cc/76vVdbWY/out-0-7.png", // achievement
  'today.jpg': "https://i.postimg.cc/76vVdbWY/out-0-7.png", // current Sandra
  
  // Flatlays
  'workspace1.jpg': "https://i.postimg.cc/VkVddttn/67.png",
  'workspace2.jpg': "https://i.postimg.cc/kMRbbY68/file-44.png",
  'beauty.jpg': "https://i.postimg.cc/PfCmMrcC/file-33.png",
  'planning.jpg': "https://i.postimg.cc/kXrtFNKH/file-45.png",
  'luxury.jpg': "https://i.postimg.cc/KcqNJk7s/30.png"
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extract image name from URL path
    const urlPath = req.url || '';
    const imageName = urlPath.split('/api/sandra-images/')[1];
    
    if (!imageName) {
      return res.status(400).json({ 
        error: 'Missing image name',
        available: Object.keys(sandraImageMap)
      });
    }
    
    console.log(`🖼️ Sandra images request: ${imageName}`);
    
    // Check if image exists in map
    const imageUrl = sandraImageMap[imageName];
    if (!imageUrl) {
      return res.status(404).json({ 
        error: `Image not found: ${imageName}`,
        available: Object.keys(sandraImageMap)
      });
    }
    
    // Fetch the image from external URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`❌ Failed to fetch image from ${imageUrl}: ${response.status}`);
      return res.status(502).json({ 
        error: `Failed to fetch image: ${response.statusText}`,
        sourceUrl: imageUrl
      });
    }
    
    // Get image data and content type
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Send the image
    res.status(200).send(Buffer.from(imageBuffer));
    
    console.log(`✅ Served Sandra image: ${imageName} (${Math.round(imageBuffer.byteLength / 1024)}KB)`);
    
  } catch (error) {
    console.error('❌ Sandra images API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}