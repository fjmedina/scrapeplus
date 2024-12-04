import { linkedinApi } from '../api/client';
import type { SocialMediaMetrics } from '../../types/social';
import { generateBrandVariants } from '../utils/brandVariants';

export class LinkedInService {
  async getMetrics(brand: string): Promise<SocialMediaMetrics> {
    const brandVariants = generateBrandVariants(brand);
    
    // Búsqueda de menciones en posts
    const searchResults = await Promise.all(
      brandVariants.map(variant =>
        linkedinApi.get('/v2/socialMetadata', {
          params: {
            q: variant,
            count: 50,
            start: 0
          },
          headers: {
            'X-Restli-Protocol-Version': '2.0.0'
          }
        })
      )
    );

    const posts = searchResults.flatMap(result => result.data.elements);
    
    // Filtrar menciones relevantes
    const relevantPosts = posts.filter(post => {
      const text = post.text?.toLowerCase() || '';
      const comments = post.comments?.values || [];
      
      return brandVariants.some(variant => {
        const variantLower = variant.toLowerCase();
        return text.includes(variantLower) ||
               comments.some((comment: any) => 
                 comment.message?.toLowerCase().includes(variantLower)
               );
      });
    });

    // Obtener métricas de la compañía
    const companyMetrics = await this.getCompanyMetrics(brand);

    // Calcular engagement
    const engagement = relevantPosts.reduce((acc, post) => {
      return acc + (
        (post.likeCount || 0) +
        (post.commentCount || 0) * 2 +
        (post.shareCount || 0) * 3
      );
    }, 0);

    // Analizar sentimiento
    const sentiment = await this.analyzeSentiment(relevantPosts);

    // Clasificar menciones
    const mentionTypes = this.classifyMentions(relevantPosts, brand);

    // Identificar influencers
    const topInfluencers = await this.getTopInfluencers(relevantPosts);

    return {
      followers: companyMetrics.followers,
      mentions: relevantPosts.length,
      engagement,
      sentiment,
      mentionTypes,
      topInfluencers,
      reachEstimate: this.calculateReachEstimate(relevantPosts, topInfluencers)
    };
  }

  private async getCompanyMetrics(brand: string) {
    try {
      const response = await linkedinApi.get(`/v2/organizations/${brand}`, {
        params: {
          fields: 'id,vanityName,followingInfo'
        }
      });
      return {
        followers: response.data.followingInfo?.followerCount || 0
      };
    } catch {
      return { followers: 0 };
    }
  }

  private async analyzeSentiment(posts: any[]) {
    const sentiments = posts.map(post => {
      const text = post.text?.toLowerCase() || '';
      const positiveWords = ['excellent', 'great', 'innovative', 'success', 'proud', 'achievement'];
      const negativeWords = ['disappointed', 'issue', 'problem', 'concern', 'failure', 'poor'];

      const positiveCount = positiveWords.filter(word => text.includes(word)).length;
      const negativeCount = negativeWords.filter(word => text.includes(word)).length;

      // Considerar también las reacciones
      const likes = post.likeCount || 0;
      const comments = post.commentCount || 0;
      const sentiment = (likes * 2 + comments) / (likes + comments) || 0;

      if (positiveCount > negativeCount || sentiment > 1.5) return 'positive';
      if (negativeCount > positiveCount || sentiment < 0.5) return 'negative';
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
      const text = post.text?.toLowerCase() || '';
      return text.includes(`@${brand.toLowerCase()}`) ||
             text.includes(`#${brand.toLowerCase()}`);
    }).length;

    return {
      direct: directMentions,
      indirect: posts.length - directMentions
    };
  }

  private async getTopInfluencers(posts: any[]) {
    const authors = [...new Set(posts.map(post => post.author))];
    
    const influencers = await Promise.all(
      authors.map(async (authorId) => {
        try {
          const response = await linkedinApi.get(`/v2/people/${authorId}`, {
            params: {
              fields: 'id,vanityName,firstName,lastName,numConnections,isInfluencer'
            }
          });
          return {
            id: response.data.id,
            username: `${response.data.firstName} ${response.data.lastName}`,
            followers: response.data.numConnections || 0,
            verified: response.data.isInfluencer || false
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
      const likes = post.likeCount || 0;
      const comments = post.commentCount || 0;
      const shares = post.shareCount || 0;
      
      // Estimación de alcance basada en engagement y el tipo de contenido
      const contentMultiplier = post.content?.contentEntities?.[0]?.type === 'image' ? 1.5 : 1;
      return acc + (likes + comments * 2 + shares * 5) * 100 * contentMultiplier;
    }, 0);

    // Añadir alcance de influencers con peso adicional por ser profesional
    const influencerReach = influencers.reduce((acc, inf) => 
      acc + (inf?.followers || 0) * 1.5, 0);

    return baseReach + influencerReach;
  }
}