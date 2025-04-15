import React, { useState } from "react";
import { Type, Image } from "lucide-react";
import { FirstPostPopUp } from "./FirstPostPopUp";
const PostDetails = ({ setComponentType }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [PopUp, setPopup] = useState(false);

  const [postText, setPostText] = useState(
    "✨ Introducing EduTlush! Our cutting-edge educational tools are designed to transform learning experiences..."
  );
  const [imagePreview, setImagePreview] = useState(
    "https://images.unsplash.com/photo-1549924231-f129b911e442"
  );
  const [newImageFile, setNewImageFile] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    // For now we only update local state. Hook into backend upload/save logic here later.
    setIsEditing(false);
  };
  const handleClosePopup = () => {
    setPopup(false);
    setComponentType("socialAccount");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewImageFile(null);
    setImagePreview(
      "https://images.unsplash.com/photo-1549924231-f129b911e442"
    );
  };
  const handlePopup = () => {
    setPopup(true);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-purple-600">
          🎉 Congrats! Your first post is ready
        </h2>
        <p className="text-gray-600 mt-1">
          Preview your post and switch between different visual styles
        </p>
      </div>

      {/* Post Card */}
      <div className="max-w-xl mx-auto border rounded-xl shadow-sm p-4 bg-white">
        {/* Post header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div>
            <p className="font-medium">EduTlush</p>
            <p className="text-xs text-gray-400">New Post</p>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Editable text input */}
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={4}
              className="w-full border rounded-md p-2 text-sm resize-none"
            />

            {/* Image upload */}
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-60 object-cover rounded-lg"
                />
              )}
            </div>

            {/* Save / Cancel */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-5 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Post content */}
            <div>
              <p className="mb-3 text-sm">{postText}</p>
              <img
                src={imagePreview}
                alt="Post preview"
                className="w-full h-60 object-cover rounded-lg"
              />
            </div>

            {/* Tag buttons */}
            <div className="flex gap-4 mt-4">
              <div className="px-3 flex gap-1 py-1 bg-gray-100 text-sm rounded-full">
                <Image className="h-5 w-5" />
                <p>Image</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-sm rounded-full">
                🏷️ Branded
              </span>
              <div className="px-3 gap-1 flex py-1 bg-gray-100 text-sm rounded-full">
                <Type className="w-5 h-5" />
                <p>Slogan</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePopup}
                className="bg-green-600 text-white px-5 py-2 rounded-lg"
              >
                Approve
              </button>
              <div className="space-x-2">
                <button
                  className="px-4 py-2 border rounded-lg"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
                <button className="px-4 py-2 border rounded-lg">
                  Regenerate
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {PopUp && (
        <FirstPostPopUp
          isOpen={PopUp}
          onClose={handleClosePopup}
          title="Lets Automate your Future Posts !"
          data="Setting Up Social Accounts...."
        />
      )}
    </div>
  );
};

export default PostDetails;
