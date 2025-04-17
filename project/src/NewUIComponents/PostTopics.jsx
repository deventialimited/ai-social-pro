import { CheckCircle, Plus } from "lucide-react";
import { FirstPostPopUp } from "./FirstPostPopUp";
import { useState } from "react";

const defaultTopics = [
  "Industry Tips & Tricks",
  "Behind the Scenes",
  "Customer Success Stories",
  "Product Showcase",
  "Industry News & Updates",
];

const PostTopics = ({ setComponentType }) => {
  const [topics, setTopics] = useState(defaultTopics);
  const [customTopic, setCustomTopic] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [PopUp, setPopup] = useState(false);

  const handleClosePopup = () => {
    setComponentType("postDetails");
  };

  const handleClick = () => {
    setPopup(true);
    console.log("Topic selected!");
  };

  const handleAddCustomTopic = () => {
    const trimmed = customTopic.trim();
    if (!trimmed || topics.includes(trimmed)) return;

    setTopics([...topics, trimmed]);
    setCustomTopic("");
    setShowInput(false);
  };

  return (
    <div className="w-full max-w-xl px-4 sm:px-6 mx-auto">
      <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
        Choose Your Content Topic
      </h3>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
        Select a trending topic or create your own
      </p>

      {/* Topics list */}
      <div className="mt-6 space-y-3">
        {topics.map((topic, index) => (
          <button
            key={index}
            onClick={handleClick}
            className="w-full flex items-center justify-between border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl hover:bg-green-100 dark:hover:bg-green-600 hover:text-gray-900 dark:hover:text-white transition"
          >
            <div className="flex items-center space-x-3 text-left">
              <CheckCircle className="text-green-500 w-5 h-5 shrink-0" />
              <span className="text-gray-800 dark:text-white font-medium text-sm sm:text-base">
                {topic}
              </span>
            </div>
            {index < 5 && (
              <span className="hidden sm:inline bg-purple-100 text-purple-600 text-xs font-semibold px-3 py-1 rounded-full">
                Trending
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add Custom Topic Buttons */}
      {!showInput ? (
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Custom Topic
          </button>
          <button
            onClick={() => {
              const randomTopic =
                defaultTopics[Math.floor(Math.random() * defaultTopics.length)];
              console.log("AI selected topic:", randomTopic);
              setPopup(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 dark:hover:bg-purple-800 hover:text-white transition text-sm"
          >
            🎯 Let AI Select Topic
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Enter custom topic"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white dark:focus:ring-purple-600"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddCustomTopic}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 dark:hover:bg-purple-800"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowInput(false);
                setCustomTopic("");
              }}
              className="border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {PopUp && (
        <FirstPostPopUp
          title="Time to Create Compelling Content!"
          description="We’re generating dynamic posts and stunning visuals that will make your social media shine and captivate your followers"
          isOpen={PopUp}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default PostTopics;
