import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { User, Menu, Bell } from 'lucide-react';
import { CreatePostStrip } from './CreatePostStrip';

interface HeaderProps {
  userName: string;
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  userName, 
  onMenuToggle,
}) => {
  return (
    <div className="fixed top-0 right-0 left-0 lg:left-64 bg-white dark:bg-gray-800 z-20">
      {/* Top Bar */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-6">
            <CreatePostStrip />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <ThemeToggle />
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
              {userName.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {userName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Admin
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};