import React, { useState } from 'react';
import { X, Link2, FileText, Image as ImageIcon, Type, Globe, MessageSquare, Target, Sparkles, ArrowRight, Info } from 'lucide-react';
import { getDomainById } from '../libs/domainService';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useCreatePostViaPubSub } from '../libs/postService';
import { useQueryClient } from "@tanstack/react-query";

const GeneratePostModal = ({ onClose, onGenerate, onLoadingChange }) => {
  const queryClient = useQueryClient();
  const { mutateAsync: createPostViaPubSub, isLoading: isPubSubLoading } = useCreatePostViaPubSub();

  const [activeTab, setActiveTab] = useState('text');
  const [contentType, setContentType] = useState('post');
  const [showTooltip, setShowTooltip] = useState(null);
  const [formData, setFormData] = useState({
    platform: 'facebook',
    topic: '',
    text: '',
    url: '',
    callToAction: '',
    tone: 'professional',
    PostURL: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
      id: 'text',
      label: 'Text to Post',
      icon: <Type className="w-4 h-4" />,
      color: 'from-green-500 to-emerald-500',
      tooltip: 'Transform your ideas and text content into engaging social media posts with AI-generated visuals',
    },
    {
      id: 'url',
      label: 'URL to Post',
      icon: <Link2 className="w-4 h-4" />,
      color: 'from-blue-500 to-cyan-500',
      tooltip: 'Convert any website URL into compelling social media content by extracting key information and creating posts',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields based on active tab
    if (activeTab === 'text' && !formData.topic && !formData.text) {
      toast.error('Please provide either a Topic or Description', {
        position: 'top-right',
        duration: 4000,
      });
      return;
    }

    if (activeTab === 'url' && !formData.url) {
      toast.error('Please provide a URL', {
        position: 'top-right',
        duration: 4000,
      });
      return;
    }

    // Set loading state and close modal immediately
    setIsLoading(true);
    setError(null);
    onLoadingChange?.(true);
    onClose();

    try {
      // Fetch user and selectedWebsiteId from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const selectedWebsiteId = user?.selectedWebsiteId;

      if (!selectedWebsiteId) {
        throw new Error('No website selected. Please select a website and try again.');
      }

      // Fetch domain details
      const domain = await getDomainById(selectedWebsiteId);
      if (!domain?.data) {
        throw new Error('Unable to find website details. Please try again later.');
      }

      // Prepare payload for the third-party API
      const payload = {
        client_email: domain.data.client_email,
        client_id: domain.data.client_id,
        website: domain.data.clientWebsite,
        name: domain.data.clientName || 'Unknown',
        industry: domain.data.industry || 'Unknown',
        niche: domain.data.niche || 'Unknown',
        description: domain.data.clientDescription || '',
        core_values: domain.data.marketingStrategy?.core_values || [],
        target_audience: domain.data.marketingStrategy?.audience || [],
        audience_pain_points: domain.data.marketingStrategy?.audiencePains || [],
        post_topic: formData.topic || '',
        post_description: formData.text,
        post_cta: formData.callToAction || '',
        post_based_url: formData.PostURL,
        post_link_url: activeTab === 'url' ? formData.url : '',
        post_tone: formData.tone || 'professional',
        post_platform: formData.platform || 'facebook',
      };

      // Make POST request to the third-party API
      const response = await axios.post(
        'https://social-api-107470285539.us-central1.run.app/generate-single-post',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const pubsubPayload = {
        post_id: response.data.post_id,
        client_id: domain.data.client_id,
        domainId: selectedWebsiteId,
        userId: user._id,
        image: response.data.image || "",
        topic: response.data.topic,
        related_keywords: response.data.related_keywords || [],
        content: response.data.content,
        slogan: response.data.slogan,
        postDate: response.data.date,
        platform: response.data.platform
      };

      await createPostViaPubSub(pubsubPayload);
      toast.success('Post generated and saved successfully!', {
        position: 'top-right',
        duration: 4000,
      });
      onGenerate?.();
    } catch (err) {
      let errorMessage = 'Something went wrong while generating your post. Please try again later.';
      
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = 'Invalid input provided. Please check your inputs and try again.';
            break;
          case 401:
            errorMessage = 'Authentication failed. Please log in again.';
            break;
          case 429:
            errorMessage = 'Too many requests. Please wait a moment and try again.';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again later.';
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message.includes('No selected website')
          ? err.message
          : err.message.includes('Domain not found')
          ? err.message
          : errorMessage;
      }

      toast.error(errorMessage, {
        position: 'top-right',
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  const renderTabContent = () => {
    return (
      <div className="space-y-6">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Platform (Optional)
          </label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a platform</option>
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
            Topic {activeTab === 'text' ? '(Required if no description)' : '(Optional)'}
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
              Description (Required if no topic)
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
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Link2 className="w-4 h-4 inline mr-2" />
                URL (Required)
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Description (Optional)
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Describe the content of the URL..."
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Link2 className="w-4 h-4 inline mr-2" />
            URL to Redirect (Optional)
          </label>
          <input
            type="text"
            value={formData.PostURL}
            onChange={(e) => setFormData({ ...formData, PostURL: e.target.value })}
            placeholder="e.g., Link you want to add to your post"
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Call to Action */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Target className="w-4 h-4 inline mr-2" />
            Call to Action (Optional)
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
            Tone (Optional)
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
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl w-[700px] max-h-[90vh] flex flex-col overflow-hidden shadow-xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-8 pt-12 pb-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Smart Post Builder for Any Platform
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Use this tool to generate a high-quality post for your chosen platform. Just enter a topic or description, and optionally add a link, call to action, and tone. We’ll turn your input into an engaging post tailored for your audience.
            </p>
          </div>
        </div>

        {/* Tabs with Tooltips */}
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

                {/* Tooltip */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="p-8">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              {renderTabContent()}
            </div>
            <div className="p-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isPubSubLoading}
                  className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 flex items-center gap-2 ${
                    isLoading || isPubSubLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading || isPubSubLoading ? 'Generating...' : 'Generate Post'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GeneratePostModal;