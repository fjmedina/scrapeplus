import { z } from 'zod';

export const websiteAnalysisSchema = z.object({
  url: z.string().url(),
  userId: z.string().uuid()
});

export const socialMediaAnalysisSchema = z.object({
  brand: z.string().min(1),
  userId: z.string().uuid()
});

export const newsAnalysisSchema = z.object({
  query: z.string().min(1),
  userId: z.string().uuid()
});