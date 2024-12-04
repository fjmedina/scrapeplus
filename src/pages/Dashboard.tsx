import React from 'react';
import { BarChart3, Globe, Share2, Newspaper } from 'lucide-react';

const stats = [
  { name: 'Websites Analyzed', value: '12', icon: Globe, change: '+2', changeType: 'increase' },
  { name: 'Social Mentions', value: '245', icon: Share2, change: '+18%', changeType: 'increase' },
  { name: 'News Articles', value: '52', icon: Newspaper, change: '+5', changeType: 'increase' },
  { name: 'Reports Generated', value: '8', icon: BarChart3, change: '+3', changeType: 'increase' },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your scraping activities and insights
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-indigo-500 p-3">
                  <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'increase'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-lg bg-white shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
          <div className="mt-4 space-y-4">
            <p className="text-gray-500">No recent activities to display.</p>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-4 space-y-4">
            <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              New Website Analysis
            </button>
            <button className="w-full bg-white text-indigo-600 px-4 py-2 rounded-md border border-indigo-600 hover:bg-indigo-50">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}