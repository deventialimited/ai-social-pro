import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';

interface SocialConnectModalProps {
  platform: string;
  onClose: () => void;
  onConnect: () => void;
}

export const SocialConnectModal: React.FC<SocialConnectModalProps> = ({
  platform,
  onClose,
  onConnect,
}) => {
  const [isContinuing, setIsContinuing] = useState(false); // Add loading state

  const getInstructions = () => {
    switch (platform.toLowerCase()) {
      case 'facebook page':
        return [
          'You will first be redirected to Facebook sign-in.',
          'Unfortunately, Facebook requires that you have a Facebook page to use Instagram.',
          'Your Instagram account must be a business account.',
          'You must have a Facebook page (it can be a dummy page).',
          'You must connect your Instagram to your Facebook page.',
          'We recommend you to click "Opt into all current and future" when prompted during the auth flow.',
        ];
      case 'instagram':
        return [
          'You must have a business Instagram account.',
          'Your Instagram account must be connected to a Facebook page.',
          'Allow all requested permissions for full functionality.',
        ];
      case 'linkedin company page':
      case 'linkedin personal profile':
        return [
          'You will be redirected to LinkedIn sign-in.',
          'Grant access to post on your behalf.',
          'Select the pages you want to manage.',
        ];
      default:
        return [
          `You will be redirected to ${platform} sign-in.`,
          'Grant necessary permissions for posting.',
          'Follow the authentication steps.',
        ];
    }
  };

  const handleConnect = () => {
    setIsContinuing(true); // Set loading state to true
    onConnect(); // Call the onConnect function
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-[500px] overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Connect to {platform}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Before you connect
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please review these important steps
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {getInstructions().map((instruction, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50
                  border border-gray-200 dark:border-gray-700"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center
                  text-sm font-medium text-blue-600 dark:text-blue-400">
                  {index + 1}
                </div>
                <p className="flex-1 text-gray-600 dark:text-gray-400">
                  {instruction}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 
                hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              disabled={isContinuing} // Disable Cancel button while continuing
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md 
                hover:from-blue-700 hover:to-purple-700 flex items-center justify-center min-w-[120px] transition-colors"
              disabled={isContinuing} // Disable Continue button while continuing
            >
              {isContinuing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Continuing...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};