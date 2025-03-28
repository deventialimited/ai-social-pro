import React, { useState, useRef, useEffect } from 'react';
import { Link2, FileText, Image as ImageIcon, Type, Plus, ChevronRight } from 'lucide-react';
import { CreatePostModal } from './CreatePostModal';

export const CreatePostStrip: React.FC = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [activeModal, setActiveModal] = useState<'url-post' | 'url-article' | 'image-post' | 'text-post' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const createOptions = [
    {
      type: 'url-post' as const,
      title: 'URL to Post',
      description: 'Create a post from any URL',
      icon: <Link2 className="w-5 h-5" />,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      type: 'url-article' as const,
      title: 'URL to Article',
      description: 'Transform URLs into full articles',
      icon: <FileText className="w-5 h-5" />,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      type: 'image-post' as const,
      title: 'Image to Post',
      description: 'Create posts from images',
      icon: <ImageIcon className="w-5 h-5" />,
      gradient: 'from-orange-500 to-yellow-500'
    },
    {
      type: 'text-post' as const,
      title: 'Text to Post',
      description: 'Start with your own text',
      icon: <Type className="w-5 h-5" />,
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
    setActiveModal(null);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowOptions(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowOptions(false);
    }, 300); // Small delay to make the interaction smoother
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="group relative flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 
          bg-white dark:bg-gray-800 hover:border-transparent hover:shadow-lg transition-all duration-200
          hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-500 
          text-white flex items-center justify-center">
          <Plus className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          Create Post
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 
          group-hover:opacity-100 rounded-lg -z-10 blur transition-opacity duration-200" />
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute left-0 top-full mt-2 w-[300px] bg-white dark:bg-gray-800 rounded-xl shadow-xl 
          border border-gray-200 dark:border-gray-700 overflow-hidden z-40 transition-all duration-200
          ${showOptions 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
      >
        {createOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => {
              setActiveModal(option.type);
              setShowOptions(false);
            }}
            className="group w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.gradient}
              text-white flex items-center justify-center transform transition-transform group-hover:scale-110`}>
              {option.icon}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900 dark:text-white transform transition-transform group-hover:translate-x-1">
                {option.title}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 transform transition-transform group-hover:translate-x-1">
                {option.description}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 transform transition-transform group-hover:translate-x-1" />
          </button>
        ))}
      </div>

      {activeModal && (
        <CreatePostModal
          type={activeModal}
          onClose={() => setActiveModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};