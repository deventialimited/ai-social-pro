import React, { useState } from "react";
import { Sparkles } from "lucide-react";

const AIImageCustomizationModal = ({ selectedIdea, onClose, onGenerate }) => {
  const [slogan, setSlogan] = useState("My Slogan will be here");
  const [selectedStyle, setSelectedStyle] = useState("None");
  const styles = [
    "None",
    "Photo",
    "Illustration",
    "3D",
    "Packshot",
    "Painting",
    "Sketch",
    "Fantasy",
    "Cartoon",
    "Pop Art",
    "Background",
    "Collage",
  ];

  const handleGenerate = () => {
    onGenerate({ text: slogan, style: selectedStyle });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Customize Your AI Image
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {selectedIdea?.title}
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600 dark:text-blue-400">T</span>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Add Your Text or Slogan
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Make your image uniquely yours with custom text
          </p>
          <textarea
            className="w-full h-16 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            placeholder="My Slogan will be here"
            maxLength={100}
          />
          <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
            {slogan.length}/100
          </div>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-600 dark:text-purple-400">🖌️</span>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Choose Your Style
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Select the artistic style that matches your vision
          </p>
          <div className="grid grid-cols-3 gap-2">
            {styles.map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  selectedStyle === style
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Preview Settings
          </h3>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <p>
              Concept:{" "}
              <span className="font-medium">{selectedIdea?.title}</span>
            </p>
            <p>
              Style: <span className="font-medium">{selectedStyle}</span>
            </p>
            <p>
              Text: <span className="font-medium">{slogan}</span>
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate AI Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIImageCustomizationModal;
