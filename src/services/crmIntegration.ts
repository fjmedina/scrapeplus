import { supabase } from '../lib/supabase';
import axios from 'axios';

export type CRMProvider = 'salesforce' | 'hubspot';

export interface CRMConfig {
  provider: CRMProvider;
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  instanceUrl?: string;
  expiresAt?: string;
}

export interface CRMContact {
  id: string;
  email: string;
  name: string;
  company?: string;
  lastActivity?: string;
  source: CRMProvider;
}

export interface CRMIntegrationStatus {
  provider: CRMProvider;
  connected: boolean;
  lastSync?: string;
  error?: string;
}

class CRMIntegrationService {
  private async getConfig(userId: string, provider: CRMProvider): Promise<CRMConfig | null> {
    const { data, error } = await supabase
      .from('crm_integrations')
      .select('config')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    if (error || !data) return null;
    return data.config;
  }

  private async updateConfig(userId: string, config: CRMConfig): Promise<void> {
    await supabase.from('crm_integrations').upsert({
      user_id: userId,
      provider: config.provider,
      config
    });
  }

  async connect(userId: string, provider: CRMProvider, credentials: any): Promise<void> {
    try {
      let config: CRMConfig = {
        provider,
        ...credentials
      };

      // Validate and test connection
      await this.testConnection(config);
      
      // Store configuration
      await this.updateConfig(userId, config);
    } catch (error) {
      console.error('CRM connection error:', error);
      throw new Error('Failed to connect to CRM');
    }
  }

  async disconnect(userId: string, provider: CRMProvider): Promise<void> {
    await supabase
      .from('crm_integrations')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider);
  }

  private async testConnection(config: CRMConfig): Promise<boolean> {
    try {
      switch (config.provider) {
        case 'salesforce':
          // Test Salesforce connection
          await axios.get(`${config.instanceUrl}/services/data/v52.0/sobjects`, {
            headers: {
              'Authorization': `Bearer ${config.accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          break;

        case 'hubspot':
          // Test HubSpot connection
          await axios.get('https://api.hubapi.com/crm/v3/objects/contacts', {
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          break;
      }
      return true;
    } catch (error) {
      console.error('CRM test connection error:', error);
      return false;
    }
  }

  async syncData(userId: string, provider: CRMProvider, data: any): Promise<void> {
    const config = await this.getConfig(userId, provider);
    if (!config) throw new Error('CRM not configured');

    try {
      switch (provider) {
        case 'salesforce':
          await this.syncToSalesforce(config, data);
          break;
        case 'hubspot':
          await this.syncToHubspot(config, data);
          break;
      }

      // Update last sync timestamp
      await supabase
        .from('crm_integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('provider', provider);
    } catch (error) {
      console.error('CRM sync error:', error);
      throw new Error('Failed to sync data to CRM');
    }
  }

  private async syncToSalesforce(config: CRMConfig, data: any): Promise<void> {
    // Implement Salesforce sync logic
    const endpoint = `${config.instanceUrl}/services/data/v52.0/sobjects/Account`;
    await axios.post(endpoint, data, {
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  private async syncToHubspot(config: CRMConfig, data: any): Promise<void> {
    // Implement HubSpot sync logic
    await axios.post('https://api.hubapi.com/crm/v3/objects/companies', {
      properties: {
        name: data.name,
        website: data.website,
        // Map other properties
      }
    }, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getIntegrationStatus(userId: string): Promise<CRMIntegrationStatus[]> {
    const { data, error } = await supabase
      .from('crm_integrations')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(integration => ({
      provider: integration.provider,
      connected: true,
      lastSync: integration.last_sync,
    }));
  }
}

export const crmService = new CRMIntegrationService();