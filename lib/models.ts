import { db } from './db';
import { z } from 'zod';

export const websiteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  content: z.record(z.any()).optional(),
  style: z.string().optional(),
  type: z.string().optional(),
  prompt: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Website = z.infer<typeof websiteSchema>;

export const createWebsite = async (data: {
  userId: string;
  title: string;
  description?: string;
  content?: any;
  style?: string;
  type?: string;
  prompt?: string;
  status?: string;
}) => {
  const website = await db`
    INSERT INTO websites (
      user_id,
      title,
      description,
      content,
      style,
      type,
      prompt,
      status
    ) VALUES (
      ${data.userId},
      ${data.title},
      ${data.description || null},
      ${data.content ? JSON.stringify(data.content) : null},
      ${data.style || null},
      ${data.type || null},
      ${data.prompt || null},
      ${data.status || 'draft'}
    )
    RETURNING *
  `;
  return website[0];
};

export const getWebsite = async (id: string) => {
  const website = await db`
    SELECT * FROM websites 
    WHERE id = ${id}
  `;
  return website[0];
};

export const updateWebsite = async (id: string, data: Partial<Website>) => {
  const website = await db`
    UPDATE websites 
    SET 
      title = COALESCE(${data.title}, title),
      description = COALESCE(${data.description}, description),
      content = COALESCE(${data.content ? JSON.stringify(data.content) : null}, content),
      style = COALESCE(${data.style}, style),
      type = COALESCE(${data.type}, type),
      prompt = COALESCE(${data.prompt}, prompt),
      status = COALESCE(${data.status}, status),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return website[0];
};