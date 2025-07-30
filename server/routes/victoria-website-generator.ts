import { Express } from 'express';
import { isAuthenticated } from '../replitAuth';

interface WebsiteGenerationRequest {
  businessName: string;
  businessType: string;
  businessDescription: string;
  targetAudience: string;
  keyFeatures: string[];
  brandPersonality: string;
  selectedImages: string[];
  flatlayImages: string[];
}

export function registerVictoriaWebsiteGenerator(app: Express) {
  // Generate complete website using Victoria's AI
  app.post('/api/victoria/generate-website', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const data: WebsiteGenerationRequest = req.body;

      // Generate website structure based on input
      const websiteStructure = generateWebsiteStructure(data);
      
      // Save to database
      const { db } = await import('../db');
      const { websites } = await import('../../shared/schema');
      
      const [newWebsite] = await db
        .insert(websites)
        .values({
          userId,
          title: data.businessName,
          description: data.businessDescription,
          content: JSON.stringify(websiteStructure),
          templateId: 'victoria-editorial',
          isPublished: false,
          slug: data.businessName.toLowerCase().replace(/\s+/g, '-'),
        })
        .returning();

      res.json({
        success: true,
        website: newWebsite,
        previewUrl: `/preview/${newWebsite.slug}`,
      });

    } catch (error) {
      console.error('Victoria website generation error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate website' 
      });
    }
  });

  // Get website preview
  app.get('/preview/:slug', async (req, res) => {
    try {
      const { db } = await import('../db');
      const { websites } = await import('../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const [website] = await db
        .select()
        .from(websites)
        .where(eq(websites.slug, req.params.slug));

      if (!website) {
        return res.status(404).send('Website not found');
      }

      const websiteContent = JSON.parse(website.content || '{}');
      const html = generatePreviewHTML(website.title, websiteContent);
      
      res.send(html);
    } catch (error) {
      console.error('Preview generation error:', error);
      res.status(500).send('Error generating preview');
    }
  });
}

function generateWebsiteStructure(data: WebsiteGenerationRequest) {
  return {
    pages: [
      {
        id: 'home',
        title: 'Home',
        sections: [
          {
            type: 'hero',
            content: {
              title: data.businessName,
              subtitle: `Professional ${data.businessType} Services`,
              description: data.businessDescription,
              image: data.selectedImages[0] || '',
              ctaText: 'Get Started',
              ctaLink: '#contact'
            }
          },
          {
            type: 'about-me',
            content: {
              title: 'About',
              content: data.businessDescription,
              image: data.selectedImages[1] || '',
              personality: data.brandPersonality
            }
          },
          {
            type: 'services',
            content: {
              title: 'Services',
              features: data.keyFeatures,
              images: data.flatlayImages
            }
          },
          {
            type: 'editorial-break',
            content: {
              image: data.selectedImages[2] || '',
              text: `Transforming ${data.targetAudience} through ${data.businessType}`
            }
          },
          {
            type: 'contact',
            content: {
              title: 'Let\'s Work Together',
              description: `Ready to start your journey? Get in touch and let's create something amazing.`,
              image: data.selectedImages[3] || ''
            }
          }
        ]
      }
    ],
    style: {
      typography: 'Times New Roman, serif',
      colorScheme: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#f5f5f5'
      },
      layout: 'editorial-luxury'
    }
  };
}

function generatePreviewHTML(title: string, content: any) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Times New Roman', serif; 
            line-height: 1.6; 
            color: #000;
            background: #fff;
        }
        .hero { 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            text-align: center;
            padding: 2rem;
            background-size: cover;
            background-position: center;
            position: relative;
        }
        .hero::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.4);
            z-index: 1;
        }
        .hero-content { 
            position: relative; 
            z-index: 2; 
            color: white;
            max-width: 800px;
        }
        .hero h1 { 
            font-size: 4rem; 
            margin-bottom: 1rem;
            font-weight: normal;
            letter-spacing: 0.1em;
        }
        .hero h2 { 
            font-size: 1.5rem; 
            margin-bottom: 2rem;
            font-weight: normal;
            opacity: 0.9;
        }
        .hero p { 
            font-size: 1.2rem; 
            margin-bottom: 3rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        .cta-button {
            display: inline-block;
            padding: 15px 40px;
            background: white;
            color: black;
            text-decoration: none;
            font-size: 1.1rem;
            letter-spacing: 0.1em;
            transition: all 0.3s ease;
        }
        .cta-button:hover {
            background: #f5f5f5;
        }
        .section { 
            padding: 5rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        .section h2 { 
            font-size: 3rem; 
            margin-bottom: 2rem;
            text-align: center;
            font-weight: normal;
        }
        .section p { 
            font-size: 1.2rem; 
            text-align: center;
            max-width: 800px;
            margin: 0 auto 3rem;
        }
        .features { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        .feature { 
            text-align: center; 
            padding: 2rem;
        }
        .feature h3 { 
            font-size: 1.5rem; 
            margin-bottom: 1rem;
            font-weight: normal;
        }
        .editorial-break {
            height: 60vh;
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            margin: 5rem 0;
        }
        .editorial-break::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.3);
        }
        .editorial-text {
            position: relative;
            z-index: 2;
            color: white;
            font-size: 2.5rem;
            text-align: center;
            max-width: 800px;
            padding: 2rem;
            font-weight: normal;
            letter-spacing: 0.05em;
        }
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .hero h2 { font-size: 1.2rem; }
            .section h2 { font-size: 2rem; }
            .editorial-text { font-size: 1.8rem; }
        }
    </style>
</head>
<body>
`;

  // Generate sections based on content
  content.pages?.[0]?.sections?.forEach((section: any) => {
    switch (section.type) {
      case 'hero':
        return `
    <section class="hero" style="background-image: url('${section.content.image}')">
        <div class="hero-content">
            <h1>${section.content.title}</h1>
            <h2>${section.content.subtitle}</h2>
            <p>${section.content.description}</p>
            <a href="${section.content.ctaLink}" class="cta-button">${section.content.ctaText}</a>
        </div>
    </section>`;
      
      case 'about-me':
        return `
    <section class="section">
        <h2>${section.content.title}</h2>
        <p>${section.content.content}</p>
    </section>`;
      
      case 'services':
        return `
    <section class="section">
        <h2>${section.content.title}</h2>
        <div class="features">
            ${section.content.features?.map((feature: string) => `
                <div class="feature">
                    <h3>${feature}</h3>
                </div>
            `).join('') || ''}
        </div>
    </section>`;
      
      case 'editorial-break':
        return `
    <section class="editorial-break" style="background-image: url('${section.content.image}')">
        <div class="editorial-text">${section.content.text}</div>
    </section>`;
      
      case 'contact':
        return `
    <section class="section">
        <h2>${section.content.title}</h2>
        <p>${section.content.description}</p>
    </section>`;
    }
  });

  return `
</body>
</html>`;
}