import React, { useState } from 'react';
import { Search, Newspaper, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';
import { useNewsStore } from '../store/newsStore';
import { format } from 'date-fns';

export function News() {
  const [query, setQuery] = useState('');
  const { analyses, analyze, analyzing } = useNewsStore();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || analyzing) return;
    
    try {
      setError(null);
      await analyze(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const currentAnalysis = query ? analyses[query] : null;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">News Monitoring</h2>
        <p className="mt-1 text-sm text-gray-500">
          Track and analyze news coverage for companies and brands
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="query" className="sr-only">
              Search Query
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-3"
                placeholder="Enter company or brand name"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={analyzing}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
      </div>

      {/* Rest of the component remains the same */}
    </div>
  );
}