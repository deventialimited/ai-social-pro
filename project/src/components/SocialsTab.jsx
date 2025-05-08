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

export const SocialsTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [platformToDisconnect, setPlatformToDisconnect] = useState(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedDays, setSelectedDays] = useState(["Mon", "Wed", "Fri"]);
  const [publishingTimes, setPublishingTimes] = useState("03:00 PM");
  const [randomizeTime, setRandomizeTime] = useState("0 min (disabled)");
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [loading, setLoading] = useState(false);
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
    try {
      const result = await disconnectPlatform(user._id, platformToDisconnect);

      setConnectedPlatforms((prev) =>
        prev.filter(
          (p) => p.platformName.toLowerCase() !== platformToDisconnect
        )
      );
      setPlatformToDisconnect(null); // Reset after disconnect
      console.log("user:", result);
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
      times: publishingTimes, // publishingTimes is now a single string
      randomize: randomizeTime,
    };

    try {
      setLoading(true);
      const response = await updatePostSchedule(user._id, postScheduleData);
      console.log("Schedule saved to backend:", response);
      localStorage.setItem("user", JSON.stringify(response.user));
      setLoading(false);
      setIsEditingSchedule(false);
      // Optionally update localStorage or show toast
    } catch (error) {
      console.error("Failed to save schedule:", error);
      // Optionally show toast error
    }
  };

  const getSelectedDaysString = () => {
    return selectedDays.join(", ");
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Publishing Schedule UI */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isEditingSchedule ? (
          <>
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Publishing Schedule
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                When you click <span className="italic">schedule</span> on a
                post, we will schedule it to go out at these times.
              </p>
            </div>

            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select publishing days
              </h3>
              <div className="flex flex-wrap gap-3">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDaySelection(day)}
                    className={`w-20 py-2 px-3 rounded-lg border transition-colors ${
                      selectedDays.includes(day)
                        ? "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300"
                        : "bg-white border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                At
              </h3>
              <input
                type="time"
                value={publishingTimes.split(" ")[0]} // Extract time part for the input
                onChange={(e) => {
                  const hours = parseInt(e.target.value.split(":")[0]);
                  const mins = e.target.value.split(":")[1];
                  const period = hours >= 12 ? "PM" : "AM";
                  const displayHours =
                    hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
                  updatePublishingTime(
                    `${displayHours
                      .toString()
                      .padStart(2, "0")}:${mins} ${period}`
                  );
                }}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pr-10"
              />
            </div>

            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Randomize posting time by +/-
                  </span>
                  <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                    <Info className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative w-64">
                  <select
                    value={randomizeTime}
                    onChange={(e) => setRandomizeTime(e.target.value)}
                    className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none"
                  >
                    <option>0 min (disabled)</option>
                    <option>15 min</option>
                    <option>30 min</option>
                    <option>60 min</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 flex justify-end gap-4">
              {loading ? (
                <button
                  disabled
                  className="flex items-center px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg cursor-not-allowed"
                >
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700 dark:text-gray-200"
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
                  Saving...
                </button>
              ) : (
                <button
                  onClick={handleSaveSchedule}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  Save
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Publishing Schedule
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                When you click <span className="italic">schedule</span> on a
                post, we will schedule it to go out at these times.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">
                Post on
              </h3>
              <p className="text-lg text-gray-900 dark:text-white">
                {getSelectedDaysString()}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">
                At
              </h3>
              <p className="text-lg text-gray-900 dark:text-white">
                {publishingTimes}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">
                Vary posting by
              </h3>
              <div className="flex items-center">
                <span className="text-lg text-gray-900 dark:text-white">
                  {randomizeTime}
                </span>
                <Info className="w-4 h-4 text-gray-500 ml-2" />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsEditingSchedule(true)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Edit Schedule
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Connect Your Socials (Existing code) */}
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
                    >
                      <X className="w-5 h-5" />
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
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
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
