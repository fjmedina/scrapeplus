import { create } from 'zustand';
import { crmService, type CRMProvider, type CRMIntegrationStatus } from '../services/crmIntegration';
import { useAuthStore } from './authStore';

interface CRMState {
  integrations: CRMIntegrationStatus[];
  loading: boolean;
  connecting: boolean;
  error: string | null;
  fetchIntegrations: () => Promise<void>;
  connect: (provider: CRMProvider, credentials: any) => Promise<void>;
  disconnect: (provider: CRMProvider) => Promise<void>;
  syncData: (provider: CRMProvider, data: any) => Promise<void>;
}

export const useCRMStore = create<CRMState>((set, get) => ({
  integrations: [],
  loading: false,
  connecting: false,
  error: null,
  
  fetchIntegrations: async () => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    set({ loading: true, error: null });
    try {
      const integrations = await crmService.getIntegrationStatus(user.id);
      set({ integrations, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch integrations',
        loading: false 
      });
    }
  },

  connect: async (provider: CRMProvider, credentials: any) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    set({ connecting: true, error: null });
    try {
      await crmService.connect(user.id, provider, credentials);
      await get().fetchIntegrations();
      set({ connecting: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to connect to CRM',
        connecting: false 
      });
      throw error;
    }
  },

  disconnect: async (provider: CRMProvider) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    set({ error: null });
    try {
      await crmService.disconnect(user.id, provider);
      await get().fetchIntegrations();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to disconnect CRM'
      });
      throw error;
    }
  },

  syncData: async (provider: CRMProvider, data: any) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    set({ error: null });
    try {
      await crmService.syncData(user.id, provider, data);
      await get().fetchIntegrations();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sync data'
      });
      throw error;
    }
  },
}));