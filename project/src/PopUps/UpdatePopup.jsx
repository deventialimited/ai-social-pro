import React, { useState, useRef } from "react";
import { X, User, FileText, Upload, Image, Trash2, Plus } from "lucide-react";

export const CharacterModal = ({ character, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: character?.name || "",
    bio: character?.bio || "",
    profileImage: character?.profileImage ? null : null, // For editing, we don't preload the file
    moreImages: character?.moreImages ? [] : [], // For editing, we start with no new files
  });

  const profileImageInputRef = useRef(null);
  const moreImagesInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);
    onSave(formData);
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size (e.g., JPEG/PNG, max 5MB)
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Profile image must be JPEG or PNG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Profile image must not exceed 5MB.");
      return;
    }

    setFormData((prev) => ({ ...prev, profileImage: file }));
  };

  const handleMoreImagesUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validTypes = ["image/jpeg", "image/png"];
    const validFiles = files.filter((file) => {
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} must be JPEG or PNG.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} must not exceed 5MB.`);
        return false;
      }
      return true;
    });

    setFormData((prev) => ({
      ...prev,
      moreImages: [...prev.moreImages, ...validFiles].slice(0, 20),
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
        <div className="relative px-8 py-6 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 text-white">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {character ? "Edit Character" : "Create New Character"}
                </h2>
                <p className="text-white/80 text-sm">
                  Define a unique persona for your content creation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg"
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
            {/* Profile Image */}
            <div className="flex gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Profile Image
                </label>
                <div
                  className="relative group cursor-pointer overflow-hidden rounded-xl w-32 h-32 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400"
                  onClick={() => profileImageInputRef.current?.click()}
                >
                  {formData.profileImage ? (
                    <>
                      <img
                        src={URL.createObjectURL(formData.profileImage)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : character?.profileImage ? (
                    <>
                      <img
                        src={character.profileImage}
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
                  accept="image/jpeg,image/png"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />
              </div>

              {/* Name */}
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
                  placeholder="e.g., Peter Garcia, Elena CPA"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
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
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Describe the character..."
                rows={8}
                className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none"
                required
              />
              <div className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">
                {formData.bio.length} characters
              </div>
            </div>

            {/* More Images */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Image className="w-4 h-4 inline mr-2" />
                  More Images ({formData.moreImages.length}/20)
                </label>
                <button
                  type="button"
                  onClick={() => moreImagesInputRef.current?.click()}
                  disabled={formData.moreImages.length >= 20}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                    formData.moreImages.length >= 20
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add Images
                </button>
              </div>

              <input
                ref={moreImagesInputRef}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleMoreImagesUpload}
                className="hidden"
              />

              {formData.moreImages.length > 0 ||
              character?.moreImages?.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {character?.moreImages?.map((img, index) => (
                    <div
                      key={`existing-${index}`}
                      className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border"
                    >
                      <img
                        src={img}
                        alt={`Existing image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                  {formData.moreImages.map((file, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`More image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => removeMoreImage(index)}
                          className="p-1 bg-red-500 text-white rounded-full"
                          title="Remove image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {(character?.moreImages?.length || 0) + index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer"
                  onClick={() => moreImagesInputRef.current?.click()}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Upload Character Images
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Add up to 20 images for different styles and poses
                  </p>
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
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isFormValid
                  ? "bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white hover:scale-105"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
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
