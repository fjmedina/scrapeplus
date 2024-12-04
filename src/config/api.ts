import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  VITE_SUPABASE_URL: z.string().url(),
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
});

const env = envSchema.parse(import.meta.env);

export const config = {
  supabase: {
    url: env.VITE_SUPABASE_URL,
    anonKey: env.VITE_SUPABASE_ANON_KEY,
  },
  social: {
    twitter: {
      apiKey: env.TWITTER_API_KEY,
      baseUrl: 'https://api.twitter.com/2',
    },
    facebook: {
      apiKey: env.FACEBOOK_API_KEY,
      baseUrl: 'https://graph.facebook.com/v18.0',
    },
    linkedin: {
      apiKey: env.LINKEDIN_API_KEY,
      baseUrl: 'https://api.linkedin.com/v2',
    },
    instagram: {
      apiKey: env.INSTAGRAM_API_KEY,
      baseUrl: 'https://graph.instagram.com',
    },
  },
  news: {
    apiKey: env.NEWS_API_KEY,
    baseUrl: 'https://newsapi.org/v2',
  },
  crm: {
    salesforce: {
      clientId: env.SALESFORCE_CLIENT_ID,
      clientSecret: env.SALESFORCE_CLIENT_SECRET,
      baseUrl: 'https://login.salesforce.com',
    },
    hubspot: {
      apiKey: env.HUBSPOT_API_KEY,
      baseUrl: 'https://api.hubapi.com',
    },
  },
} as const;

export type Config = typeof config;