export interface SocialMediaMetrics {
  followers: number;
  mentions: number;
  engagement: number;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  mentionTypes: {
    direct: number;    // Menciones con @ o etiquetas directas
    indirect: number;  // Menciones del nombre sin etiqueta
  };
  topInfluencers: Array<{
    id: string;
    username: string;
    followers: number;
    verified: boolean;
  }>;
  reachEstimate: number;
}

export interface SocialMediaPost {
  id: string;
  content: string;
  platform: 'twitter' | 'facebook' | 'linkedin';
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  sentiment: 'positive' | 'negative' | 'neutral';
  mentionType: 'direct' | 'indirect';
  url: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    followers: number;
    verified: boolean;
  };
}

export interface SocialMediaProfile {
  platform: 'twitter' | 'facebook' | 'linkedin';
  username: string;
  displayName: string;
  bio: string;
  followers: number;
  following: number;
  profileUrl: string;
  avatarUrl?: string;
  verified: boolean;
}