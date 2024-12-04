import { twitterApi } from '../api/client';
import type { SocialMediaMetrics } from '../../types/social';
import { generateBrandVariants } from '../utils/brandVariants';

export class TwitterService {
  async getMetrics(brand: string): Promise<SocialMediaMetrics> {
    const brandVariants = generateBrandVariants(brand);
    const queryString = brandVariants.map(variant => `"${variant}" OR @${variant}`).join(' OR ');

    const recentTweets = await twitterApi.get(`/tweets/search/recent`, {
      params: {
        query: queryString,
        max_results: 100,
        'tweet.fields': 'public_metrics,created_at,context_annotations,entities',
        expansions: 'author_id',
        'user.fields': 'public_metrics'
      }
    });

    // Analizar el contexto y relevancia de cada mención
    const relevantTweets = recentTweets.data?.data?.filter(tweet => {
      // Verificar si la mención es relevante al contexto de la marca
      const isRelevantContext = tweet.context_annotations?.some(
        context => context.domain.name.toLowerCase().includes(brand.toLowerCase())
      );

      // Verificar si la mención es parte de una conversación más amplia
      const isPartOfThread = tweet.referenced_tweets?.some(
        ref => ref.type === 'replied_to' || ref.type === 'quoted'
      );

      return isRelevantContext || isPartOfThread;
    });

    // Calcular métricas de engagement
    const engagement = relevantTweets?.reduce((acc, tweet) => {
      const metrics = tweet.public_metrics;
      return acc + (
        (metrics?.like_count || 0) +
        (metrics?.retweet_count || 0) * 2 + // Retweets tienen más peso
        (metrics?.reply_count || 0) * 3 // Replies tienen aún más peso
      );
    }, 0) || 0;

    // Obtener métricas del perfil oficial si existe
    const userMetrics = await this.getOfficialProfileMetrics(brand);

    return {
      followers: userMetrics.followers,
      mentions: relevantTweets?.length || 0,
      engagement,
      sentiment: await this.analyzeSentiment(relevantTweets),
      mentionTypes: {
        direct: recentTweets.data?.data?.filter(
          tweet => tweet.entities?.mentions?.some(
            mention => mention.username.toLowerCase() === brand.toLowerCase()
          )
        ).length || 0,
        indirect: (relevantTweets?.length || 0) - (recentTweets.data?.data?.filter(
          tweet => tweet.entities?.mentions?.some(
            mention => mention.username.toLowerCase() === brand.toLowerCase()
          )
        ).length || 0)
      },
      topInfluencers: await this.getTopInfluencers(relevantTweets),
      reachEstimate: this.calculateReachEstimate(relevantTweets)
    };
  }

  private async getOfficialProfileMetrics(brand: string) {
    try {
      const response = await twitterApi.get(`/users/by/username/${brand}`, {
        params: {
          'user.fields': 'public_metrics',
        }
      });
      return {
        followers: response.data?.data?.public_metrics?.followers_count || 0
      };
    } catch {
      return { followers: 0 };
    }
  }

  private async analyzeSentiment(tweets: any[]) {
    // Implementar análisis de sentimiento más detallado
    const sentiments = tweets?.map(tweet => {
      // Análisis básico de sentimiento basado en palabras clave
      const text = tweet.text.toLowerCase();
      const positiveWords = ['great', 'awesome', 'love', 'excellent', 'good', 'thanks'];
      const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'hate', 'disappointed'];

      const positiveCount = positiveWords.filter(word => text.includes(word)).length;
      const negativeCount = negativeWords.filter(word => text.includes(word)).length;

      if (positiveCount > negativeCount) return 'positive';
      if (negativeCount > positiveCount) return 'negative';
      return 'neutral';
    }) || [];

    return {
      positive: sentiments.filter(s => s === 'positive').length,
      negative: sentiments.filter(s => s === 'negative').length,
      neutral: sentiments.filter(s => s === 'neutral').length
    };
  }

  private async getTopInfluencers(tweets: any[]) {
    const authors = tweets?.map(tweet => tweet.author_id) || [];
    if (authors.length === 0) return [];

    const uniqueAuthors = [...new Set(authors)];
    const userDetails = await twitterApi.get(`/users`, {
      params: {
        ids: uniqueAuthors.join(','),
        'user.fields': 'public_metrics,verified'
      }
    });

    return userDetails.data?.data
      ?.sort((a: any, b: any) => 
        (b.public_metrics?.followers_count || 0) - (a.public_metrics?.followers_count || 0)
      )
      .slice(0, 5)
      .map((user: any) => ({
        id: user.id,
        username: user.username,
        followers: user.public_metrics?.followers_count || 0,
        verified: user.verified || false
      })) || [];
  }

  private calculateReachEstimate(tweets: any[]) {
    return tweets?.reduce((acc, tweet) => {
      const authorFollowers = tweet.author_metrics?.followers_count || 0;
      const engagement = tweet.public_metrics?.like_count || 0 +
                        (tweet.public_metrics?.retweet_count || 0) * 2;
      
      // Estimación básica: followers + engagement con factor de virality
      return acc + authorFollowers + (engagement * 100);
    }, 0) || 0;
  }
}