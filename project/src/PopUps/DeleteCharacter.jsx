import React from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";

export const DeleteCharacterModal = ({ character, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-[500px] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="relative px-8 py-6 bg-gradient-to-br from-red-500 to-pink-500 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Delete Character
                </h2>
                <p className="text-white/80 text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
              {character.profileImage ? (
                <img
                  src={character.profileImage}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {character.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {character.bio}
              </p>
              {character.moreImages?.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {character.moreImages.length} additional images will also be
                    deleted
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                  Warning: This action is permanent
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Once you delete this character, all associated data including
                  the profile image, bio, and additional images will be
                  permanently removed.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Are you sure you want to delete <strong>{character.name}</strong>?
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Trash2 className="w-4 h-4" />
              Delete Character
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
