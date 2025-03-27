import React, { useState } from 'react';
import { X, Link2, FileText, Image as ImageIcon, Type, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { PostCreationLoader } from './PostCreationLoader';
import { Post } from '../types';

interface CreatePostModalProps {
  type: 'url-post' | 'url-article' | 'image-post' | 'text-post';
  onClose: () => void;
  onSubmit: (post: Post) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ type, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    input: '',
    comments: '',
    tone: 'professional',
    platforms: ['facebook', 'instagram', 'linkedin']
  });

  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const getModalConfig = () => {
    switch (type) {
      case 'url-post':
        return {
          title: 'URL to Post',
          icon: <Link2 className="w-6 h-6" />,
          gradient: 'from-blue-500 to-cyan-500',
          info: 'Turn any URL into an engaging social media post with AI-generated visuals and copy.',
          inputLabel: 'URL',
          inputType: 'url',
          inputPlaceholder: 'Paste your URL here...',
          features: [
            'Extracts key information from the URL',
            'Generates multiple post variations',
            'Creates matching visuals for each platform'
          ]
        };
      case 'url-article':
        return {
          title: 'URL to Article',
          icon: <FileText className="w-6 h-6" />,
          gradient: 'from-purple-500 to-pink-500',
          info: 'Transform any URL into a professional, branded article that establishes your authority.',
          inputLabel: 'Article URL',
          inputType: 'url',
          inputPlaceholder: 'Paste your article URL here...',
          features: [
            'Maintains your brand voice and style',
            'Optimizes for readability and engagement',
            'Includes relevant citations and sources'
          ]
        };
      case 'image-post':
        return {
          title: 'Image to Post',
          icon: <ImageIcon className="w-6 h-6" />,
          gradient: 'from-orange-500 to-yellow-500',
          info: 'Create engaging social media posts from your images with AI-generated captions.',
          inputLabel: 'Image',
          inputType: 'file',
          inputPlaceholder: 'Drop your image here or click to browse',
          features: [
            'Analyzes image content for context',
            'Suggests relevant hashtags and captions',
            'Optimizes image for each platform'
          ]
        };
      case 'text-post':
        return {
          title: 'Text to Post',
          icon: <Type className="w-6 h-6" />,
          gradient: 'from-green-500 to-emerald-500',
          info: 'Convert your ideas into engaging social media content with matching visuals.',
          inputLabel: 'Topic or Text',
          inputType: 'text',
          inputPlaceholder: 'What would you like to post about?',
          features: [
            'Generates engaging copy from your text',
            'Creates matching visuals automatically',
            'Adapts content for each platform'
          ]
        };
    }
  };

  const config = getModalConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate AI post generation
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Create a new post object
    const newPost: Post = {
      id: `post-${Date.now()}`,
      text: type === 'text-post' ? formData.input : 'AI-generated post content based on your input...',
      imageUrl: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1000',
      scheduledDate: new Date().toISOString(),
      platforms: ['facebook', 'instagram'],
      businessLogo: '/kaz-routes-logo.png',
      status: 'generated'
    };

    onSubmit(newPost);
    setIsLoading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle the file
      console.log(e.dataTransfer.files[0]);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl w-[900px] max-h-[90vh] overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} 
                flex items-center justify-center text-white`}>
                {config.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {config.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {config.info}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="col-span-2">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {config.inputLabel}
                      </label>
                      {config.inputType === 'file' ? (
                        <div
                          className={`relative group ${dragActive ? 'ring-2 ring-blue-500' : ''}`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => console.log(e.target.files?.[0])}
                          />
                          <div className="flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed 
                            border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer
                            group-hover:border-blue-500 dark:group-hover:border-blue-400 transition-colors">
                            <div className="w-16 h-16 mb-4 rounded-full bg-blue-50 dark:bg-blue-900/30 
                              flex items-center justify-center text-blue-500 dark:text-blue-400
                              group-hover:scale-110 transition-transform">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                              <span className="font-medium text-blue-500 dark:text-blue-400">
                                Click to upload
                              </span>{' '}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              PNG, JPG or GIF (max. 5MB)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <input
                          type={config.inputType}
                          value={formData.input}
                          onChange={(e) => setFormData({ ...formData, input: e.target.value })}
                          placeholder={config.inputPlaceholder}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                            rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Additional Instructions
                        </div>
                      </label>
                      <textarea
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        placeholder="Add any specific instructions or preferences for the AI..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                          rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                          focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tone of Voice
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['professional', 'casual', 'friendly'].map((tone) => (
                          <button
                            key={tone}
                            type="button"
                            onClick={() => setFormData({ ...formData, tone })}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all
                              ${formData.tone === tone
                                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                          >
                            {tone.charAt(0).toUpperCase() + tone.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features Sidebar */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        What You'll Get
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {config.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg
                            border border-gray-200 dark:border-gray-600"
                        >
                          <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center
                            text-xs font-medium text-blue-700 dark:text-blue-400">
                            {index + 1}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-2.5 bg-gradient-to-r ${config.gradient} text-white rounded-lg
                    flex items-center gap-2 hover:opacity-90 transition-opacity
                    ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Create Post
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Add the loader overlay when isLoading is true */}
      {isLoading && <PostCreationLoader type={type} />}
    </>
  );
};