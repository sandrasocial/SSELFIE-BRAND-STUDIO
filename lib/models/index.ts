import { db } from '@/lib/db';

interface WebsiteData {
  userId: string;
  title: string;
  description: string;
  content: any;
  style: string;
  type: string;
  prompt: string;
  status: string;
}

export async function createWebsite(data: WebsiteData) {
  try {
    const website = await db.insert('websites').values({
      userId: data.userId,
      title: data.title,
      description: data.description,
      content: JSON.stringify(data.content),
      style: data.style,
      type: data.type,
      prompt: data.prompt,
      status: data.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning('*');

    return {
      ...website[0],
      content: JSON.parse(website[0].content)
    };
  } catch (error) {
    console.error('Error creating website:', error);
    throw new Error('Failed to create website');
  }
}