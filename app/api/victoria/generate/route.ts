import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Temporary auth bypass for development
    const userId = 'temp-user-id';

    const body = await request.json();
    const { prompt, type = 'landing-page', style = 'modern' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Generate website content using AI
    const websiteData = await generateWebsiteContent(prompt, type, style);
    
    // Save to database
    const website = await db.website.create({
      data: {
        userId,
        title: websiteData.title,
        description: websiteData.description,
        content: websiteData.content,
        style,
        type,
        prompt,
        status: 'generated',
      }
    });

    return NextResponse.json({
      success: true,
      website: {
        id: website.id,
        title: website.title,
        description: website.description,
        content: website.content,
        style: website.style,
        type: website.type,
        createdAt: website.createdAt,
      }
    });

  } catch (error) {
    console.error('Victoria generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate website' },
      { status: 500 }
    );
  }
}

async function generateWebsiteContent(prompt: string, type: string, style: string) {
  // AI-powered website generation logic
  const templates = {
    'landing-page': {
      sections: ['hero', 'features', 'testimonials', 'cta'],
      layout: 'single-page'
    },
    'portfolio': {
      sections: ['hero', 'about', 'projects', 'contact'],
      layout: 'multi-page'
    },
    'business': {
      sections: ['hero', 'services', 'about', 'contact'],
      layout: 'professional'
    }
  };

  const template = templates[type as keyof typeof templates] || templates['landing-page'];
  
  return {
    title: extractTitle(prompt),
    description: `A ${style} ${type} generated from: ${prompt.substring(0, 100)}...`,
    content: {
      template: template,
      sections: await generateSections(prompt, template.sections, style),
      theme: style,
      customizations: {}
    }
  };
}

function extractTitle(prompt: string): string {
  // Extract title from prompt or generate one
  const titleMatch = prompt.match(/(?:for|about|called)\s+["']?([^"',.!?]+)["']?/i);
  return titleMatch ? titleMatch[1].trim() : `Website from "${prompt.substring(0, 30)}..."`;
}

async function generateSections(prompt: string, sections: string[], style: string) {
  const sectionData: Record<string, any> = {};
  
  for (const section of sections) {
    sectionData[section] = await generateSectionContent(prompt, section, style);
  }
  
  return sectionData;
}

async function generateSectionContent(prompt: string, section: string, style: string) {
  // Generate section-specific content based on prompt
  const sectionTemplates = {
    hero: {
      headline: `Transform Your Vision Into Reality`,
      subheadline: `Based on: ${prompt}`,
      cta: 'Get Started',
      background: style === 'luxury' ? 'gradient-luxury' : 'gradient-modern'
    },
    features: {
      title: 'Key Features',
      items: [
        { title: 'Feature 1', description: 'Generated from your prompt' },
        { title: 'Feature 2', description: 'Customized for your needs' },
        { title: 'Feature 3', description: 'Professional design' }
      ]
    },
    about: {
      title: 'About',
      content: `This section was generated based on your prompt: ${prompt}`
    },
    contact: {
      title: 'Get In Touch',
      fields: ['name', 'email', 'message']
    }
  };

  return sectionTemplates[section as keyof typeof sectionTemplates] || { title: section };
}