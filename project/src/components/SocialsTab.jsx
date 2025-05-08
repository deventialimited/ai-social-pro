import React, { useState, useEffect } from "react";
import { Settings, X, Sparkles } from "lucide-react";
import { SocialConnectModal } from "./SocialConnectModal";
import { disconnectPlatform } from "../libs/authService";

export const SocialsTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [platformToDisconnect, setPlatformToDisconnect] = useState(null); // NEW
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const getUserFromStorage = () => {
      const userString = localStorage.getItem("user");
      try {
        return JSON.parse(userString);
      } catch (e) {
        console.error("Invalid user in localStorage");
        return null;
      }
    };

    const storedUser = getUserFromStorage();

    setUser(storedUser);
    setConnectedPlatforms(storedUser?.PlatformConnected || []);
    console.log(
      "Connected platforms from localStorage:",
      storedUser?.PlatformConnected 
    );
  }, []);

  const platforms = [
    {
      name: "Facebook",
      key: "facebook",
      icon: "https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/facebook.svg",
    },
    {
      name: "Instagram",
      key: "instagram",
      icon: "https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/instagram.svg",
    },
    {
      name: "X",
      key: "x",
      icon: "https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/twitter.svg",
      url: `https://us-central1-socialmediabranding-31c73.cloudfunctions.net/api/twitterLogin?uid=${user?._id}`,
    },
    {
      name: "LinkedIn Personal Profile",
      key: "linkedin",
      icon: "https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/linkedin.svg",
      url: `https://us-central1-socialmediabranding-31c73.cloudfunctions.net/api/linkedInLogin?uid=${user?._id}`,
    },
  ];

  const handleConnect = (platformName) => {
    const platform = platforms.find((p) => p.name === platformName);
    if (platform) {
      setSelectedPlatform(platform);
      setShowModal(true);
    }
  };

  const handleDisconnect = async () => {
    if (!user || !platformToDisconnect) return;
    try {
      const result = await disconnectPlatform(user._id, platformToDisconnect);

      setConnectedPlatforms((prev) =>
        prev.filter(
          (p) => p.platformName.toLowerCase() !== platformToDisconnect
        )
      );
      setPlatformToDisconnect(null); // Reset after disconnect
      localStorage.setItem("user", JSON.stringify(result.user));
    } catch (error) {
      console.error("Failed to disconnect platform:", error);
    }
  };

  const handleContinueConnect = () => {
    if (selectedPlatform?.url) {
      window.open(selectedPlatform.url, "_blank");
      return;
    }

    setConnectedPlatforms((prev) => [
      ...prev,
      {
        platformName: selectedPlatform.key,
        status: "connected",
      },
    ]);

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
            Connect your social media accounts to allow OneYear to post on your
            behalf.
          </p>
        </div>

        <div className="p-8 space-y-4">
          {platforms.map((platform) => {
            const isConnected = connectedPlatforms.some(
              (p) => p.platformName.toLowerCase() === platform.key
            );

            return (
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

                {isConnected ? (
                  <div className="flex items-center gap-4">
                    <button
                      className="px-4 py-1.5 text-sm bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-md cursor-not-allowed"
                      disabled
                    >
                      Connected
                    </button>
                    <button
                      onClick={() => setPlatformToDisconnect(platform.key)}
                      className="p-2 text-white bg-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 
                        hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Disconnect"
                    >
                      Disconnect
                    </button>
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
            );
          })}
        </div>
      </div>

      {showModal && selectedPlatform && (
        <SocialConnectModal
          platform={selectedPlatform.name}
          onClose={() => setShowModal(false)}
          onConnect={handleContinueConnect}
        />
      )}

      {platformToDisconnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Disconnect Platform
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to disconnect this platform? You can always
              reconnect later.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPlatformToDisconnect(null)}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDisconnect();
                  setPlatformToDisconnect(null);
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Yes, Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
