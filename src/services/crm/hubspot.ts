import axios from 'axios';
import type { CRMConfig, CRMContact } from '../../types/crm';

export class HubSpotService {
  private config: CRMConfig;
  private baseUrl = 'https://api.hubapi.com';

  constructor(config: CRMConfig) {
    this.config = config;
  }

  private async request(endpoint: string, method: string = 'GET', data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        data
      });
      return response.data;
    } catch (error) {
      console.error('HubSpot API error:', error);
      throw error;
    }
  }

  async syncContacts(contacts: CRMContact[]): Promise<void> {
    const properties = contacts.map(contact => ({
      properties: {
        email: contact.email,
        firstname: contact.name.split(' ')[0],
        lastname: contact.name.split(' ').slice(1).join(' '),
        company: contact.company
      }
    }));

    await this.request('/crm/v3/objects/contacts/batch/create', 'POST', {
      inputs: properties
    });
  }

  async getContacts(): Promise<CRMContact[]> {
    const response = await this.request('/crm/v3/objects/contacts?properties=email,firstname,lastname,company');
    return response.results.map((contact: any) => ({
      id: contact.id,
      name: `${contact.properties.firstname} ${contact.properties.lastname}`.trim(),
      email: contact.properties.email,
      company: contact.properties.company,
      source: 'hubspot'
    }));
  }

  async setupWebhook(endpoint: string): Promise<void> {
    // Create webhook subscription
    await this.request('/webhooks/v3/endpoints', 'POST', {
      webhookUrl: endpoint,
      eventType: ['contact.creation', 'contact.propertyChange'],
      active: true
    });
  }
}