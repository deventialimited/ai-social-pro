import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Edit,
  Trash2,
  Check,
  Image,
  Palette,
  Type,
  Download,
  Save,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { PostEditModal } from "./PostEditModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
export const PostCard = ({ post, onEdit, onDelete, onReschedule, view }) => {
  // console.log(post);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedButton, setSelectedButton] = useState("brandingImage");
  const [showFullText, setShowFullText] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(post.date));
  const [postDate, setPostDate] = useState(new Date(post.date));
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [deletePost, setDeletePost] = useState(false);
  const contentRef = useRef(null);
  const primaryPlatform = post?.platforms?.[0];
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageBlurred, setImageBlurred] = useState(true);
  useEffect(() => {
    if (imageLoaded) {
      const timer = setTimeout(() => {
        setImageBlurred(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded]);

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
        return 1;
      default:
        return 16 / 9;
    }
  };

  const getImageStyle = (platform) => ({
    aspectRatio: getImageAspectRatio(platform),
    width: "100%",
    objectFit: "cover",
    borderRadius: "0.5rem",
  });

  const getStatusBadge = () => {
    switch (post.status) {
      case "drafted":
        return (
          <span className="badge bg-gray-100 dark:bg-gray-700">Draft</span>
        );
      case "scheduled":
        return (
          <span className="badge bg-yellow-100 dark:bg-yellow-900/30">
            Scheduled
          </span>
        );
      case "published":
        return (
          <span className="badge bg-green-100 dark:bg-green-900/30">
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (onReschedule) {
      onReschedule(post._id, date);
    }
  };

 const handleApprove = async () => {
  const now = new Date();
  if (postDate < now) {
    toast.error("Cannot schedule post in the past.");
    return;
  }

  const schedulePayload = {
    time: new Date(postDate).getTime(),
    uid: post.userId || "",
    postId: post.postId,
    content: post.content,
    image: post.image,
    platforms: (post.platforms || [])
      .map((p) => p.toLowerCase())
      .map((p) => (p === "x" ? "twitter" : p)) // Map "x" to "twitter"
      .filter((p) =>
        ["twitter", "linkedin", "facebook", "instagram"].includes(p)
      ),
  };

  try {
    setLoadingMessage("Scheduling post...");
    console.log("schedulePayload", schedulePayload);
    const scheduleResponse = await fetch(
      "https://us-central1-socialmediabranding-31c73.cloudfunctions.net/api/scheduleMulti",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedulePayload),
      }
    );

    if (!scheduleResponse.ok)
      throw new Error("Failed to schedule post externally");

    const updateResponse = await fetch(
      `http://localhost:5000/api/v1/posts/updatePost/${post._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "scheduled" }),
      }
    );

    if (!updateResponse.ok)
      throw new Error("Failed to update post status locally");

    toast.success("Post approved and scheduled!");
    onEdit({ ...post, status: "scheduled" }, "scheduled");
  } catch (err) {
    console.error("Approval error:", err);
    toast.error("Failed to approve and schedule the post.");
  } finally {
    setLoadingMessage(null);
  }
};;

  const reschedulePost = async (newDate) => {
    const now = new Date();
    if (newDate < now) {
      toast.error("You cannot select a past time.");
      return;
    }

    const payload = {
      postId: post._id,
      newTime: newDate.getTime(),
    };

    try {
      setLoadingMessage("Updating schedule time...");
      const response = await fetch(
        "http://localhost:5000/api/v1/posts/updatePostTime",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to update post time");

      toast.success("Post schedule updated!");
      setPostDate(newDate);
      handleDateChange(newDate);
      setShowDatePicker(false);
    } catch (error) {
      console.error("Error updating post time:", error);
      toast.error("Failed to update the post time.");
    } finally {
      setLoadingMessage(null);
    }
  };

  const baseStyles =
    "flex border-b border-light-border dark:border-dark-border rounded-3xl items-center justify-between gap-1 px-2 py-1 transition-colors";
  const selectedStyles = "bg-blue-100 text-blue-700 hover:bg-blue-200";
  const unselectedStyles =
    "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
                {getStatusBadge()}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-2">
            <h2 className="text-[12px] text-gray-500 dark:text-gray-400 rounded">
              Visual
            </h2>
            {["image", "brandingImage", "sloganImage"].map((type) => {
              const Icon =
                type === "image"
                  ? Image
                  : type === "brandingImage"
                  ? Palette
                  : Type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedButton(type)}
                  className={`${baseStyles} ${
                    selectedButton === type ? selectedStyles : unselectedStyles
                  }`}
                >
                  <span className="text-[12px] capitalize">
                    {type === "brandingImage"
                      ? "branding"
                      : type === "sloganImage"
                      ? "slogan"
                      : type}
                  </span>
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
            <p ref={contentRef} className={!showFullText ? "line-clamp-2" : ""}>
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
          {post[selectedButton] ? (
            <>
              {!imageLoaded && (
                <Skeleton
                  height={300}
                  style={{
                    ...getImageStyle(primaryPlatform),
                    borderRadius: "0.5rem",
                  }}
                />
              )}
              <img
                src={post[selectedButton]}
                alt="Post content"
                onLoad={() => setImageLoaded(true)}
                style={{
                  ...getImageStyle(primaryPlatform),
                  borderRadius: "0.5rem",
                  filter: imageBlurred ? "blur(20px)" : "none",
                  transition: "filter 0.3s ease",
                  display: imageLoaded ? "block" : "none", // Hide image until loaded
                  cursor: "pointer",
                }}
                onClick={() => setShowEditModal(true)}
              />
            </>
          ) : (
            <Skeleton
              height={300}
              style={{
                ...getImageStyle(primaryPlatform),
                borderRadius: "0.5rem",
              }}
            />
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 bg-primary p-4 rounded-lg">
            <button
              onClick={handleApprove}
              disabled={!!loadingMessage}
              className="text-white bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 flex items-center gap-2 disabled:opacity-50"
            >
              {loadingMessage === "Scheduling post..." ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Scheduling...
                </>
              ) : (
                <>
                  Approve <Check className="text-white" />
                </>
              )}
            </button>
            <div className="flex items-center">
              <button onClick={() => setShowDatePicker(!showDatePicker)}>
                <Calendar className="h-3 w-3" />
              </button>
              <span className="text-xs ml-1">
                {format(postDate, "MMM d, yyyy, h:mm a")}
              </span>
            </div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded capitalize">
              {primaryPlatform}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="icon-btn"
              title="Edit post"
            >
              <Edit className="w-4 h-4" />
            </button>
            {post.status !== "drafted" && (
              <button
                onClick={() => onEdit(post, "drafted")}
                className="icon-btn"
                title="Save to drafts"
              >
                <Save className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => console.log("Download clicked")}
              className="icon-btn"
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
            {/* onDelete(post) */}
            <button
              onClick={() => setDeletePost(true)}
              className="icon-btn"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-10 ml-7 mt-[-13px] mb-5 text-xs text-gray-500 dark:text-gray-400">
          <span className="text-[9px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
            ID: {post._id}
          </span>
        </div>
      </div>

      {showEditModal && (
        <PostEditModal
          post={post}
          selectedType={selectedButton}
          showEditModal={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />
      )}

      {showDatePicker && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reschedule Post
              </h2>
              <button
                onClick={() => setShowDatePicker(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                &times;
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date and Time
              </label>
              <div className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 w-full">
                {format(new Date(selectedDate), "MMM d, yyyy, h:mm a")}
              </div>
            </div>

            <div className="mb-4">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                showTimeSelect
                timeFormat="h:mm aa"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                inline
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => reschedulePost(selectedDate)}
                disabled={!!loadingMessage}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded disabled:opacity-50"
              >
                {loadingMessage === "Updating schedule time..." ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" /> Updating...
                  </span>
                ) : (
                  "Update Schedule Time"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {deletePost && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Are you sure you want to delete this post?
            </h2>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeletePost(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                disabled={isDeleting} // Disable during deletion
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsDeleting(true); // Start loading
                  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
                  onDelete(post);
                  setIsDeleting(false); // Stop loading
                  setDeletePost(false);
                }}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded flex items-center justify-center min-w-20"
                disabled={isDeleting} // Disable during deletion
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
