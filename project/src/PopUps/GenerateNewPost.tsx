import React, { useState } from 'react';
import { X, Link2, FileText, Image as ImageIcon, Type, Globe, MessageSquare, Target, Sparkles, ArrowRight, Info } from 'lucide-react';

interface GeneratePostModalProps {
  onClose: () => void;
  onGenerate: (data: any) => void;
}

export const GeneratePostModal: React.FC<GeneratePostModalProps> = ({ onClose, onGenerate }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'image'>('text');
  const [contentType, setContentType] = useState<'post' | 'article'>('post');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    platform: 'facebook',
    topic: '',
    text: '',
    url: '',
    urlDescription: '', // New field for URL description
    callToAction: '',
    tone: 'professional',
    imageDescription: '',
    imageFile: null as File | null,
  });

  const platforms = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'x', label: 'X (Twitter)' },
    { value: 'linkedin', label: 'LinkedIn' },
  ];

  const tones = [
    { value: 'funny', label: 'Funny' },
    { value: 'smart', label: 'Smart' },
    { value: 'detailed', label: 'Detailed' },
    { value: 'professional', label: 'Professional' },
    { value: 'educational', label: 'Educational' },
    { value: 'casual', label: 'Casual' },
    { value: 'inspiring', label: 'Inspiring' },
  ];

  const tabs = [
    {
      id: 'text' as const,
      label: 'Text to Post',
      icon: <Type className="w-4 h-4" />,
      color: 'from-green-500 to-emerald-500',
      tooltip: 'Transform your ideas and text content into engaging social media posts with AI-generated visuals',
    },
    {
      id: 'url' as const,
      label: 'URL to Post',
      icon: <Link2 className="w-4 h-4" />,
      color: 'from-blue-500 to-cyan-500',
      tooltip: 'Convert any website URL into compelling social media content by extracting key information and creating posts',
    },
    {
      id: 'image' as const,
      label: 'Image to Post',
      icon: <ImageIcon className="w-4 h-4" />,
      color: 'from-purple-500 to-pink-500',
      tooltip: 'Upload an image and let AI analyze it to create relevant, engaging captions and social media posts',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, imageFile: file });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      ...formData,
      type: activeTab,
      contentType,
    });
  };

  const renderTabContent = () => {
    return (
      <div className="space-y-6">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Platform
          </label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {platforms.map((platform) => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
          </select>
        </div>

        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Topic
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="What's the main topic of your post?"
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Conditional Fields Based on Tab */}
        {activeTab === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              What do you want to post about?
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="Describe what you want to post about..."
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        )}

        {activeTab === 'url' && (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* URL Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Link2 className="w-4 h-4 inline mr-2" />
                URL
              </label>
              <div
                className="flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-xl p-4 box-border"
                style={{ height: '160px', minHeight: '160px', width: '100%' }}
              >
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0"
                />
              </div>
            </div>
            {/* Describe URL */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Describe the URL
              </label>
              <textarea
                value={formData.urlDescription}
                onChange={(e) => setFormData({ ...formData, urlDescription: e.target.value })}
                placeholder="Describe the content or context of the URL..."
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none box-border"
                style={{ height: '160px', minHeight: '160px', width: '100%' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'image' && (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Upload Image */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <ImageIcon className="w-4 h-4 inline mr-2" />
                Upload Image
              </label>
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer flex flex-col justify-center items-center box-border"
                style={{ height: '160px', minHeight: '160px', width: '100%' }}
              >
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="text-gray-600 dark:text-gray-400 cursor-pointer"
                >
                  <span className="font-medium text-blue-500 dark:text-blue-400">Click to upload</span> or drag and drop
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PNG, JPG or GIF (max. 5MB)
                </p>
              </div>
            </div>
            {/* Describe Image */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Describe the Image
              </label>
              <textarea
                value={formData.imageDescription}
                onChange={(e) => setFormData({ ...formData, imageDescription: e.target.value })}
                placeholder="Describe the content or context of the image..."
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none box-border"
                style={{ height: '160px', minHeight: '160px', width: '100%' }}
              />
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Target className="w-4 h-4 inline mr-2" />
            Call to Action
          </label>
          <input
            type="text"
            value={formData.callToAction}
            onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
            placeholder="e.g., Visit our website, Book now, Learn more..."
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

      

        {/* Tone Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Tone
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tones.map((tone) => (
              <button
                key={tone.value}
                type="button"
                onClick={() => setFormData({ ...formData, tone: tone.value })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.tone === tone.value
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tone.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl w-[700px] max-h-[90vh] overflow-hidden shadow-xl">
        <div className="px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Generate New Post
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="px-8 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            {tabs.map((tab) => (
              <div key={tab.id} className="relative flex-1">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  onMouseEnter={() => setShowTooltip(tab.id)}
                  onMouseLeave={() => setShowTooltip(null)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className={`${activeTab === tab.id ? `bg-gradient-to-r ${tab.color}` : ''} ${activeTab === tab.id ? 'text-white' : ''} p-1 rounded`}>
                    {tab.icon}
                  </div>
                  {tab.label}
                  <Info className="w-3 h-3 opacity-50" />
                </button>
                {showTooltip === tab.id && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10">
                    <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 max-w-xs text-center shadow-lg">
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
                      {tab.tooltip}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {renderTabContent()}
          <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
            >
              Generate Post
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};