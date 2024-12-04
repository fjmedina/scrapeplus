import axios from 'axios';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

export interface NewsAnalysis {
  query: string;
  articles: Array<{
    title: string;
    url: string;
    source: string;
    publishedAt: string;
    summary: string;
  }>;
  metrics: {
    totalArticles: number;
    sources: { [key: string]: number };
    sentiment: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };
  timestamp: string;
}

export class NewsService {
  async analyze(query: string, userId: string): Promise<NewsAnalysis> {
    try {
      // Check for recent analysis
      const { data: existingAnalysis } = await supabase
        .from('news_analyses')
        .select('data')
        .eq('query', query)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingAnalysis) {
        const analysisAge = Date.now() - new Date(existingAnalysis.data.timestamp).getTime();
        if (analysisAge < 3 * 60 * 60 * 1000) { // Less than 3 hours old
          return existingAnalysis.data as NewsAnalysis;
        }
      }

      if (!process.env.NEWS_API_KEY) {
        throw new Error('News API key not configured');
      }

      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`
      );

      const articles = response.data.articles.map((article: any) => ({
        title: article.title,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        summary: article.description
      }));

      const analysis: NewsAnalysis = {
        query,
        articles,
        metrics: {
          totalArticles: articles.length,
          sources: articles.reduce((acc: { [key: string]: number }, article) => {
            acc[article.source] = (acc[article.source] || 0) + 1;
            return acc;
          }, {}),
          sentiment: {
            positive: 0,
            negative: 0,
            neutral: articles.length
          }
        },
        timestamp: new Date().toISOString()
      };

      // Store analysis in Supabase
      await supabase.from('news_analyses').insert({
        query,
        user_id: userId,
        data: analysis
      });

      return analysis;
    } catch (error) {
      console.error('News analysis error:', error);
      throw new Error('Failed to analyze news');
    }
  }
}