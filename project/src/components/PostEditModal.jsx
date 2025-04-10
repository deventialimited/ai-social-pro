import React, { useEffect, useState } from "react";
import { X, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MultiSelectDropdown from "./MultiSelectDropdown";
import toast from "react-hot-toast";
import GraphicEditorModal from "./GraphicEditorModal";

export const PostEditModal = ({ post, onClose, onSaveToDrafts }) => {
  console.log(post);
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [selectedSocials, setSelectedSocials] = useState([]);
  const socialOptions = ["Facebook", "X", "Instagram", "LinkedIn"];
  const [isGraphicEditorModal, setIsGraphicEditorModal] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setTopic(post?.topic);
    setContent(post?.content);
    setSelectedSocials([...post?.platforms]);
  }, [post]);
  const handlenavigate = () => {
    // setShowGraphicEditor(true)
    // navigate('/fulleditor');
    window.location.href = "/fulleditor";
  };
  // Function to validate if any changes were made
  const validateChanges = () => {
    const hasTopicChanged = topic !== (post?.topic || "");
    const hasContentChanged = content !== (post?.content || "");
    const hasPlatformsChanged =
      JSON.stringify(selectedSocials.sort()) !==
      JSON.stringify((post?.platforms || []).sort());

    return hasTopicChanged || hasContentChanged || hasPlatformsChanged;
  };
  const handleSaveToDrafts = () => {
    if (!validateChanges()) {
      // Show toast message if no changes were made
      toast.error("No changes made to the post.");
      onClose();
      return;
    }
    onSaveToDrafts({
      ...post,
      topic,
      content,
      platforms: selectedSocials,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <GraphicEditorModal
        post={post}
        isGraphicEditorModal={isGraphicEditorModal}
        setIsGraphicEditorModal={setIsGraphicEditorModal}
      />
      <div className="bg-white dark:bg-gray-800 rounded-xl w-[680px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Post
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Topic */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-6">
            {/* Content */}
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[200px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your post text..."
              />
            </div>

            {/* Image */}
            <div className="w-[280px] space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Image
                </label>
                <button
                  onClick={() => setIsGraphicEditorModal(true)}
                  // onClick={handlenavigate}
                  className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  Edit Design
                </button>
              </div>
              <div className="relative group">
                <img
                  src={post.image}
                  alt="Post preview"
                  className="w-full h-[200px] object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="">
            <MultiSelectDropdown
              options={socialOptions}
              selectedOptions={selectedSocials}
              onChange={setSelectedSocials}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveToDrafts}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Save to Drafts
            </button>
            <button className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-1">
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
