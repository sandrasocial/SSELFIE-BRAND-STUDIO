import { z } from 'zod';

export const UserModel = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  createdAt: z.date()
});

export const WebsiteModel = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  domain: z.string().optional(),
  createdAt: z.date()
});

export const ImageModel = z.object({
  id: z.string(),
  userId: z.string(),
  url: z.string(),
  prompt: z.string(),
  createdAt: z.date()
});

export type User = z.infer<typeof UserModel>;
export type Website = z.infer<typeof WebsiteModel>;
export type Image = z.infer<typeof ImageModel>;

export const createWebsite = async (data: {
  userId: string;
  title: string;
  description: string;
  content: any;
  style: string;
  type: string;
  prompt: string;
  status: string;
}) => {
  return {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date()
  };
};