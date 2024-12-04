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
  name: string;
  email: string;
  company?: string;
  source: CRMProvider;
}

export interface CRMWebhookEvent {
  source: CRMProvider;
  type: string;
  data: any;
  timestamp: string;
}

export interface CRMIntegrationStatus {
  provider: CRMProvider;
  connected: boolean;
  lastSync?: string;
  error?: string;
}