import { facebookApi } from '../api/client';
import type { SocialMediaMetrics } from '../../types/social';
import { generateBrandVariants } from '../utils/brandVariants';

export class FacebookService {
  async getMetrics(brand: string): Promise<SocialMediaMetrics> {
    const brandVariants = generateBrandVariants(brand);
    
    // Búsqueda de menciones en posts públicos
    const searchResults = await Promise.all(
      brandVariants.map(variant => 
        facebookApi.get('/search', {
          params: {
            q: variant,
            type: 'post',
            fields: 'id,message,created_time,reactions.summary(total_count),comments.summary(total_count),shares',
            access_token: process.env.FACEBOOK_API_KEY
          }
        })
      )
    );

    const posts = searchResults.flatMap(result => result.data.data);
    
    // Filtrar menciones relevantes
    const relevantPosts = posts.filter(post => {
      const message = post.message?.toLowerCase() || '';
      return brandVariants.some(variant => {
        const variantLower = variant.toLowerCase();
        // Verificar si es una mención directa o parte de una conversación relevante
        return message.includes(variantLower) ||
               post.comments?.data?.some((comment: any) => 
                 comment.message?.toLowerCase().includes(variantLower)
               );
      });
    });

    // Obtener métricas de la página oficial si existe
    const pageMetrics = await this.getPageMetrics(brand);

    // Calcular engagement
    const engagement = relevantPosts.reduce((acc, post) => {
      return acc + (
        (post.reactions?.summary?.total_count || 0) +
        (post.comments?.summary?.total_count || 0) * 2 + // Comentarios tienen más peso
        (post.shares?.count || 0) * 3 // Compartidos tienen aún más peso
      );
    }, 0);

    // Analizar sentimiento
    const sentiment = await this.analyzeSentiment(relevantPosts);

    // Clasificar menciones
    const mentionTypes = this.classifyMentions(relevantPosts, brand);

    // Identificar influencers
    const topInfluencers = await this.getTopInfluencers(relevantPosts);

    return {
      followers: pageMetrics.followers,
      mentions: relevantPosts.length,
      engagement,
      sentiment,
      mentionTypes,
      topInfluencers,
      reachEstimate: this.calculateReachEstimate(relevantPosts, topInfluencers)
    };
  }

  private async getPageMetrics(brand: string) {
    try {
      const response = await facebookApi.get(`/${brand}`, {
        params: {
          fields: 'fan_count,talking_about_count',
          access_token: process.env.FACEBOOK_API_KEY
        }
      });
      return {
        followers: response.data.fan_count || 0,
        engagement: response.data.talking_about_count || 0
      };
    } catch {
      return { followers: 0, engagement: 0 };
    }
  }

  private async analyzeSentiment(posts: any[]) {
    const sentiments = posts.map(post => {
      const text = post.message?.toLowerCase() || '';
      const positiveWords = ['excelente', 'genial', 'bueno', 'gracias', 'recomiendo', 'me gusta'];
      const negativeWords = ['malo', 'pésimo', 'terrible', 'horrible', 'decepción', 'no recomiendo'];

      const positiveCount = positiveWords.filter(word => text.includes(word)).length;
      const negativeCount = negativeWords.filter(word => text.includes(word)).length;

      // Considerar también las reacciones
      const reactions = post.reactions?.summary?.total_count || 0;
      const positiveReactions = (post.reactions?.data || [])
        .filter((r: any) => ['LIKE', 'LOVE', 'WOW'].includes(r.type)).length;
      const negativeReactions = (post.reactions?.data || [])
        .filter((r: any) => ['ANGRY', 'SAD'].includes(r.type)).length;

      const totalPositive = positiveCount + positiveReactions;
      const totalNegative = negativeCount + negativeReactions;

      if (totalPositive > totalNegative) return 'positive';
      if (totalNegative > totalPositive) return 'negative';
      return 'neutral';
    });

    return {
      positive: sentiments.filter(s => s === 'positive').length,
      negative: sentiments.filter(s => s === 'negative').length,
      neutral: sentiments.filter(s => s === 'neutral').length
    };
  }

  private classifyMentions(posts: any[], brand: string) {
    const directMentions = posts.filter(post => {
      const message = post.message?.toLowerCase() || '';
      return message.includes(`@${brand.toLowerCase()}`) ||
             message.includes(`#${brand.toLowerCase()}`);
    }).length;

    return {
      direct: directMentions,
      indirect: posts.length - directMentions
    };
  }

  private async getTopInfluencers(posts: any[]) {
    const authors = [...new Set(posts.map(post => post.from?.id))];
    
    const influencers = await Promise.all(
      authors.map(async (authorId) => {
        try {
          const response = await facebookApi.get(`/${authorId}`, {
            params: {
              fields: 'id,name,fan_count,verified',
              access_token: process.env.FACEBOOK_API_KEY
            }
          });
          return {
            id: response.data.id,
            username: response.data.name,
            followers: response.data.fan_count || 0,
            verified: response.data.verified || false
          };
        } catch {
          return null;
        }
      })
    );

    return influencers
      .filter(Boolean)
      .sort((a, b) => b!.followers - a!.followers)
      .slice(0, 5);
  }

  private calculateReachEstimate(posts: any[], influencers: any[]) {
    const baseReach = posts.reduce((acc, post) => {
      const reactions = post.reactions?.summary?.total_count || 0;
      const comments = post.comments?.summary?.total_count || 0;
      const shares = post.shares?.count || 0;
      
      // Estimación de alcance basada en engagement
      return acc + (reactions + comments * 2 + shares * 5) * 100;
    }, 0);

    // Añadir alcance de influencers
    const influencerReach = influencers.reduce((acc, inf) => 
      acc + (inf?.followers || 0), 0);

    return baseReach + influencerReach;
  }
}