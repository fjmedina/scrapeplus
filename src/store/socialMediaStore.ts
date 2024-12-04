import { create } from 'zustand';
import { analyzeSocialMedia, type SocialAnalysis } from '../services/socialMediaAnalysis';
import { useAuthStore } from './authStore';

interface SocialMediaState {
  analyses: Record<string, SocialAnalysis>;
  analyzing: boolean;
  analyze: (brand: string) => Promise<void>;
}

export const useSocialMediaStore = create<SocialMediaState>((set, get) => ({
  analyses: {},
  analyzing: false,
  analyze: async (brand: string) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User must be authenticated');

    set({ analyzing: true });

    try {
      const result = await analyzeSocialMedia(brand, user.id);
      set((state) => ({
        analyzing: false,
        analyses: {
          ...state.analyses,
          [brand]: result
        }
      }));
    } catch (error) {
      set({ analyzing: false });
      throw error;
    }
  }
}));