import axios from 'axios';
import * as cheerio from 'cheerio';
import { supabase } from '../lib/supabase';

export interface WebsiteMetrics {
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
  lastModified?: string;
  title?: string;
  description?: string;
  headers?: {
    h1: number;
    h2: number;
    h3: number;
  };
  images: {
    total: number;
    withAlt: number;
  };
  links: {
    internal: number;
    external: number;
  };
}

export interface AnalysisResult {
  url: string;
  status: 'idle' | 'analyzing' | 'completed' | 'error';
  metrics?: WebsiteMetrics;
  lastUpdated: string;
  errors?: string[];
}

export async function analyzeWebsite(url: string, userId: string): Promise<AnalysisResult> {
  try {
    // First, check if we have a recent analysis (less than 24 hours old)
    const { data: existingAnalysis } = await supabase
      .from('website_analyses')
      .select('*')
      .eq('url', url)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingAnalysis) {
      const analysisAge = Date.now() - new Date(existingAnalysis.created_at).getTime();
      if (analysisAge < 24 * 60 * 60 * 1000) { // Less than 24 hours old
        return {
          url,
          status: 'completed',
          metrics: existingAnalysis.metrics,
          lastUpdated: existingAnalysis.created_at,
        };
      }
    }

    // Fetch the website content
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Extract basic metrics
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const lastModified = response.headers['last-modified'];

    // Count headers
    const headers = {
      h1: $('h1').length,
      h2: $('h2').length,
      h3: $('h3').length,
    };

    // Analyze images
    const images = {
      total: $('img').length,
      withAlt: $('img[alt]').length,
    };

    // Analyze links
    const currentDomain = new URL(url).hostname;
    const links = {
      internal: $(`a[href^="/"], a[href*="${currentDomain}"]`).length,
      external: $('a').length - $(`a[href^="/"], a[href*="${currentDomain}"]`).length,
    };

    // Calculate scores
    const calculateScore = (value: number, max: number) => Math.min(100, Math.round((value / max) * 100));

    const metrics: WebsiteMetrics = {
      performance: calculateScore(response.headers['server-timing'] ? 90 : 70, 100),
      seo: calculateScore(
        (description ? 20 : 0) +
        (headers.h1 === 1 ? 20 : 0) +
        (images.withAlt / Math.max(1, images.total) * 30) +
        (links.internal > 0 ? 30 : 0),
        100
      ),
      accessibility: calculateScore(
        (images.withAlt / Math.max(1, images.total) * 50) +
        (headers.h1 === 1 ? 25 : 0) +
        ($('html[lang]').length ? 25 : 0),
        100
      ),
      bestPractices: calculateScore(
        ($('meta[charset]').length ? 25 : 0) +
        ($('meta[viewport]').length ? 25 : 0) +
        ($('html[lang]').length ? 25 : 0) +
        (response.headers['x-content-type-options'] ? 25 : 0),
        100
      ),
      lastModified,
      title,
      description,
      headers,
      images,
      links,
    };

    const result: AnalysisResult = {
      url,
      status: 'completed',
      metrics,
      lastUpdated: new Date().toISOString(),
    };

    // Store the analysis in Supabase
    await supabase.from('website_analyses').insert({
      url,
      user_id: userId,
      metrics,
    });

    return result;
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      url,
      status: 'error',
      errors: [error instanceof Error ? error.message : 'An unknown error occurred'],
      lastUpdated: new Date().toISOString(),
    };
  }
}