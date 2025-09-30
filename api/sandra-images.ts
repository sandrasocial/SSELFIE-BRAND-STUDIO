import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 60
} as const;

// Map of image names to URLs from SandraImages library
const sandraImageMap: Record<string, string> = {
  // Hero images frequently used
  'hero-editorial.jpg': "https://i.postimg.cc/pdwJdNV3/out-0-6.png", // homepage hero
  'brand-essence.jpg': "https://i.postimg.cc/bNF14sGc/out-1_(4).png", // about hero
  'pricing-hero.jpg': "https://i.postimg.cc/wMpwy3Xb/out-0-9.png", // pricing hero
  'method-hero.jpg': "https://i.postimg.cc/VLK9C0Lq/proxy-image-2.png", // method hero
  'contact-hero.jpg': "https://i.postimg.cc/KYnsXZPW/out-0-30.png", // contact hero
  'ai-hero.jpg': "https://i.postimg.cc/sf9430k0/out-2.png", // AI page hero
  'dashboard-hero.jpg': "https://i.postimg.cc/28kFy7mj/proxy-image-1.png", // dashboard hero
  
  // Editorial shots
  'laptop1.jpg': "https://i.postimg.cc/MTTwZqXz/out-0-23.png", // working shot
  'laptop2.jpg': "https://i.postimg.cc/9MnhrKq3/out-0-25.png", // engaged with work
  'phone1.jpg': "https://i.postimg.cc/ZKD3mwcb/proxy-image_(3).png", // creating content
  'phone2.jpg': "https://i.postimg.cc/0ymXy4Hc/out-1-20.png", // taking selfie
  'thinking.jpg': "https://i.postimg.cc/6QPS39bD/out-1_(13).png", // contemplative (keeping existing)
  'laughing.jpg': "https://i.postimg.cc/jqDWZrcz/out-1-11.png", // joy moment
  'mirror.jpg': "https://i.postimg.cc/J0qNKG3W/out-0.webp", // transformation
  'ai-success.jpg': "https://i.postimg.cc/28kFy7mj/proxy-image-1.png", // AI success
  
  // Journey/transformation
  'rock-bottom.jpg': "https://i.postimg.cc/KYnsXZPW/out-0-30.png", // honest before
  'building.jpg': "https://i.postimg.cc/sf9430k0/out-2.png", // work phase
  'success.jpg': "https://i.postimg.cc/VLK9C0Lq/proxy-image-2.png", // achievement
  'today.jpg': "https://i.postimg.cc/28kFy7mj/proxy-image-1.png", // current Sandra
  
  // Flatlays
  'workspace1.jpg': "https://i.postimg.cc/HLCysdHg/175.png",
  'workspace2.jpg': "https://i.postimg.cc/yYBXnm2K/33.png",
  'beauty.jpg': "https://i.postimg.cc/cCtNYhQF/out-1-4.png",
  'planning.jpg': "https://i.postimg.cc/MGzDTybt/2.png",
  'luxury.jpg': "https://i.postimg.cc/25CmJ4fJ/out-0-15.png"
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
    
    // Fetch the image from external URL with extended timeout
    // Use dynamic import for node-fetch to get proper timeout control
    let response: Response;
    let finalImageUrl = imageUrl; // Declare in broader scope
    
    try {
      // TEMPORARY FIX: Check if images are migrated to S3/CDN first
      
      // Try S3/CDN URL first (if migrated)
      if (imageUrl.includes('postimg.cc')) {
        // Check if we have S3 equivalent
        const imagePath = imageName.replace(/\.(jpg|png|webp|jpeg)$/i, '');
        const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/sandra-images/${imagePath}`;
        
        try {
          const s3Response = await fetch(s3Url, { 
            method: 'HEAD',
            signal: AbortSignal.timeout(5000) // Quick check
          });
          if (s3Response.ok) {
            console.log(`✅ Using S3 image: ${s3Url}`);
            finalImageUrl = s3Url;
          }
        } catch {
          console.log(`⚠️ S3 image not available, using original: ${imageUrl}`);
        }
      }
      
      // Fetch with extended timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`⏱️ Image fetch timeout triggered for ${finalImageUrl}`);
        controller.abort();
      }, 45000); // 45 second timeout (within 60s function limit)
      
      response = await fetch(finalImageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SSELFIE-Image-Proxy/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`❌ Failed to fetch image from ${imageUrl}: ${response.status}`);
        return res.status(502).json({ 
          error: `Failed to fetch image: ${response.statusText}`,
          sourceUrl: imageUrl
        });
      }
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('TimeoutError') || 
                       errorMessage.includes('AbortError');
      
      console.error(`❌ Image fetch failed for ${finalImageUrl || imageUrl}:`, fetchError);
      
      // STABILIZATION: Return 404 instead of crashing to prevent deployment instability
      return res.status(404).json({ 
        error: 'Image temporarily unavailable',
        message: 'The requested image could not be loaded at this time',
        imageName: imageName,
        available: Object.keys(sandraImageMap)
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