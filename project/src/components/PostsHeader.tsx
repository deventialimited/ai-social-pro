import React from 'react';
import { LayoutGrid, List, Filter } from 'lucide-react';

interface PostsHeaderProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  currentTab: 'generated' | 'draft' | 'scheduled' | 'published';
  onTabChange: (tab: 'generated' | 'draft' | 'scheduled' | 'published') => void;
  totalPosts: number;
  filteredPosts: number;
}

export const PostsHeader: React.FC<PostsHeaderProps> = ({
  view,
  onViewChange,
  filter,
  onFilterChange,
  currentTab,
  onTabChange,
  totalPosts,
  filteredPosts,
}) => {
  return (
    <div className="flex items-center justify-between">
      {/* Tabs */}
      <div className="flex">
        <button
          onClick={() => onTabChange('generated')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            currentTab === 'generated'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Generated
        </button>
        <button
          onClick={() => onTabChange('draft')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            currentTab === 'draft'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Draft
        </button>
        <button
          onClick={() => onTabChange('scheduled')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            currentTab === 'scheduled'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => onTabChange('published')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            currentTab === 'published'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Published
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
          <button
            onClick={() => onViewChange('list')}
            className={`p-1.5 rounded ${
              view === 'list'
                ? 'bg-white dark:bg-gray-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange('grid')}
            className={`p-1.5 rounded ${
              view === 'grid'
                ? 'bg-white dark:bg-gray-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 border-0 rounded-md text-sm text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="x">X</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredPosts === totalPosts ? (
            <span>{totalPosts} posts</span>
          ) : (
            <span>{filteredPosts} of {totalPosts} posts</span>
          )}
        </div>
      </div>
    </div>
  );
};