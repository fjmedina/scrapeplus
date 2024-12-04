import React, { useEffect, useState } from 'react';
import { FileText, Plus, Download, Loader, AlertCircle, Settings } from 'lucide-react';
import { useReportsStore } from '../store/reportsStore';
import { format } from 'date-fns';
import { downloadReportPDF } from '../services/reportsService';

interface ReportFormData {
  name: string;
  sections: {
    websites: boolean;
    social: boolean;
    news: boolean;
  };
  dateRange: 'last24h' | 'last7d' | 'last30d' | 'last90d';
  format: 'detailed' | 'summary';
}

const DATE_RANGE_OPTIONS = [
  { value: 'last24h', label: 'Last 24 hours' },
  { value: 'last7d', label: 'Last 7 days' },
  { value: 'last30d', label: 'Last 30 days' },
  { value: 'last90d', label: 'Last 90 days' },
];

const FORMAT_OPTIONS = [
  { value: 'detailed', label: 'Detailed Report' },
  { value: 'summary', label: 'Executive Summary' },
];

export function Reports() {
  const { reports, loading, generating, fetchReports, generateNewReport } = useReportsStore();
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ReportFormData>({
    name: '',
    sections: {
      websites: true,
      social: true,
      news: true,
    },
    dateRange: 'last7d',
    format: 'detailed',
  });

  useEffect(() => {
    fetchReports().catch(err => 
      setError(err instanceof Error ? err.message : 'Failed to fetch reports')
    );
  }, [fetchReports]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || generating) return;

    try {
      setError(null);
      await generateNewReport(formData);
      setFormData({
        name: '',
        sections: { websites: true, social: true, news: true },
        dateRange: 'last7d',
        format: 'detailed',
      });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    }
  };

  const handleDownload = (report: any) => {
    try {
      downloadReportPDF(report);
    } catch (err) {
      setError('Failed to download report');
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="mt-1 text-sm text-gray-500">
            Generate and view comprehensive analysis reports
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </button>
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

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="reportName" className="block text-sm font-medium text-gray-700">
                Report Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="reportName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3"
                  placeholder="Enter report name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Include Sections
              </label>
              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.sections.websites}
                    onChange={(e) => setFormData({
                      ...formData,
                      sections: { ...formData.sections, websites: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Website Analysis</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.sections.social}
                    onChange={(e) => setFormData({
                      ...formData,
                      sections: { ...formData.sections, social: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Social Media Analysis</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.sections.news}
                    onChange={(e) => setFormData({
                      ...formData,
                      sections: { ...formData.sections, news: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">News Analysis</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={formData.dateRange}
                onChange={(e) => setFormData({
                  ...formData,
                  dateRange: e.target.value as ReportFormData['dateRange']
                })}
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2"
              >
                {DATE_RANGE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Format
              </label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({
                  ...formData,
                  format: e.target.value as ReportFormData['format']
                })}
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2"
              >
                {FORMAT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Report'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {reports.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new report
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {report.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Generated on {format(new Date(report.createdAt), 'PPp')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDownload(report)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
                  </button>
                  <button className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {report.websiteAnalyses.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Website Analyses</h4>
                    <p className="text-2xl font-semibold text-gray-900">
                      {report.websiteAnalyses.length}
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                      {report.websiteAnalyses.slice(0, 2).map((wa, index) => (
                        <div key={index} className="truncate">
                          {wa.url}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report.socialAnalyses.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Social Media Analyses</h4>
                    <p className="text-2xl font-semibold text-gray-900">
                      {report.socialAnalyses.length}
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                      {report.socialAnalyses.slice(0, 2).map((sa, index) => (
                        <div key={index} className="truncate">
                          {sa.brand}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report.newsAnalyses.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">News Analyses</h4>
                    <p className="text-2xl font-semibold text-gray-900">
                      {report.newsAnalyses.length}
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                      {report.newsAnalyses.slice(0, 2).map((na, index) => (
                        <div key={index} className="truncate">
                          {na.query}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}