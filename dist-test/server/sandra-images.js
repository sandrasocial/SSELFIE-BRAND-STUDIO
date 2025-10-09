export const config = {
    runtime: 'nodejs',
    maxDuration: 15 // Reduced from 60s to prevent long-running timeouts
};
// Map of image names to URLs from SandraImages library
const sandraImageMap = {
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
export default async function handler(req, res) {
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
        // 💡 FIX 1: Explicitly check for known failing images and redirect to real hero images
        const knownFailingImages = {
            'brand-essence.jpg': '/hero-about.png',
            'hero-editorial.jpg': '/hero-homepage.png',
            'pricing-hero.jpg': '/hero-luxury.png',
            'method-hero.jpg': '/hero-dashboard.png',
            'contact-hero.jpg': '/hero-about.png',
            'ai-hero.jpg': '/hero-luxury.png',
            'dashboard-hero.jpg': '/hero-dashboard.png'
        };
        // Check if this is a known failing image and redirect immediately
        if (knownFailingImages[imageName]) {
            const fallbackUrl = knownFailingImages[imageName];
            return res.status(307)
                .setHeader('Location', fallbackUrl)
                .setHeader('Cache-Control', 'public, max-age=300') // Cache redirect for 5 minutes
                .end();
        }
        // Check if image exists in map
        const imageUrl = sandraImageMap[imageName];
        if (!imageUrl) {
            return res.status(404).json({
                error: `Image not found: ${imageName}`,
                available: Object.keys(sandraImageMap)
            });
        }
        // 🛑 CRITICAL FIX: Remove external image fetching entirely for stability
        // All external images (postimg.cc) are now redirected to real local hero images
        if (imageUrl.includes('postimg.cc') || imageUrl.includes('i.postimg')) {
            const fallbackUrl = '/hero-homepage.png'; // Default to main hero image
            return res.status(307)
                .setHeader('Location', fallbackUrl)
                .setHeader('Cache-Control', 'public, max-age=300') // Cache redirect for 5 minutes
                .json({
                message: 'Redirected to stable local hero image to prevent timeouts',
                originalImage: imageName,
                originalUrl: imageUrl,
                fallbackUrl: fallbackUrl
            });
        }
        // For any remaining images that are not external (should be rare)
        // Redirect to main hero image as fallback
        const defaultFallbackUrl = '/hero-homepage.png';
        return res.status(307)
            .setHeader('Location', defaultFallbackUrl)
            .setHeader('Cache-Control', 'public, max-age=300')
            .end();
    }
    catch (error) {
        console.error('❌ Sandra images API error:', error);
        // Even on error, redirect to main hero image instead of returning error
        const errorFallbackUrl = '/hero-homepage.png';
        return res.status(307)
            .setHeader('Location', errorFallbackUrl)
            .setHeader('Cache-Control', 'no-cache')
            .end();
    }
}
