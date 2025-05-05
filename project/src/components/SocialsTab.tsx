import React, { useState } from 'react';
import { Settings, X, Sparkles } from 'lucide-react';
import { SocialConnectModal } from './SocialConnectModal';
import { useNavigate } from 'react-router-dom';

interface ConnectedAccount {
  id: string;
  name: string;
  platform: string;
}

interface SocialPlatform {
  name: string;
  icon: string;
  connected?: ConnectedAccount;
  url?: string;
}

export const SocialsTab: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      name: 'Facebook Page',
      icon: 'https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/facebook.svg',
      connected: {
        id: '1',
        name: 'Accountantbff - Digital Marketing',
        platform: 'facebook'
      }
    },
    {
      name: 'Instagram',
      icon: 'https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/instagram.svg'
    },
    {
      name: 'Instagram Story',
      icon: 'https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/instagram.svg'
    },
    {
      name: 'X (Twitter)',
      icon: 'https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/twitter.svg',
      url: `https://us-central1-socialmediabranding-31c73.cloudfunctions.net/api/twitterLogin?uid=${user?._id}`
    },
    // {
    //   name: 'LinkedIn Company Page',
    //   icon: 'https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/linkedin.svg'
    // },
    {
      name: 'LinkedIn Personal Profile',
      icon: 'https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/linkedin.svg',
      url:`https://us-central1-socialmediabranding-31c73.cloudfunctions.net/api/linkedInLogin?uid=${user._id}`
    },
    {
      name: 'TikTok',
      icon: 'https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/tiktok.svg'
    },
    {
      name: 'Pinterest',
      icon: 'https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/pinterest.svg'
    }
  ]);

  const handleConnect = (platformName: string) => {
    const platform = platforms.find(p => p.name === platformName);
    if (platform) {
      setSelectedPlatform(platform);
      setShowModal(true);
    }
  };

  const handleDisconnect = (platformName: string) => {
    setPlatforms(platforms.map(p => 
      p.name === platformName ? { ...p, connected: undefined } : p
    ));
  };

const handleContinueConnect = () => {
  if (selectedPlatform?.url) {
    window.open(selectedPlatform.url, '_blank');
    return; // exit early to avoid marking as connected or closing the modal
  }

  // Fallback logic (if no URL, simulate connection)
  setPlatforms(platforms.map(p => 
    p.name === selectedPlatform?.name 
      ? { 
          ...p, 
          connected: {
            id: Math.random().toString(),
            name: 'Connected Account',
            platform: p.name.toLowerCase()
          }
        } 
      : p
  ));

  setShowModal(false);
};


  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Connect Your Socials
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Connect your social media accounts to allow OneYear to post on your behalf.
          </p>
        </div>

        <div className="p-8 space-y-4">
          {platforms.map((platform) => (
            <div 
              key={platform.name}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <img 
                    src={platform.icon} 
                    alt={platform.name}
                    className="w-5 h-5"
                  />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {platform.name}
                </h3>
              </div>

              {platform.connected ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400 px-3 py-1 bg-gray-50 dark:bg-gray-700 rounded-md">
                    {platform.connected.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 
                        hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDisconnect(platform.name)}
                      className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 
                        hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Disconnect"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(platform.name)}
                  className="px-4 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 
                    dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedPlatform && (
        <SocialConnectModal
          platform={selectedPlatform.name}
          onClose={() => setShowModal(false)}
          onConnect={handleContinueConnect}
        />
      )}
    </div>
  );
};
