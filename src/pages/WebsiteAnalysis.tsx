import React, { useState } from 'react';
import { Globe, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useWebsiteAnalysisStore } from '../store/websiteAnalysisStore';

export function WebsiteAnalysis() {
  const [url, setUrl] = useState('');
  const { analyses, analyze, analyzing } = useWebsiteAnalysisStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || analyzing) return;
    await analyze(url);
    setUrl('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Website Analysis</h2>
        <p className="mt-1 text-sm text-gray-500">
          Analyze websites for performance, SEO, and best practices
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="url" className="sr-only">
              Website URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-3"
                placeholder="Enter website URL (e.g., https://example.com)"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={analyzing}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <>
                <Clock className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Rest of the component remains the same */}
    </div>
  );
}