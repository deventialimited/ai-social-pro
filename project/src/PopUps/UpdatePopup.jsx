import React, { useState, useRef } from "react";
import { X, User, FileText, Upload, Image, Trash2, Plus } from "lucide-react";

export const CharacterModal = ({ character, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: character?.name || "",
    bio: character?.bio || "",
    profileImage: character?.profileImage || "",
    moreImages: character?.moreImages || [],
  });

  const profileImageInputRef = useRef(null);
  const moreImagesInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
  };

  const handleMoreImagesUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      moreImages: [...prev.moreImages, ...newImageUrls].slice(0, 20),
    }));
  };

  const removeMoreImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      moreImages: prev.moreImages.filter((_, i) => i !== index),
    }));
  };

  const isFormValid = formData.name.trim() && formData.bio.trim();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-[900px] max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="relative px-8 py-6 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {character ? "Edit Character" : "Create New Character"}
                </h2>
                <p className="text-white/80 text-sm">
                  Define a unique persona for your content creation
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
        <div
          className="p-8 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Image and Name */}
            <div className="flex gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Profile Image
                </label>
                <div
                  className="relative group cursor-pointer overflow-hidden rounded-xl w-32 h-32 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                  onClick={() => profileImageInputRef.current?.click()}
                >
                  {formData.profileImage ? (
                    <>
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <Image className="w-8 h-8 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                        Click to upload
                      </span>
                    </div>
                  )}
                </div>
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Character Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Peter Garcia, Elena CPA, Marketing Mike"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Comprehensive Bio *
              </label>
              <div className="mb-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Include everything about this person: age, education, work
                  history, family status, kids, hobbies, titles, personality
                  traits, and anything else important to know about the
                  character.
                </p>
              </div>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Describe the character..."
                className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none"
                rows={8}
                required
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {formData.bio.length} characters
              </div>
            </div>

            {/* More Images */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Image className="w-4 h-4 inline mr-2" />
                    More Images ({formData.moreImages.length}/20)
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Upload additional images for generating persona visuals
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => moreImagesInputRef.current?.click()}
                  disabled={formData.moreImages.length >= 20}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    formData.moreImages.length >= 20
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add Images
                </button>
              </div>

              <input
                ref={moreImagesInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleMoreImagesUpload}
                className="hidden"
              />

              {formData.moreImages.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {formData.moreImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                    >
                      <img
                        src={imageUrl}
                        alt={`Character image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          type="button"
                          onClick={() => removeMoreImage(index)}
                          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                  onClick={() => moreImagesInputRef.current?.click()}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Upload Character Images
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Add up to 20 images for various scenarios.
                  </p>
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium">
                      <Plus className="w-4 h-4" />
                      Click to upload images
                    </span>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isFormValid
                  ? "bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              {character ? "Update Character" : "Create Character"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
