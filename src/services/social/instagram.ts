import { instagramApi } from '../api/client';
import type { SocialMediaMetrics } from '../../types/social';
import { generateBrandVariants } from '../utils/brandVariants';

export class InstagramService {
  async getMetrics(brand: string): Promise<SocialMediaMetrics> {
    const brandVariants = generateBrandVariants(brand);
    
    // Búsqueda de menciones en posts y stories
    const searchResults = await Promise.all(
      brandVariants.map(variant =>
        instagramApi.get('/media/recent', {
          params: {
            q: variant,
            fields: 'id,caption,media_type,media_url,timestamp,like_count,comments_count,permalink'
          }
        })
      )
    );

    const posts = searchResults.flatMap(result => result.data.data);
    
    // Filtrar menciones relevantes
    const relevantPosts = posts.filter(post => {
      const caption = post.caption?.toLowerCase() || '';
      const comments = post.comments?.data || [];
      
      return brandVariants.some(variant => {
        const variantLower = variant.toLowerCase();
        // Verificar menciones en caption y comentarios
        return caption.includes(variantLower) ||
               comments.some((comment: any) => 
                 comment.text?.toLowerCase().includes(variantLower)
               );
      });
    });

    // Obtener métricas del perfil oficial
    const profileMetrics = await this.getProfileMetrics(brand);

    // Calcular engagement
    const engagement = relevantPosts.reduce((acc, post) => {
      return acc + (
        (post.like_count || 0) +
        (post.comments_count || 0) * 2 + // Comentarios tienen más peso
        (post.media_type === 'VIDEO' ? post.video_view_count * 0.5 || 0 : 0) // Vistas de video
      );
    }, 0);

    // Analizar sentimiento
    const sentiment = await this.analyzeSentiment(relevantPosts);

    // Clasificar menciones
    const mentionTypes = this.classifyMentions(relevantPosts, brand);

    // Identificar influencers
    const topInfluencers = await this.getTopInfluencers(relevantPosts);

    return {
      followers: profileMetrics.followers,
      mentions: relevantPosts.length,
      engagement,
      sentiment,
      mentionTypes,
      topInfluencers,
      reachEstimate: this.calculateReachEstimate(relevantPosts, topInfluencers)
    };
  }

  private async getProfileMetrics(brand: string) {
    try {
      const response = await instagramApi.get(`/${brand}`, {
        params: {
          fields: 'business_discovery.username',
          metric: 'followers_count,media_count'
        }
      });
      return {
        followers: response.data.business_discovery.followers_count || 0,
        posts: response.data.business_discovery.media_count || 0
      };
    } catch {
      return { followers: 0, posts: 0 };
    }
  }

  private async analyzeSentiment(posts: any[]) {
    const sentiments = posts.map(post => {
      const text = post.caption?.toLowerCase() || '';
      
      // Palabras clave específicas de Instagram
      const positiveWords = ['amazing', 'love', 'beautiful', 'perfect', 'goals', 'inspo'];
      const negativeWords = ['bad', 'hate', 'terrible', 'worst', 'disappointed', 'avoid'];

      const positiveCount = positiveWords.filter(word => text.includes(word)).length;
      const negativeCount = negativeWords.filter(word => text.includes(word)).length;

      // Analizar emojis comunes
      const positiveEmojis = text.match(/[😊😍🥰❤️👍💯]/g)?.length || 0;
      const negativeEmojis = text.match(/[😠😡👎💔😤]/g)?.length || 0;

      // Considerar engagement
      const engagementScore = (post.like_count || 0) / (post.comments_count || 1);
      const engagementSentiment = engagementScore > 50 ? 1 : 
                                 engagementScore < 10 ? -1 : 0;

      const totalPositive = positiveCount + positiveEmojis + (engagementSentiment > 0 ? 1 : 0);
      const totalNegative = negativeCount + negativeEmojis + (engagementSentiment < 0 ? 1 : 0);

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
      const caption = post.caption?.toLowerCase() || '';
      return caption.includes(`@${brand.toLowerCase()}`) ||
             caption.includes(`#${brand.toLowerCase()}`);
    }).length;

    return {
      direct: directMentions,
      indirect: posts.length - directMentions
    };
  }

  private async getTopInfluencers(posts: any[]) {
    const authors = [...new Set(posts.map(post => post.owner))];
    
    const influencers = await Promise.all(
      authors.map(async (authorId) => {
        try {
          const response = await instagramApi.get(`/${authorId}`, {
            params: {
              fields: 'id,username,followers_count,is_verified,media_count'
            }
          });
          return {
            id: response.data.id,
            username: response.data.username,
            followers: response.data.followers_count || 0,
            verified: response.data.is_verified || false,
            engagement: await this.calculateInfluencerEngagement(authorId)
          };
        } catch {
          return null;
        }
      })
    );

    return influencers
      .filter(Boolean)
      .sort((a, b) => (b!.followers * b!.engagement) - (a!.followers * a!.engagement))
      .slice(0, 5);
  }

  private async calculateInfluencerEngagement(authorId: string) {
    try {
      const response = await instagramApi.get(`/${authorId}/media`, {
        params: {
          fields: 'like_count,comments_count',
          limit: 10
        }
      });

      const posts = response.data.data || [];
      if (posts.length === 0) return 0;

      const totalEngagement = posts.reduce((acc: number, post: any) => 
        acc + (post.like_count || 0) + (post.comments_count || 0), 0
      );

      return totalEngagement / posts.length;
    } catch {
      return 0;
    }
  }

  private calculateReachEstimate(posts: any[], influencers: any[]) {
    const baseReach = posts.reduce((acc, post) => {
      const likes = post.like_count || 0;
      const comments = post.comments_count || 0;
      const isVideo = post.media_type === 'VIDEO';
      const views = post.video_view_count || 0;
      
      // Factores de alcance específicos de Instagram
      const mediaTypeFactor = isVideo ? 1.5 : 1; // Videos tienen mayor alcance
      const hashtagFactor = (post.caption?.match(/#/g)?.length || 0) * 0.1 + 1; // Hashtags aumentan alcance
      
      return acc + (
        (likes + comments * 2 + (isVideo ? views * 0.5 : 0)) * 
        100 * mediaTypeFactor * hashtagFactor
      );
    }, 0);

    // Añadir alcance de influencers con factores específicos de Instagram
    const influencerReach = influencers.reduce((acc, inf) => {
      const verifiedMultiplier = inf?.verified ? 1.5 : 1;
      const engagementMultiplier = (inf?.engagement || 0) / 100 + 1;
      return acc + (inf?.followers || 0) * verifiedMultiplier * engagementMultiplier;
    }, 0);

    return baseReach + influencerReach;
  }
}