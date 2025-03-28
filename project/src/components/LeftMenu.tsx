import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Briefcase, LogOut, Plus, ChevronDown, Share2, X } from 'lucide-react';
import { Listbox } from '@headlessui/react';
import { Link } from './Link';
import { Website, Post } from '../types';
import { AddWebsiteModal } from './AddWebsiteModal';
import { CreatePostStrip } from './CreatePostStrip';

interface LeftMenuProps {
  websites: Website[];
  selectedWebsite: string;
  onWebsiteChange: (id: string) => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onAddBusiness: (url: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onNewPost: (post: Post) => void;
}

export const LeftMenu: React.FC<LeftMenuProps> = ({
  websites,
  selectedWebsite,
  onWebsiteChange,
  currentTab,
  onTabChange,
  onAddBusiness,
  isOpen,
  onClose,
  onNewPost
}) => {
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const selectedWebsiteData = websites.find(w => w.id === selectedWebsite);

  useEffect(() => {
    // Close mobile menu when switching tabs
    if (isOpen) {
      onClose();
    }
  }, [currentTab]);

  const handleGeneratePosts = (url: string) => {
    onAddBusiness(url);
    setShowAddWebsite(false);
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 lg:hidden transition-opacity duration-300 z-30 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`} onClick={onClose} />
      
      <div className={`w-64 bg-white dark:bg-gray-800 h-screen fixed left-0 top-0 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <button
          onClick={onClose}
          className="lg:hidden absolute right-4 top-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="h-20 px-6 flex items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src="/oneyear-logo.svg"
              alt="OneYear Social"
              className="w-8 h-8"
            />
            <span className="font-semibold text-gray-900 dark:text-white">
              OneYear Social
            </span>
          </div>
        </div>

        <div className="px-6 py-6">
          <CreatePostStrip onNewPost={onNewPost} />
          
          <Listbox value={selectedWebsite} onChange={onWebsiteChange}>
            <div className="relative">
              <Listbox.Button className="relative w-full pl-12 pr-12 py-3 text-left rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <span className="flex items-center">
                  <img
                    src={selectedWebsiteData?.logo}
                    alt="Selected website logo"
                    className="w-5 h-5 rounded-sm absolute left-4"
                  />
                  <span className="block truncate">{selectedWebsiteData?.name}</span>
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Listbox.Options className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 py-1 overflow-auto">
                {websites.map((website) => (
                  <Listbox.Option
                    key={website.id}
                    value={website.id}
                    className={({ active, selected }) =>
                      `relative cursor-pointer select-none py-3 pl-12 pr-4 ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : selected
                          ? 'bg-gray-50 dark:bg-gray-600/50 text-gray-900 dark:text-white'
                          : 'text-gray-900 dark:text-white'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <img
                          src={website.logo}
                          alt={`${website.name} logo`}
                          className="w-5 h-5 rounded-sm absolute left-4"
                        />
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {website.name}
                        </span>
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
          
          <button
            onClick={() => setShowAddWebsite(true)}
            className="w-full mt-3 flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4 mr-3" />
            <span>Add New Business</span>
          </button>
        </div>
        
        <nav className="px-6 mt-2">
          <Link
            href="#"
            active={currentTab === 'dashboard'}
            onClick={() => onTabChange('dashboard')}
            icon={<LayoutDashboard className="w-5 h-5" />}
          >
            Dashboard
          </Link>
          <Link
            href="#"
            active={currentTab === 'posts'}
            onClick={() => onTabChange('posts')}
            icon={<FileText className="w-5 h-5" />}
          >
            Posts
          </Link>
          <Link
            href="#"
            active={currentTab === 'business'}
            onClick={() => onTabChange('business')}
            icon={<Briefcase className="w-5 h-5" />}
          >
            Business
          </Link>
          <Link
            href="#"
            active={currentTab === 'socials'}
            onClick={() => onTabChange('socials')}
            icon={<Share2 className="w-5 h-5" />}
          >
            Socials
          </Link>
        </nav>

        <div className="absolute bottom-4 w-full px-6">
          <button className="flex items-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white w-full px-4 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {showAddWebsite && (
        <AddWebsiteModal
          onClose={() => setShowAddWebsite(false)}
          onGenerate={handleGeneratePosts}
        />
      )}
    </>
  );
};