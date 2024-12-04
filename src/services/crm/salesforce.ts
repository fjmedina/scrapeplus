import axios from 'axios';
import { supabase } from '../../lib/supabase';
import type { CRMConfig, CRMContact } from '../../types/crm';

export class SalesforceService {
  private config: CRMConfig;
  private baseUrl: string;

  constructor(config: CRMConfig) {
    this.config = config;
    this.baseUrl = config.instanceUrl || 'https://login.salesforce.com';
  }

  private async refreshToken(): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.SALESFORCE_CLIENT_ID!,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
        refresh_token: this.config.refreshToken!
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    this.config.accessToken = response.data.access_token;
    return response.data.access_token;
  }

  private async request(endpoint: string, method: string = 'GET', data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}/services/data/v56.0${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        data
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        const newToken = await this.refreshToken();
        return this.request(endpoint, method, data);
      }
      throw error;
    }
  }

  async syncContacts(contacts: CRMContact[]): Promise<void> {
    for (const contact of contacts) {
      await this.request('/sobjects/Contact', 'POST', {
        Email: contact.email,
        LastName: contact.name.split(' ').pop(),
        FirstName: contact.name.split(' ').slice(0, -1).join(' '),
        Company: contact.company
      });
    }
  }

  async getContacts(): Promise<CRMContact[]> {
    const response = await this.request('/query?q=SELECT+Id,Name,Email,Company+FROM+Contact');
    return response.records.map((record: any) => ({
      id: record.Id,
      name: record.Name,
      email: record.Email,
      company: record.Company,
      source: 'salesforce'
    }));
  }

  async setupWebhook(endpoint: string): Promise<void> {
    // Create PushTopic for real-time updates
    await this.request('/sobjects/PushTopic', 'POST', {
      Name: 'ContactUpdates',
      Query: 'SELECT Id, Name, Email, Company FROM Contact',
      ApiVersion: 56.0,
      NotifyForOperationCreate: true,
      NotifyForOperationUpdate: true,
      NotifyForOperationDelete: true,
      NotifyForOperationUndelete: true
    });
  }
}