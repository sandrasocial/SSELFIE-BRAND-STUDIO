import { z } from 'zod';

// Schema for trend data structure
export const TrendDataSchema = z.object({
  trends: z.object({
    styles: z.array(z.string()).optional(),
    colors: z.array(z.string()).optional(),
    techniques: z.array(z.string()).optional(),
    social_insights: z.array(z.string()).optional()
  }).optional()
});

export type TrendData = z.infer<typeof TrendDataSchema>;

// Schema for hair trend from database
export const HairTrendSchema = z.object({
  id: z.number(),
  week_range: z.string(),
  trend_data: TrendDataSchema,
  summary: z.string(),
  confidence: z.number(),
  created_at: z.string()
});

export type HairTrend = z.infer<typeof HairTrendSchema>;

// Response schema
export const CurrentTrendsResponseSchema = z.object({
  success: z.boolean(),
  trends: z.object({
    styles: z.array(z.string()),
    colors: z.array(z.string()),
    techniques: z.array(z.string()),
    social_insights: z.array(z.string())
  }),
  summary: z.string(),
  confidence: z.number(),
  weekRange: z.string(),
  lastUpdate: z.string()
});

export type CurrentTrendsResponse = z.infer<typeof CurrentTrendsResponseSchema>;