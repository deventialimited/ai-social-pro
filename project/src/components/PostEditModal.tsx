import React, { useState } from 'react';
import { X, Pencil } from 'lucide-react';
import { Post } from '../types';
import { GraphicEditor } from './GraphicEditor';
import { useNavigate } from 'react-router-dom';

interface PostEditModalProps {
  post: Post;
  onClose: () => void;
  onSave: (updatedPost: Post) => void;
}

export const PostEditModal: React.FC<PostEditModalProps> = ({ post, onClose, onSave }) => {
  const [editedText, setEditedText] = useState(post.text);
  // const [showGraphicEditor, setShowGraphicEditor] = useState(false);
  const navigate = useNavigate();


const handlenavigate = () => {
  navigate('/fulleditor');
  
};
  const handleSave = () => {
    onSave({
      ...post,
      text: editedText,
    });
  };

  if (showGraphicEditor) {
    return (
      <GraphicEditor
        post={post}
        onClose={() => setShowGraphicEditor(false)}
        onSave={(updatedPost) => {
          onSave(updatedPost);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-[680px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Post</h2>
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
              value="A Quick Tax Tip for Freelancers"
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
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
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
                  // onClick={() => setShowGraphicEditor(true)}
                onClick={handlenavigate}
                  className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  Edit Design
                </button>
              </div>
              <div className="relative group">
                <img
                  src={post.imageUrl}
                  alt="Post preview"
                  className="w-full h-[200px] object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Publish to</span>
            <select className="bg-transparent border-0 text-sm text-gray-900 dark:text-white focus:ring-0">
              <option>all socials</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Save to Drafts
            </button>
            <button
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-1"
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};