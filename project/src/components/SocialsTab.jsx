import React, { useState, useEffect } from "react";
import {
  Settings,
  X,
  Sparkles,
  Clock,
  Calendar,
  Info,
  Plus,
} from "lucide-react";
import { SocialConnectModal } from "./SocialConnectModal";
import { disconnectPlatform, updatePostSchedule } from "../libs/authService";
import { useAuthStore } from "../store/useAuthStore";
import toast from 'react-hot-toast'
// Disconnect Icon Component
const DisconnectIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.181 8.68a4.503 4.503 0 0 1 1.903 6.405m-9.768-2.782L3.56 14.06a4.5 4.5 0 0 0 6.364 6.365l3.129-3.129m5.614-5.615 1.757-1.757a4.5 4.5 0 0 0-6.364-6.365l-4.5 4.5c-.258.26-.479.541-.661.84m1.903 6.405a4.495 4.495 0 0 1-1.242-.88 4.483 4.483 0 0 1-1.062-1.683m6.587 2.345 5.907 5.907m-5.907-5.907L8.898 8.898M2.991 2.99 8.898 8.9"
    />
  </svg>
);

export const SocialsTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [platformToDisconnect, setPlatformToDisconnect] = useState(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [user, setuser] = useState(null);
  const [selectedDays, setSelectedDays] = useState(["Mon", "Wed", "Fri"]);
  const [publishingTimes, setPublishingTimes] = useState("03:00 PM");
  const [randomizeTime, setRandomizeTime] = useState("0 min (disabled)");
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const { setUser } = useAuthStore();

  useEffect(() => {
    const getUserFromStorage = () => {
      const userString = localStorage.getItem("user");
      try {
        return JSON.parse(userString || '{"PlatformConnected": []}');
      } catch (e) {
        console.error("Invalid user in localStorage");
        return { PlatformConnected: [] };
      }
    };

    const storedUser = getUserFromStorage();
    console.log("pub time:", storedUser);
    setPublishingTimes(storedUser?.postSchedule?.publishingTimes || "00:00 PM");
    setRandomizeTime(
      storedUser?.postSchedule?.randomizeTime || "0 min (dummy)"
    );
    setSelectedDays(storedUser?.postSchedule?.selectedDays || ["Mon", "Wed"]);
    setuser(storedUser);
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
      url: `https://oneyearsocial.com/facebookLogin?uid=${user?._id}`,
    },
    {
      name: "Instagram",
      key: "instagram",
      icon: "https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/instagram.svg",
      url: `https://oneyearsocial.com/instagramLogin?uid=${user?._id}`,
    },
    {
      name: "X",
      key: "x",
      icon: "https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/twitter.svg",
      url: ` https://oneyearsocial.com/twitterLogin?uid=${user?._id}`,
    },
    {
      name: "LinkedIn",
      key: "linkedin",
      icon: "https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/linkedin.svg",
      url: ` https://oneyearsocial.com/linkedInLogin?uid=${user?._id}`,
    },
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleConnect = (platformName) => {
    const platform = platforms.find((p) => p.name === platformName);
    if (platform) {
      setSelectedPlatform(platform);
      setShowModal(true);
    }
  };

  const handleDisconnect = async () => {
    if (!user || !platformToDisconnect) return;

    const disconnectUrls = {
      facebook: "https://oneyearsocial.com/disconnectFacebook",
      instagram: "https://oneyearsocial.com/disconnectInstagram",
      x: "https://oneyearsocial.com/disconnectTwitter",
      linkedin: "https://oneyearsocial.com/disconnectLinkedIn",
    };

    try {
      setDisconnecting(true);

      // First call the appropriate disconnect URL based on the platform
      const disconnectUrl = disconnectUrls[platformToDisconnect];
      if (disconnectUrl) {
        const response = await fetch(disconnectUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid: user._id }),
        });

        if (!response.ok) {
          throw new Error(`Failed to disconnect from ${platformToDisconnect}`);
        }
        else{
          toast.success(`${platformToDisconnect} disconnected`)
        }
      }

      // Only proceed to disconnect from our database if the platform disconnect was successful
      const result = await disconnectPlatform(user._id, platformToDisconnect);

      setConnectedPlatforms((prev) =>
        prev.filter(
          (p) => p.platformName.toLowerCase() !== platformToDisconnect
        )
      );
      console.log("user:", result);
      setUser(result?.user);
    } catch (error) {
      console.error("Failed to disconnect platform:", error);
    } finally {
      setDisconnecting(false);
      setPlatformToDisconnect(null);
    }
  };

  const handleContinueConnect = () => {
    if (selectedPlatform?.url) {
      window.location.href=selectedPlatform.url
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

  const toggleDaySelection = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const updatePublishingTime = (newTime) => {
    setPublishingTimes(newTime);
  };

  const removePublishingTime = (index) => {
    if (publishingTimes.length > 1) {
      setPublishingTimes(publishingTimes.filter((_, i) => i !== index));
    }
  };

  const handleSaveSchedule = async () => {
    if (!user || !user._id) {
      console.error("User not found");
      return;
    }

    const postScheduleData = {
      days: selectedDays,
      times: publishingTimes,
      randomize: randomizeTime,
    };

    try {
      setLoading(true);
      const response = await updatePostSchedule(user._id, postScheduleData);
      console.log("Schedule saved to backend:", response);
      setUser(response?.user);
      setLoading(false);
      setIsEditingSchedule(false);
    } catch (error) {
      console.error("Failed to save schedule:", error);
    }
  };

  const getSelectedDaysString = () => {
    return selectedDays.join(", ");
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Connect Your Socials */}
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
                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 
                        hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Disconnect"
                      disabled={disconnecting}
                    >
                      <DisconnectIcon />
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

      {/* Modals */}
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
                disabled={disconnecting}
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center min-w-[120px]"
                disabled={disconnecting}
              >
                {disconnecting ? (
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
                    Disconnecting...
                  </>
                ) : (
                  "Yes, Disconnect"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
