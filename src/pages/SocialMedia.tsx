import React, { useState } from 'react';
import { Search, Twitter, Facebook, Linkedin, Instagram, TrendingUp, MessageCircle, ThumbsUp, Share2 } from 'lucide-react';
import { useSocialMediaStore } from '../store/socialMediaStore';
import { format } from 'date-fns';

const platformIcons = {
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  instagram: Instagram,
};

export function SocialMedia() {
  const [brand, setBrand] = useState('');
  const { analyses, analyze, analyzing } = useSocialMediaStore();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || analyzing) return;
    
    try {
      setError(null);
      await analyze(brand);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const currentAnalysis = brand ? analyses[brand] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Social Media Analysis</h2>
        <p className="mt-1 text-sm text-gray-500">
          Monitor and analyze social media mentions and engagement
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="brand" className="sr-only">
              Brand or Company Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-3"
                placeholder="Enter brand or company name"
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