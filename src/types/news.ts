export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface NewsMetrics {
  totalArticles: number;
  sources: Record<string, number>;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface NewsSource {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  language: string;
  country: string;
}