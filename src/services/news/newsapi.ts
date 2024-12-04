import { newsApi } from '../api/client';
import type { NewsArticle, NewsMetrics } from '../../types/news';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export class NewsAPIService {
  async getArticles(query: string): Promise<{
    articles: NewsArticle[];
    metrics: NewsMetrics;
  }> {
    const response = await newsApi.get('/everything', {
      params: {
        q: query,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 100,
      }
    });

    const articles = response.data.articles.map((article: any) => {
      const sentimentScore = sentiment.analyze(article.title + ' ' + (article.description || ''));
      
      return {
        title: article.title,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        summary: article.description,
        sentiment: sentimentScore.score > 0 ? 'positive' : 
                  sentimentScore.score < 0 ? 'negative' : 'neutral'
      };
    });

    const metrics: NewsMetrics = {
      totalArticles: articles.length,
      sources: articles.reduce((acc: Record<string, number>, article) => {
        acc[article.source] = (acc[article.source] || 0) + 1;
        return acc;
      }, {}),
      sentiment: articles.reduce((acc: Record<string, number>, article) => {
        acc[article.sentiment] = (acc[article.sentiment] || 0) + 1;
        return acc;
      }, { positive: 0, negative: 0, neutral: 0 })
    };

    return { articles, metrics };
  }
}