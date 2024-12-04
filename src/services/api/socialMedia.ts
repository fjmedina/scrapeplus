import axios from 'axios';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

export interface SocialMediaAnalysis {
  brand: string;
  platforms: {
    twitter?: {
      metrics: {
        followers: number;
        engagement: number;
        posts: number;
        mentions: number;
      };
      recentPosts: any[];
      topMentions: any[];
    };
    facebook?: {
      metrics: {
        followers: number;
        engagement: number;
        posts: number;
        mentions: number;
      };
      recentPosts: any[];
      topMentions: any[];
    };
  };
  timestamp: string;
}

export class SocialMediaService {
  async analyze(brand: string, userId: string): Promise<SocialMediaAnalysis> {
    try {
      // Check for recent analysis
      const { data: existingAnalysis } = await supabase
        .from('social_analyses')
        .select('data')
        .eq('brand', brand)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingAnalysis) {
        const analysisAge = Date.now() - new Date(existingAnalysis.data.timestamp).getTime();
        if (analysisAge < 6 * 60 * 60 * 1000) { // Less than 6 hours old
          return existingAnalysis.data as SocialMediaAnalysis;
        }
      }

      const platforms: SocialMediaAnalysis['platforms'] = {};

      // Twitter Analysis
      if (process.env.TWITTER_API_KEY) {
        const twitterData = await axios.get(
          `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(brand)}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.TWITTER_API_KEY}`
            }
          }
        );
        
        platforms.twitter = {
          metrics: {
            followers: 0,
            engagement: 0,
            posts: twitterData.data.meta.result_count,
            mentions: twitterData.data.meta.result_count
          },
          recentPosts: twitterData.data.data,
          topMentions: []
        };
      }

      const analysis: SocialMediaAnalysis = {
        brand,
        platforms,
        timestamp: new Date().toISOString()
      };

      // Store analysis in Supabase
      await supabase.from('social_analyses').insert({
        brand,
        user_id: userId,
        data: analysis
      });

      return analysis;
    } catch (error) {
      console.error('Social media analysis error:', error);
      throw new Error('Failed to analyze social media presence');
    }
  }
}