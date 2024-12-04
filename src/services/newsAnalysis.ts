import axios from 'axios';
import { supabase } from '../lib/supabase';

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance: number;
  keywords: string[];
}

export interface NewsAnalysis {
  query: string;
  articles: NewsArticle[];
  summary: {
    totalArticles: number;
    sentiment: {
      positive: number;
      negative: number;
      neutral: number;
    };
    topSources: Array<{ source: string; count: number }>;
    timeline: Array<{ date: string; count: number }>;
  };
  lastUpdated: string;
}

export async function analyzeNews(query: string, userId: string): Promise<NewsAnalysis> {
  try {
    // Check for recent analysis
    const { data: existingAnalysis } = await supabase
      .from('news_analyses')
      .select('*')
      .eq('query', query)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingAnalysis) {
      const analysisAge = Date.now() - new Date(existingAnalysis.created_at).getTime();
      if (analysisAge < 3 * 60 * 60 * 1000) { // Less than 3 hours old
        return existingAnalysis.data;
      }
    }

    // Simulate fetching news data
    // In a real implementation, this would use news APIs like NewsAPI, GDELT, or similar
    const mockArticles: NewsArticle[] = [
      {
        title: `${query} Announces Revolutionary New Product`,
        url: 'https://example.com/news/1',
        source: 'Tech Daily',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        summary: `Leading technology company ${query} has unveiled its latest innovation...`,
        sentiment: 'positive',
        relevance: 0.95,
        keywords: ['technology', 'innovation', 'product launch']
      },
      {
        title: `Market Analysis: ${query}'s Growth Strategy`,
        url: 'https://example.com/news/2',
        source: 'Business Weekly',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        summary: `Industry analysts weigh in on ${query}'s expansion plans...`,
        sentiment: 'neutral',
        relevance: 0.85,
        keywords: ['market analysis', 'growth', 'strategy']
      },
      {
        title: `${query} Faces Supply Chain Challenges`,
        url: 'https://example.com/news/3',
        source: 'Industry News',
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        summary: `Recent global events have impacted ${query}'s supply chain...`,
        sentiment: 'negative',
        relevance: 0.75,
        keywords: ['supply chain', 'challenges', 'global impact']
      }
    ];

    // Calculate summary statistics
    const summary = {
      totalArticles: mockArticles.length,
      sentiment: {
        positive: mockArticles.filter(a => a.sentiment === 'positive').length,
        negative: mockArticles.filter(a => a.sentiment === 'negative').length,
        neutral: mockArticles.filter(a => a.sentiment === 'neutral').length,
      },
      topSources: Object.entries(
        mockArticles.reduce((acc, article) => ({
          ...acc,
          [article.source]: (acc[article.source] || 0) + 1
        }), {} as Record<string, number>)
      )
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      timeline: mockArticles
        .reduce((acc, article) => {
          const date = new Date(article.publishedAt).toISOString().split('T')[0];
          return {
            ...acc,
            [date]: (acc[date] || 0) + 1
          };
        }, {} as Record<string, number>)
        .entries()
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
    };

    const analysis: NewsAnalysis = {
      query,
      articles: mockArticles,
      summary,
      lastUpdated: new Date().toISOString()
    };

    // Store the analysis
    await supabase.from('news_analyses').insert({
      query,
      user_id: userId,
      data: analysis,
    });

    return analysis;
  } catch (error) {
    console.error('News analysis error:', error);
    throw error;
  }
}