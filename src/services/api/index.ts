import { WebsiteAnalysisService } from './websiteAnalysis';
import { SocialMediaService } from './socialMedia';
import { NewsService } from './news';

export const websiteAnalysisService = new WebsiteAnalysisService();
export const socialMediaService = new SocialMediaService();
export const newsService = new NewsService();

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5173',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
};

export type { 
  WebsiteAnalysisResult 
} from './websiteAnalysis';

export type { 
  SocialMediaAnalysis 
} from './socialMedia';

export type { 
  NewsAnalysis 
} from './news';