import axios from 'axios';
import * as cheerio from 'cheerio';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

export interface WebsiteAnalysisResult {
  url: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    headings: { h1: number; h2: number; h3: number };
    images: { total: number; withAlt: number };
    links: { internal: number; external: number };
  };
  performance: {
    loadTime: number;
    resourceSize: number;
    requests: number;
  };
  accessibility: {
    ariaLabels: number;
    contrastIssues: number;
    formLabels: number;
  };
  timestamp: string;
}

export class WebsiteAnalysisService {
  async analyze(url: string, userId: string): Promise<WebsiteAnalysisResult> {
    try {
      // Check for recent analysis
      const { data: existingAnalysis } = await supabase
        .from('website_analyses')
        .select('metrics')
        .eq('url', url)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingAnalysis) {
        const analysisAge = Date.now() - new Date(existingAnalysis.metrics.timestamp).getTime();
        if (analysisAge < 24 * 60 * 60 * 1000) { // Less than 24 hours old
          return existingAnalysis.metrics as WebsiteAnalysisResult;
        }
      }

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ScrapePlus/1.0;)'
        }
      });

      const startTime = performance.now();
      const $ = cheerio.load(response.data);
      const endTime = performance.now();

      const result: WebsiteAnalysisResult = {
        url,
        seo: {
          title: $('title').text(),
          description: $('meta[name="description"]').attr('content') || '',
          keywords: $('meta[name="keywords"]').attr('content')?.split(',') || [],
          headings: {
            h1: $('h1').length,
            h2: $('h2').length,
            h3: $('h3').length
          },
          images: {
            total: $('img').length,
            withAlt: $('img[alt]').length
          },
          links: {
            internal: $('a[href^="/"], a[href^="' + url + '"]').length,
            external: $('a[href^="http"]').not($('a[href^="' + url + '"]')).length
          }
        },
        performance: {
          loadTime: endTime - startTime,
          resourceSize: response.headers['content-length'] 
            ? parseInt(response.headers['content-length']) 
            : response.data.length,
          requests: 1
        },
        accessibility: {
          ariaLabels: $('[aria-label]').length,
          contrastIssues: 0,
          formLabels: $('label').length
        },
        timestamp: new Date().toISOString()
      };

      // Store analysis in Supabase
      await supabase.from('website_analyses').insert({
        url,
        user_id: userId,
        metrics: result
      });

      return result;
    } catch (error) {
      console.error('Website analysis error:', error);
      throw new Error('Failed to analyze website');
    }
  }
}