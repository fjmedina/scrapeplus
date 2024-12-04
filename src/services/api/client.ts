import axios from 'axios';
import { config } from '../../config/api';

export const createApiClient = (service: keyof typeof config) => {
  const baseConfig = config[service];
  
  const client = axios.create({
    baseURL: 'baseUrl' in baseConfig ? baseConfig.baseUrl : undefined,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add authentication interceptor
  client.interceptors.request.use((config) => {
    const apiKey = 'apiKey' in baseConfig ? baseConfig.apiKey : undefined;
    
    if (apiKey) {
      config.headers.Authorization = `Bearer ${apiKey}`;
    }
    
    return config;
  });

  // Add error handling interceptor
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 429) {
        // Rate limit handling
        const retryAfter = error.response.headers['retry-after'];
        if (retryAfter) {
          await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
          return client(error.config);
        }
      }
      throw error;
    }
  );

  return client;
};

export const newsApi = createApiClient('news');
export const twitterApi = createApiClient('social');
export const salesforceApi = createApiClient('crm');
export const hubspotApi = createApiClient('crm');