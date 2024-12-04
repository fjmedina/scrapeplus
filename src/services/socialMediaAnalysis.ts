import axios from 'axios';
import { supabase } from '../lib/supabase';

export interface SocialMention {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram';
  content: string;
  author: string;
  date: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
}

export interface SocialAnalysis {
  brand: string;
  mentions: SocialMention[];
  summary: {
    totalMentions: number;
    sentiment: {
      positive: number;
      negative: number;
      neutral: number;
    };
    engagement: {
      total: number;
      byPlatform: Record<string, number>;
    };
  };
  lastUpdated: string;
}

export async function analyzeSocialMedia(brand: string, userId: string): Promise<SocialAnalysis> {
  try {
    // Check for recent analysis
    const { data: existingAnalysis } = await supabase
      .from('social_analyses')
      .select('*')
      .eq('brand', brand)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingAnalysis) {
      const analysisAge = Date.now() - new Date(existingAnalysis.created_at).getTime();
      if (analysisAge < 6 * 60 * 60 * 1000) { // Less than 6 hours old
        return existingAnalysis.data;
      }
    }

    // Simulate fetching social media data
    // In a real implementation, this would use platform-specific APIs
    const mockMentions: SocialMention[] = [
      {
        platform: 'twitter',
        content: `Just had a great experience with ${brand}! #CustomerService`,
        author: 'JohnDoe',
        date: new Date().toISOString(),
        url: 'https://twitter.com/example',
        sentiment: 'positive',
        engagement: { likes: 15, shares: 5, comments: 3 }
      },
      {
        platform: 'facebook',
        content: `${brand}'s new product launch is impressive`,
        author: 'Jane Smith',
        date: new Date().toISOString(),
        url: 'https://facebook.com/example',
        sentiment: 'positive',
        engagement: { likes: 45, shares: 12, comments: 8 }
      }
    ];

    // Calculate summary
    const summary = {
      totalMentions: mockMentions.length,
      sentiment: {
        positive: mockMentions.filter(m => m.sentiment === 'positive').length,
        negative: mockMentions.filter(m => m.sentiment === 'negative').length,
        neutral: mockMentions.filter(m => m.sentiment === 'neutral').length,
      },
      engagement: {
        total: mockMentions.reduce((acc, m) => 
          acc + m.engagement.likes + m.engagement.shares + m.engagement.comments, 0
        ),
        byPlatform: mockMentions.reduce((acc, m) => ({
          ...acc,
          [m.platform]: (acc[m.platform] || 0) + 
            m.engagement.likes + m.engagement.shares + m.engagement.comments
        }), {} as Record<string, number>)
      }
    };

    const analysis: SocialAnalysis = {
      brand,
      mentions: mockMentions,
      summary,
      lastUpdated: new Date().toISOString()
    };

    // Store the analysis
    await supabase.from('social_analyses').insert({
      brand,
      user_id: userId,
      data: analysis,
    });

    return analysis;
  } catch (error) {
    console.error('Social media analysis error:', error);
    throw error;
  }
}