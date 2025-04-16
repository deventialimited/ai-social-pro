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
    // setPopup(false);
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
    <div className="w-full max-w-xl mx-auto">
      <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
        Choose Your Content Topic
      </h3>
      <p className="text-center text-sm text-gray-500 mt-1">
        Select a trending topic or create your own
      </p>

      {/* Topics list */}
      <div className="mt-6 space-y-3">
        {topics.map((topic, index) => (
          <button
            key={index}
            onClick={handleClick}
            className="w-full flex items-center justify-between border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl hover:bg-green-100 transition"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500 w-5 h-5" />
              <span className="text-gray-800 dark:text-white font-medium">
                {topic}
              </span>
            </div>
            {index < 5 && (
              <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-3 py-1 rounded-full">
                Trending
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add Custom Topic Button */}
      {!showInput ? (
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Custom Topic
          </button>
          <button
            onClick={() => {
              // You can modify this logic to select a topic using AI
              const randomTopic =
                defaultTopics[Math.floor(Math.random() * defaultTopics.length)];
              console.log("AI selected topic:", randomTopic);
              setPopup(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition text-sm"
          >
            🎯 Let AI Select Topic
          </button>
        </div>
      ) : (
        <div className="mt-6 flex gap-2">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Enter custom topic"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleAddCustomTopic}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Add
          </button>
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
