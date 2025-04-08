import React, { useState } from 'react';
import {
  Calendar,
  Edit,
  Trash2,
  Share2,
  Clock,
  Save,
  Check,
  Image,
  Palette,
  Type,
  Download, // ✅ added
} from 'lucide-react';
import { format } from 'date-fns';
import { PostEditModal } from './PostEditModal';

export const PostCard = ({
  post,
  onEdit,
  onDelete,
  onReschedule,
  onSaveToDraft,
  view,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedButton, setSelectedButton] = useState('image');
  const primaryPlatform = post.platforms[0];

  const baseStyles =
    'flex border-b border-light-border dark:border-dark-border rounded-3xl items-center justify-between gap-1 px-2 py-1 transition-colors';
  const selectedStyles = 'bg-blue-100 text-blue-700 hover:bg-blue-200';
  const unselectedStyles =
    'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';

  const getStatusBadge = () => {
    switch (post.status) {
      case 'draft':
        return (
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
            Draft
          </span>
        );
      case 'scheduled':
        return (
          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded">
            Scheduled
          </span>
        );
      case 'published':
        return (
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded">
            Published
          </span>
        );
      default:
        return null;
    }
  };

  const handleSave = (updatedPost) => {
    onEdit(updatedPost.id);
    setShowEditModal(false);
  };

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${
          view === 'grid' ? 'h-full flex flex-col' : ''
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <img
                src={post.businessLogo}
                alt="Business logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Kaz Routes
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                  ID: {post.id}
                </span>
                {getStatusBadge()}
              </div>
            </div>
          </div>

          {/* Visual Toggle Buttons */}
          <div className="flex items-center space-x-2 p-2">
            <h2 className="text-[12px] text-gray-500 dark:text-gray-400 rounded">
              Visual
            </h2>
            <div>
              <button
                onClick={() => setSelectedButton('image')}
                className={`${baseStyles} ${
                  selectedButton === 'image' ? selectedStyles : unselectedStyles
                }`}
              >
                <span className="text-[12px]">Image</span>
                <Image
                  className={`w-4 h-4 fill-none ${
                    selectedButton === 'image'
                      ? 'stroke-blue-700'
                      : 'stroke-gray-500 dark:stroke-gray-400'
                  }`}
                />
              </button>
            </div>
            <div>
              <button
                onClick={() => setSelectedButton('branding')}
                className={`${baseStyles} ${
                  selectedButton === 'branding'
                    ? selectedStyles
                    : unselectedStyles
                }`}
              >
                <span className="text-[12px]">Branding</span>
                <Palette
                  className={`w-4 h-4 fill-none ${
                    selectedButton === 'branding'
                      ? 'stroke-blue-700'
                      : 'stroke-gray-500 dark:stroke-gray-400'
                  }`}
                />
              </button>
            </div>
            <div>
              <button
                onClick={() => setSelectedButton('slogan')}
                className={`${baseStyles} ${
                  selectedButton === 'slogan' ? selectedStyles : unselectedStyles
                }`}
              >
                <span className="text-[12px]">Slogan</span>
                <Type
                  className={`w-4 h-4 fill-none ${
                    selectedButton === 'slogan'
                      ? 'stroke-blue-700'
                      : 'stroke-gray-500 dark:stroke-gray-400'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`p-4 space-y-4 ${view === 'grid' ? 'flex-1' : ''}`}>
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap line-clamp-2">
            {post.text}
          </p>
          <img
            src={post.imageUrl}
            alt="Post content"
            className={`w-full rounded-lg ${
              view === 'grid' ? 'h-48' : 'h-64'
            } object-cover`}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          {/* Left Section (Approve, Date, Platform) */}
          <div className="flex items-center gap-4 bg-primary p-4 rounded-lg">
            <button className="text-white bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 flex items-center gap-2">
              Approve
              <Check className="text-white" />
            </button>
            <div className="flex items-center">
              <Calendar className="h-3 w-3" />
              <span className="text-xs ml-1">
                {format(new Date(post.scheduledDate), 'MMM d, yyyy')}
              </span>
            </div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded capitalize">
              {primaryPlatform}
            </span>
          </div>

          {/* Right Section (Icons) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Edit post"
            >
              <Edit className="w-4 h-4" />
            </button>
            {post.status !== 'draft' && (
              <button
                onClick={() => onSaveToDraft(post.id)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Save to drafts"
              >
                <Save className="w-4 h-4" />
              </button>
            )}

            {/* ✅ NEW DOWNLOAD BUTTON */}
            <button
              onClick={() => console.log('Download clicked')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>

            {post.status === 'published' && (
              <div
                className="p-2 text-green-500 dark:text-green-400"
                title="Published"
              >
                <Check className="w-4 h-4" />
              </div>
            )}
            <button
              onClick={() => onDelete(post.id)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showEditModal && (
        <PostEditModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};
