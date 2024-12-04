import { create } from 'zustand';
import { analyzeWebsite, type AnalysisResult } from '../services/websiteAnalysis';
import { useAuthStore } from './authStore';

interface WebsiteAnalysisState {
  analyses: AnalysisResult[];
  analyzing: boolean;
  analyze: (url: string) => Promise<void>;
}

export const useWebsiteAnalysisStore = create<WebsiteAnalysisState>()((set) => ({
  analyses: [],
  analyzing: false,
  analyze: async (url: string) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User must be authenticated');

    set((state) => ({
      analyzing: true,
      analyses: [
        { url, status: 'analyzing', lastUpdated: new Date().toISOString() },
        ...state.analyses.filter(a => a.url !== url)
      ],
    }));

    try {
      const result = await analyzeWebsite(url, user.id);
      set((state) => ({
        analyzing: false,
        analyses: [
          result,
          ...state.analyses.filter(a => a.url !== url)
        ],
      }));
    } catch (error) {
      set((state) => ({
        analyzing: false,
        analyses: [
          {
            url,
            status: 'error',
            errors: [error instanceof Error ? error.message : 'An unknown error occurred'],
            lastUpdated: new Date().toISOString()
          },
          ...state.analyses.filter(a => a.url !== url)
        ],
      }));
    }
  },
}));