import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { LogOut, Menu } from 'lucide-react';
import { NotificationCenter } from '../notifications/NotificationCenter';

export function Navbar() {
  const { signOut, user } = useAuthStore();
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
              <span className="text-2xl font-bold text-indigo-600">ScrapePlus</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <span className="text-gray-700">{user?.email}</span>
              <button
                onClick={() => signOut()}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}