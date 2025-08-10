import { WebsiteData, OnboardingData, ColorScheme } from '../types';

const colorScheme: ColorScheme = {
  professional: { primary: '#2c3e50', secondary: '#34495e', accent: '#3498db' },
  elegant: { primary: '#8b5a2b', secondary: '#a67c00', accent: '#d4af37' },
  modern: { primary: '#1a1a1a', secondary: '#333333', accent: '#007bff' },
  luxury: { primary: '#1a1a1a', secondary: '#8b6914', accent: '#daa520' },
  approachable: { primary: '#2c5aa0', secondary: '#1e3a8a', accent: '#3b82f6' },
  creative: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a855f7' }
};

export function generateWebsiteHTML(websiteData: WebsiteData, onboardingData: OnboardingData) {
  const businessName = websiteData.businessName || 'Your Business';
  const businessDescription = websiteData.businessDescription || onboardingData?.brandStory || 'Professional services';
  const targetAudience = websiteData.targetAudience || onboardingData?.targetAudience || 'Our valued clients';
  const keyFeatures = websiteData.keyFeatures || [];
  const brandPersonality = websiteData.brandPersonality || onboardingData?.brandVoice || 'professional';
  
  const colors = colorScheme[brandPersonality as keyof typeof colorScheme] || colorScheme.professional;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Georgia', serif; 
            line-height: 1.6; 
            color: #333;
            background: #fff;
        }
        .hero {
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            color: white;
            padding: 80px 20px;
            text-align: center;
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        .hero h1 {
            font-family: 'Times New Roman', serif;
            font-size: 3.5em;
            margin-bottom: 20px;
            font-weight: normal;
            letter-spacing: 2px;
        }
        .hero p {
            font-size: 1.3em;
            max-width: 600px;
            margin: 0 auto 30px;
            opacity: 0.95;
        }
        .cta-button {
            background: ${colors.accent};
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            font-size: 1.1em;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="hero">
        <h1>${businessName}</h1>
        <p>${businessDescription}</p>
        <a href="#contact" class="cta-button">Get Started</a>
    </div>
</body>
</html>`;