import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  features: string[];
  limits: {
    websiteAnalyses: number;
    socialMediaAnalyses: number;
    newsAnalyses: number;
    reportsPerMonth: number;
  };
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Basic website analysis',
      'Limited social media monitoring',
      'Basic news tracking',
      '1 report per month'
    ],
    limits: {
      websiteAnalyses: 3,
      socialMediaAnalyses: 2,
      newsAnalyses: 2,
      reportsPerMonth: 1
    }
  },
  basic: {
    tier: 'basic',
    name: 'Basic',
    price: 29,
    features: [
      'Advanced website analysis',
      'Social media monitoring',
      'News tracking',
      '5 reports per month',
      'PDF exports'
    ],
    limits: {
      websiteAnalyses: 10,
      socialMediaAnalyses: 5,
      newsAnalyses: 5,
      reportsPerMonth: 5
    }
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    price: 79,
    features: [
      'Full website analysis suite',
      'Advanced social media analytics',
      'Comprehensive news monitoring',
      'Unlimited reports',
      'API access',
      'Priority support'
    ],
    limits: {
      websiteAnalyses: 50,
      socialMediaAnalyses: 25,
      newsAnalyses: 25,
      reportsPerMonth: -1 // unlimited
    }
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 299,
    features: [
      'Custom solutions',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
      'Team collaboration',
      'Advanced API access'
    ],
    limits: {
      websiteAnalyses: -1, // unlimited
      socialMediaAnalyses: -1,
      newsAnalyses: -1,
      reportsPerMonth: -1
    }
  }
};

interface SubscriptionState {
  currentPlan: SubscriptionPlan;
  loading: boolean;
  upgradeSubscription: (tier: SubscriptionTier) => Promise<void>;
  fetchCurrentPlan: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  currentPlan: SUBSCRIPTION_PLANS.free,
  loading: true,
  upgradeSubscription: async (tier: SubscriptionTier) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', user.id);

      set({ currentPlan: SUBSCRIPTION_PLANS[tier] });
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  },
  fetchCurrentPlan: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (profile) {
        set({ 
          currentPlan: SUBSCRIPTION_PLANS[profile.subscription_tier as SubscriptionTier],
          loading: false 
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      set({ loading: false });
    }
  }
}));