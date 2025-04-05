import React, { useState } from 'react';
import { X, Globe, Loader2, Briefcase, Palette, Target, Check, ArrowRight } from 'lucide-react';
import { addDomain } from '../libs/domainService';
import { json } from 'react-router-dom';
export const AddWebsiteModal = ({ onClose, onGenerate }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [businessData, setBusinessData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
const [error, setError] = useState(null);
  const steps = [
    { 
      title: 'Scanning Website',
      description: 'Analyzing content and structure',
      icon: '🔍',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'Extracting Business Data',
      description: 'Identifying key business information',
      icon: '💼',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'Analyzing Brand',
      description: 'Detecting colors, style, and tone',
      icon: '🎨',
      color: 'from-yellow-500 to-orange-500'
    },
    { 
      title: 'Building Strategy',
      description: 'Creating marketing approach',
      icon: '🎯',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'Generating Ideas',
      description: 'Crafting engaging content suggestions',
      icon: '✨',
      color: 'from-indigo-500 to-violet-500'
    }
  ];

  // const simulateDataExtraction = async () => {
  //   setIsLoading(true);
  //   setProgress(0);
  //   setCurrentStep(0);

  //   for (let i = 0; i < steps.length; i++) {
  //     setCurrentStep(i);
  //     for (let p = 0; p <= 100; p += 2) {
  //       setProgress((i * 100 + p) / steps.length);
  //       await new Promise(resolve => setTimeout(resolve, 30));
  //     }
  //   }

  //   // Simulate fetched business data
  //   const mockBusinessData = {
  //     name: 'Example Business',
  //     description: 'A company that provides innovative solutions for modern businesses, focusing on digital transformation and sustainable growth.',
  //     industry: 'Technology',
  //     niche: 'Software Development',
  //     website: url,
  //     language: 'English',
  //     country: 'United States',
  //     region: 'North America',
  //     logo: '/kaz-routes-logo.png',
  //     logoBackground: 'white',
  //     headshot: '',
  //     brandColor: '#FF6B6B',
  //     backgroundColor: '#FFFFFF',
  //     textColor: '#000000',
  //     marketingStrategy: {
  //       audience: [
  //         'Tech-savvy professionals',
  //         'Small business owners',
  //         'Enterprise companies'
  //       ],
  //       audiencePains: [
  //         'Complex software solutions',
  //         'Integration challenges',
  //         'Technical support needs'
  //       ],
  //       coreValues: [
  //         'Innovation',
  //         'Reliability',
  //         'Customer Success'
  //       ]
  //     }
  //   };

  //   setBusinessData(mockBusinessData);
  //   setIsLoading(false);
  // };
  const user = JSON.parse(localStorage.getItem('user'));
  console.log(user)
  const simulateDataExtraction = async () => {
    setIsLoading(true);
    setProgress(0);
    setCurrentStep(0);
    setError(null); // Reset any previous errors

    try {
      // Simulate progress
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        for (let p = 0; p <= 100; p += 2) {
          setProgress((i * 100 + p) / steps.length);
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }

      // Simulated fetched business data (replace with real API call if needed)
      const mockBusinessData = {
        name: 'Example Business',
        description: 'A company that provides innovative solutions for modern businesses, focusing on digital transformation and sustainable growth.',
        industry: 'Technology',
        niche: 'Software Development',
        website: url,
        language: 'English',
        country: 'United States',
        region: 'North America',
        logo: '/kaz-routes-logo.png',
        logoBackground: 'white',
        headshot: '',
        brandColor: '#FF6B6B',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        marketingStrategy: {
          audience: ['Tech-savvy professionals', 'Small business owners', 'Enterprise companies'],
          audiencePains: ['Complex software solutions', 'Integration challenges', 'Technical support needs'],
          coreValues: ['Innovation', 'Reliability', 'Customer Success'],
        },
      };

      // Map businessData to the backend schema
      const domainData = {
        client_email: user.email, // Add logic to collect email if needed
        clientWebsite: mockBusinessData.website,
        clientName: mockBusinessData.name,
        clientDescription: mockBusinessData.description,
        industry: mockBusinessData.industry,
        niche: mockBusinessData.niche,
       colors: JSON.stringify({
    brandColor: mockBusinessData.brandColor,
    backgroundColor: mockBusinessData.backgroundColor,
    textColor: mockBusinessData.textColor,
  }),
        userId: user._id, // Replace with actual user ID (e.g., from auth context)
        core_values: mockBusinessData.marketingStrategy.coreValues.join('\n'),
        audience: mockBusinessData.marketingStrategy.audience.join('\n'),
        audiencePains: mockBusinessData.marketingStrategy.audiencePains.join('\n'),
        language: mockBusinessData.language,
        country: mockBusinessData.country,
        state: mockBusinessData.region, // Mapping region to state
      };

      // Save to database using addDomain
      const savedData = await addDomain(domainData);
      console.log('Data saved to database:', savedData);

      setBusinessData(mockBusinessData); // Display the mock data in UI
    } catch (err) {
      setError('Failed to save data to the database. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (url) {
  //     if (!businessData) {
  //       await simulateDataExtraction();
  //     } else {
  //       onGenerate(url); 
      
  //       onClose();
  //     }
  //   }
  // };
const handleSubmit = async (e) => {
    e.preventDefault();
    if (url) {
      if (!businessData) {
        await simulateDataExtraction();
      } else {
        onGenerate(url); // Proceed to generate posts
        onClose(); // Close the modal
      }
    }
  };
  const renderBusinessCard = (
    title,
    icon,
    content,
    className
  ) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {content}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl w-[900px] max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Business
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {!businessData && !isLoading && (
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                  <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  Enter your website URL
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We'll analyze your website and create a year's worth of engaging social media content tailored to your brand.
                </p>
                <div className="relative mt-6">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-lg"
                    required
                  />
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            )}

            {isLoading && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="relative h-6">
                  {/* Progress bar container */}
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    {/* Animated progress bar */}
                    <div
                      className="h-full transition-all duration-300 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient relative"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {/* Floating percentage indicator */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 bg-white dark:bg-gray-800 rounded-full px-2 py-0.5 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-1"
                    style={{ 
                      left: `${Math.min(Math.max(progress, 3), 97)}%`,
                      transform: `translate(-50%, -50%)`
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className={`transform transition-all duration-500 ${
                        index === currentStep 
                          ? 'scale-100 opacity-100' 
                          : index < currentStep
                          ? 'scale-95 opacity-50'
                          : 'scale-95 opacity-30'
                      }`}
                    >
                      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl
                          ${index <= currentStep ? `bg-gradient-to-r ${step.color}` : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                          {index < currentStep ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : (
                            <span>{step.icon}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {step.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {businessData && (
              <div className="grid grid-cols-2 gap-6">
                {renderBusinessCard(
                  'Business Profile',
                  <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Name', value: businessData.name },
                        { label: 'Industry', value: businessData.industry },
                        { label: 'Country', value: businessData.country },
                        { label: 'Language', value: businessData.language }
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{item.label}</div>
                          <div className="text-gray-900 dark:text-white font-medium">{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Description</div>
                      <div className="text-gray-900 dark:text-white">{businessData.description}</div>
                    </div>
                  </div>,
                  'col-span-2'
                )}

                {renderBusinessCard(
                  'Brand Identity',
                  <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-xl bg-white shadow-sm flex items-center justify-center">
                        <img src={businessData.logo} alt="Logo" className="w-16 h-16 object-contain" />
                      </div>
                      <div className="flex gap-3">
                        {[
                          { color: businessData.brandColor, label: 'Brand' },
                          { color: businessData.backgroundColor, label: 'Background' },
                          { color: businessData.textColor, label: 'Text' }
                        ].map((item, i) => (
                          <div key={i} className="text-center">
                            <div 
                              className="w-12 h-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {renderBusinessCard(
                  'Marketing Strategy',
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />,
                  <div className="space-y-4">
                    {[
                      { 
                        title: 'Target Audience',
                        items: businessData.marketingStrategy.audience,
                        className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      },
                      {
                        title: 'Pain Points',
                        items: businessData.marketingStrategy.audiencePains,
                        className: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      },
                      {
                        title: 'Core Values',
                        items: businessData.marketingStrategy.coreValues,
                        className: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }
                    ].map((section, i) => (
                      <div key={i}>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {section.title}
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {section.items.map((item, j) => (
                            <span
                              key={j}
                              className={`px-3 py-1 rounded-full text-sm ${section.className}`}
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              {businessData ? (
                <>
                  <button
                    type="button"
                    onClick={() => setBusinessData(null)}
                    className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                  >
                    Generate Posts
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      Create Posts
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};