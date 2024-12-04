import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const serverConfigSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Supabase
  VITE_SUPABASE_URL: z.string(),
  VITE_SUPABASE_ANON_KEY: z.string(),

  // Social Media APIs
  TWITTER_API_KEY: z.string().optional(),
  FACEBOOK_API_KEY: z.string().optional(),
  LINKEDIN_API_KEY: z.string().optional(),
  INSTAGRAM_API_KEY: z.string().optional(),

  // News API
  NEWS_API_KEY: z.string().optional(),

  // CRM
  SALESFORCE_CLIENT_ID: z.string().optional(),
  SALESFORCE_CLIENT_SECRET: z.string().optional(),
  HUBSPOT_API_KEY: z.string().optional(),

  // Webhook Secrets
  SALESFORCE_WEBHOOK_SECRET: z.string().optional(),
  HUBSPOT_WEBHOOK_SECRET: z.string().optional(),
});

export const serverConfig = serverConfigSchema.parse(process.env);