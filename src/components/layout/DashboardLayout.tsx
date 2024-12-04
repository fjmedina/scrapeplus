import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useRealtime } from '../../hooks/useRealtime';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // Initialize realtime subscriptions
  useRealtime();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}