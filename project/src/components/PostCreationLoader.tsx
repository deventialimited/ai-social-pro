import React from 'react';
import { FileText, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface PostCreationLoaderProps {
  type: 'url-post' | 'url-article' | 'image-post' | 'text-post';
}

export const PostCreationLoader: React.FC<PostCreationLoaderProps> = ({ type }) => {
  const getSteps = (): Step[] => {
    const commonSteps: Step[] = [
      {
        title: 'Analyzing Content',
        description: 'Processing input and extracting key information',
        icon: <FileText className="w-5 h-5" />,
        color: 'from-blue-500 to-cyan-500'
      },
      {
        title: 'Generating Copy',
        description: 'Creating engaging social media content',
        icon: <Sparkles className="w-5 h-5" />,
        color: 'from-purple-500 to-pink-500'
      },
      {
        title: 'Creating Visuals',
        description: 'Designing platform-optimized graphics',
        icon: <ImageIcon className="w-5 h-5" />,
        color: 'from-orange-500 to-yellow-500'
      }
    ];

    return commonSteps;
  };

  const [currentStep, setCurrentStep] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const steps = getSteps();

  React.useEffect(() => {
    const simulateProgress = async () => {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        for (let p = 0; p <= 100; p += 2) {
          setProgress((i * 100 + p) / steps.length);
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }
    };

    simulateProgress();
  }, []);

  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="relative mb-8">
          {/* Progress bar */}
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
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

        <div className="space-y-4">
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
              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                  ${index <= currentStep ? `bg-gradient-to-r ${step.color}` : 'bg-gray-100 dark:bg-gray-700'}`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <div className="text-white">{step.icon}</div>
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
    </div>
  );
};