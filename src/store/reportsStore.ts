import { create } from 'zustand';
import { generateReport, getReports, type Report } from '../services/reportsService';
import { useAuthStore } from './authStore';

interface ReportsState {
  reports: Report[];
  loading: boolean;
  generating: boolean;
  fetchReports: () => Promise<void>;
  generateNewReport: (name: string) => Promise<void>;
}

export const useReportsStore = create<ReportsState>((set) => ({
  reports: [],
  loading: false,
  generating: false,
  fetchReports: async () => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User must be authenticated');

    set({ loading: true });
    try {
      const reports = await getReports(user.id);
      set({ reports, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  generateNewReport: async (name: string) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User must be authenticated');

    set({ generating: true });
    try {
      const report = await generateReport(name, user.id);
      set(state => ({
        generating: false,
        reports: [report, ...state.reports]
      }));
    } catch (error) {
      set({ generating: false });
      throw error;
    }
  }
}));