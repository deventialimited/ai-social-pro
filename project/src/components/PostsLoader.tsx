import React from 'react';

export const PostsLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Logo container with pulsing background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse" />
          
          {/* Logo */}
          <img
            src="/oneyear-logo.svg"
            alt="OneYear"
            className="relative w-full h-full p-4 animate-bounce"
            style={{ animationDuration: '2s' }}
          />
          
          {/* Rotating ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Generating Posts
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Creating engaging content for your social media...
          </p>
        </div>
      </div>
    </div>
  );
};