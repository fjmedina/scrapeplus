import { create } from 'zustand';
import { analyzeNews, type NewsAnalysis } from '../services/newsAnalysis';
import { useAuthStore } from './authStore';

interface NewsState {
  analyses: Record<string, NewsAnalysis>;
  analyzing: boolean;
  analyze: (query: string) => Promise<void>;
}

export const useNewsStore = create<NewsState>()((set) => ({
  analyses: {},
  analyzing: false,
  analyze: async (query: string) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User must be authenticated');

    set({ analyzing: true });

    try {
      const result = await analyzeNews(query, user.id);
      set((state) => ({
        analyzing: false,
        analyses: {
          ...state.analyses,
          [query]: result
        }
      }));
    } catch (error) {
      console.error('News analysis error:', error);
      set({ analyzing: false });
      throw new Error(error instanceof Error ? error.message : 'Failed to analyze news');
    }
  }
}));