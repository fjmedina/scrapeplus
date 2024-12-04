import React, { useEffect, useState } from 'react';
import { useCRMStore } from '../store/crmStore';
import { 
  Link2, 
  Unlink, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Loader,
  ExternalLink
} from 'lucide-react';
import type { CRMProvider } from '../services/crmIntegration';

interface CRMCredentials {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  instanceUrl?: string;
}

export function Integrations() {
  const { 
    integrations, 
    loading, 
    connecting,
    error,
    fetchIntegrations,
    connect,
    disconnect,
    syncData
  } = useCRMStore();

  const [selectedProvider, setSelectedProvider] = useState<CRMProvider | null>(null);
  const [credentials, setCredentials] = useState<CRMCredentials>({});

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || connecting) return;

    try {
      await connect(selectedProvider, credentials);
      setSelectedProvider(null);
      setCredentials({});
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleDisconnect = async (provider: CRMProvider) => {
    try {
      await disconnect(provider);
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };

  const handleSync = async (provider: CRMProvider) => {
    try {
      // Example data to sync
      const data = {
        name: 'Example Company',
        website: 'https://example.com',
        industry: 'Technology',
      };
      await syncData(provider, data);
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">CRM Integrations</h2>
        <p className="mt-1 text-sm text-gray-500">
          Connect and sync data with your favorite CRM platforms
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Salesforce Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="https://www.salesforce.com/content/dam/sfdc-docs/www/logos/logo-salesforce.svg"
                alt="Salesforce"
                className="h-8 w-auto"
              />
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                Salesforce
              </h3>
            </div>
            {integrations.find(i => i.provider === 'salesforce')?.connected ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSync('salesforce')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Sync
                </button>
                <button
                  onClick={() => handleDisconnect('salesforce')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Unlink className="h-4 w-4 mr-1" />
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedProvider('salesforce')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Link2 className="h-4 w-4 mr-1" />
                Connect
              </button>
            )}
          </div>
        </div>

        {/* HubSpot Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Logo-2.png"
                alt="HubSpot"
                className="h-8 w-auto"
              />
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                HubSpot
              </h3>
            </div>
            {integrations.find(i => i.provider === 'hubspot')?.connected ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSync('hubspot')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Sync
                </button>
                <button
                  onClick={() => handleDisconnect('hubspot')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Unlink className="h-4 w-4 mr-1" />
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedProvider('hubspot')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Link2 className="h-4 w-4 mr-1" />
                Connect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Connection Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Connect to {selectedProvider === 'salesforce' ? 'Salesforce' : 'HubSpot'}
            </h3>
            
            <form onSubmit={handleConnect} className="space-y-4">
              {selectedProvider === 'salesforce' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Access Token
                    </label>
                    <input
                      type="password"
                      value={credentials.accessToken || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        accessToken: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Instance URL
                    </label>
                    <input
                      type="url"
                      value={credentials.instanceUrl || ''}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        instanceUrl: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={credentials.apiKey || ''}
                    onChange={(e) => setCredentials({
                      ...credentials,
                      apiKey: e.target.value
                    })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProvider(null);
                    setCredentials({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connecting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {connecting ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}