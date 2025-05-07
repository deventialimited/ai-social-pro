import React, { useState, useRef, useEffect } from "react";
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
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { PostEditModal } from "./PostEditModal";

export const PostCard = ({ post, onEdit, onDelete, onReschedule, view }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedButton, setSelectedButton] = useState("image");
  const [showFullText, setShowFullText] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const contentRef = useRef(null);
  const primaryPlatform = post?.platforms?.[0];

  const baseStyles =
    "flex border-b border-light-border dark:border-dark-border rounded-3xl items-center justify-between gap-1 px-2 py-1 transition-colors";
  const selectedStyles = "bg-blue-100 text-blue-700 hover:bg-blue-200";
  const unselectedStyles =
    "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(contentRef.current).lineHeight
      );
      const maxHeight = lineHeight * 2;
      setIsClamped(contentRef.current.scrollHeight > maxHeight);
    }
  }, [post.content]);

  const getImageAspectRatio = (platform) => {
    switch (platform?.toLowerCase()) {
      case "facebook":
        return 1200 / 630;
      case "x":
        return 1200 / 675;
      case "linkedin":
        return 1200 / 627;
      case "instagram":
        return 1; // Square
      default:
        return 16 / 9; // Fallback
    }
  };

  const getImageStyle = (platform) => {
    const aspectRatio = getImageAspectRatio(platform);
    return {
      aspectRatio,
      width: "100%",
      objectFit: "cover",
      borderRadius: "0.5rem",
    };
  };

  const getStatusBadge = () => {
    switch (post.status) {
      case "drafted":
        return (
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
            Draft
          </span>
        );
      case "scheduled":
        return (
          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded">
            Scheduled
          </span>
        );
      case "published":
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
    onEdit(updatedPost, "generated");
    setShowEditModal(false);
  };

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${
          view === "grid" ? "h-full flex flex-col" : ""
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <img
                src={post?.domainId?.siteLogo}
                alt="Business logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">
                {post.domainId.clientName}
              </h3>
              <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                  ID: {post._id}
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
                onClick={() => setSelectedButton("image")}
                className={`${baseStyles} ${
                  selectedButton === "image" ? selectedStyles : unselectedStyles
                }`}
              >
                <span className="text-[12px]">Image</span>
                <Image
                  className={`w-4 h-4 fill-none ${
                    selectedButton === "image"
                      ? "stroke-blue-700"
                      : "stroke-gray-500 dark:stroke-gray-400"
                  }`}
                />
              </button>
            </div>
            <div>
              <button
                onClick={() => setSelectedButton("branding")}
                className={`${baseStyles} ${
                  selectedButton === "branding"
                    ? selectedStyles
                    : unselectedStyles
                }`}
              >
                <span className="text-[12px]">Branding</span>
                <Palette
                  className={`w-4 h-4 fill-none ${
                    selectedButton === "branding"
                      ? "stroke-blue-700"
                      : "stroke-gray-500 dark:stroke-gray-400"
                  }`}
                />
              </button>
            </div>
            <div>
              <button
                onClick={() => setSelectedButton("slogan")}
                className={`${baseStyles} ${
                  selectedButton === "slogan"
                    ? selectedStyles
                    : unselectedStyles
                }`}
              >
                <span className="text-[12px] truncate">Slogan</span>
                <Type
                  className={`w-4 h-4 fill-none ${
                    selectedButton === "slogan"
                      ? "stroke-blue-700"
                      : "stroke-gray-500 dark:stroke-gray-400"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`p-4 space-y-4 ${view === "grid" ? "flex-1" : ""}`}>
          <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
            <p
              ref={contentRef}
              className={`${!showFullText ? "line-clamp-2" : ""}`}
            >
              {post.content}
            </p>
            {isClamped && (
              <button
                onClick={() => setShowFullText(!showFullText)}
                className="mt-1 text-blue-600 dark:text-blue-400 text-sm underline hover:text-blue-800"
              >
                {showFullText ? "Show less" : "Show more"}
              </button>
            )}
          </div>
          <img
            src={post.image}
            className=" cursor-pointer"
            onClick={() => setShowEditModal(true)}
            alt="Post content"
            style={getImageStyle(primaryPlatform)}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 bg-primary p-4 rounded-lg">
            <button className="text-white bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 flex items-center gap-2">
              Approve
              <Check className="text-white" />
            </button>
            <div className="flex items-center">
              <Calendar className="h-3 w-3" />
              <span className="text-xs ml-1">
                {format(new Date(post.date), "MMM d, yyyy")}
              </span>
            </div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded capitalize">
              {primaryPlatform}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Edit post"
            >
              <Edit className="w-4 h-4" />
            </button>
            {post.status !== "drafted" && (
              <button
                onClick={() => {
                  onEdit(post, "drafted");
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Save to drafts"
              >
                <Save className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => console.log("Download clicked")}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            {post.status === "published" && (
              <div
                className="p-2 text-green-500 dark:text-green-400"
                title="Published"
              >
                <Check className="w-4 h-4" />
              </div>
            )}
            <button
              onClick={() => onDelete(post._id)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showEditModal && (
        <PostEditModal
          post={post}
          showEditModal={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};
