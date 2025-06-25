import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Edit,
  Trash2,
  Check,
  Image as ImageLucide, // Renamed to avoid conflict with global Image constructor
  Palette,
  Type,
  Download,
  Save,
  Copy,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { PostEditModal } from "./PostEditModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  useReschedulePost,
  useApproveAndSchedulePost,
} from "../libs/postService";

export const PostCard = ({ post, onEdit, onDelete, onReschedule, view }) => {
  // Validate post.date, default to current date if invalid
  const getValidDate = (date) => {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedButton, setSelectedButton] = useState("brandingImage");
  const [showFullText, setShowFullText] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getValidDate(post.date));
  const [postDate, setPostDate] = useState(getValidDate(post.date));
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [deletePost, setDeletePost] = useState(false);
  const contentRef = useRef(null);
  const primaryPlatform = post?.platform;
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageBlurred, setImageBlurred] = useState(true);
  const { mutate: reschedule, isLoading: isRescheduling } = useReschedulePost();
  const { mutate: approveAndSchedule, isLoading: isApproving } =
    useApproveAndSchedulePost();

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
        return 1200 / 630; // 1.905
      case "x":
        return 1200 / 675; // 1.778
      case "linkedin":
        return 1200 / 627; // 1.914
      case "instagram":
        return 1; // 1
      default:
        return 16 / 9; // Default fallback
    }
  };

  const platformDimensions = {
    facebook: [1200, 630],
    x: [1200, 675],
    linkedin: [1200, 627],
    instagram: [1080, 1080],
  };

  const getImageStyle = (platform) => {
    const [canvasWidth, canvasHeight] = platformDimensions[
      (platform || "").toLowerCase()
    ] || [1200, 675]; // Default to x platform dimensions
    const edited = post[selectedButton]?.editorStatus === "edited";
    const aspectRatio = canvasWidth / canvasHeight;

    return {
      width: "100%", // Fill container width
      aspectRatio: aspectRatio, // Enforce platform-specific aspect ratio
      objectFit: "cover", // Ensure image covers container
      maxWidth: edited ? `${canvasWidth}px` : `${Math.min(canvasWidth, 600)}px`, // Cap at original or scaled width
      height: "auto", // Adjust height based on aspect ratio
    };
  };

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

  const handleDownload = async () => {
    const imageUrl = await post[selectedButton]?.imageUrl;
    if (!imageUrl) {
      toast.error("Image not found");
      return;
    }

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Set download filename based on selected button
      const filename = `${selectedButton}_${post.postId}.png`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Failed to download image");
    }
  };

  const getSelectedImageUrl = () => {
    switch (selectedButton) {
      case "brandingImage":
        return post.brandingImage?.imageUrl || "";
      case "sloganImage":
        return post.sloganImage?.imageUrl || "";
      case "image":
        return post.image?.imageUrl || post.brandingImage?.imageUrl;
      default:
        return "";
    }
  };

  const handleCopyImageToClipboard = async () => {
    const imageUrl = getSelectedImageUrl();
    if (!imageUrl) {
      toast.error("Image not found");
      return;
    }

    try {
      const img = new Image(); // Uses global Image constructor
      img.crossOrigin = "anonymous"; // Required to avoid tainted canvas
      img.src = imageUrl;

      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(async (blob) => {
          if (!blob) {
            toast.error("Failed to convert image.");
            return;
          }

          try {
            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([item]);
            toast.success("Image copied to clipboard!");
          } catch (error) {
            console.error(error);
            toast.error("Clipboard write failed.");
          }
        }, "image/png");
      };

      img.onerror = () => {
        toast.error("Failed to load image.");
      };
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy image.");
    }
  };

  const handleApprove = async () => {
    const now = new Date();
    if (postDate < now) {
      toast.error("Cannot schedule post in the past.");
      return;
    }

    const schedulePayload = {
      time: postDate.getTime(),
      uid: post.userId || "",
      postId: post.postId,
      content: post.content,
      image: getSelectedImageUrl(),
      platforms: [post?.platform],
    };

    try {
      setLoadingMessage("Scheduling post...");

      const scheduleResponse = await fetch(
        "https://us-central1-socialmediabranding-31c73.cloudfunctions.net/api/scheduleMulti",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(schedulePayload),
        }
      );

      if (!scheduleResponse.ok) {
        throw new Error("Failed to schedule post externally");
      }

      approveAndSchedule(
        { postId: post._id },
        {
          onSuccess: (updatedPost) => {
            toast.success("Post approved and scheduled!");
            onEdit({ ...post, status: "scheduled" }, "scheduled");
          },
          onError: (error) => {
            toast.error("Failed to approve and schedule the post.");
          },
        }
      );
    } catch (err) {
      console.error("Approval error:", err);
      toast.error("Failed to approve and schedule the post.");
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Post content copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy post content.");
      });
  };

  const handleReschedule = (newDate) => {
    if (newDate && !isNaN(newDate.getTime())) {
      reschedule(
        { postId: post._id, newTime: newDate.getTime() },
        {
          onSuccess: () => {
            toast.success("Post schedule updated!");
            setPostDate(newDate);
            handleDateChange(newDate);
            setShowDatePicker(false);
          },
          onError: (error) => {
            toast.error(error?.message || "Failed to update the post time.");
          },
        }
      );
    } else {
      toast.error("Invalid reschedule date");
    }
  };

  const handleDateChange = (date) => {
    if (date && !isNaN(date.getTime())) {
      setSelectedDate(date);
      if (onReschedule) {
        onReschedule(post._id, date);
      }
    } else {
      toast.error("Invalid date selected");
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
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 dark:border-gray-700">
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
            {["image", "brandingImage", "sloganImage"].map((type) => {
              const Icon =
                type === "image"
                  ? ImageLucide // Updated to ImageLucide
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
              <div className="mt-1 flex items-center gap-3">
                <button
                  onClick={() => setShowFullText(!showFullText)}
                  className="text-blue-600 dark:text-blue-400 text-sm underline hover:text-blue-800"
                >
                  {showFullText ? "Show less" : "Show more"}
                </button>
                <button
                  onClick={() => handleCopyToClipboard(post.content)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm"
                  title="Copy post content"
                >
                  <Copy />
                </button>
                <button
                  onClick={handleCopyImageToClipboard}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm"
                  title="Copy post image"
                >
                  <ImageLucide className="w-4 h-4" />{" "}
                  {/* Updated to ImageLucide */}
                </button>
              </div>
            )}
          </div>
          <div
            className="flex items-center justify-center rounded-lg w-full"
            style={{ aspectRatio: getImageAspectRatio(primaryPlatform) }}
          >
            {post[selectedButton]?.imageUrl ? (
              <>
                {!imageLoaded && (
                  <div
                    style={{
                      ...getImageStyle(primaryPlatform),
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                    }}
                  >
                    <Skeleton width="100%" height="100%" />
                  </div>
                )}
                <img
                  src={post[selectedButton]?.imageUrl}
                  alt="Post content"
                  onLoad={() => setImageLoaded(true)}
                  style={{
                    ...getImageStyle(primaryPlatform),
                    filter: imageBlurred ? "blur(20px)" : "none",
                    transition: "filter 0.3s ease",
                    display: imageLoaded ? "block" : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowEditModal(true)}
                  className="object-cover w-full h-full"
                />
              </>
            ) : (
              <div
                style={{
                  ...getImageStyle(primaryPlatform),
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <Skeleton width="100%" height="100%" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 bg-primary p-4 rounded-lg">
            <button
              onClick={handleApprove}
              disabled={isApproving || !!loadingMessage}
              className="text-white bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 flex items-center gap-2 disabled:opacity-50"
            >
              {isApproving || loadingMessage === "Scheduling post..." ? (
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
            <div className="flex items-center cursor-pointer">
              <div onClick={() => setShowDatePicker(!showDatePicker)}>
                <button>
                  <Calendar className="h-3 w-3" />
                </button>
                <span className="text-xs ml-1">
                  {format(postDate, "MMM d, yyyy, h:mm a")}
                </span>
              </div>
              <span className="text-xs ml-6 hidden md:inline bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded capitalize">
                {primaryPlatform}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs inline md:hidden bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded capitalize">
              {primaryPlatform}
            </span>
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
              onClick={handleDownload}
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
            <button
              onClick={() => setDeletePost(true)}
              className="icon-btn"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-center md:mt-[-13px] mb-5 text-xs text-gray-500 dark:text-gray-400">
          <span className="text-[9px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
            ID: {post.postId}
          </span>
        </div>
      </div>

      {showEditModal && (
        <PostEditModal
          post={post}
          postImageSize={{ ...getImageStyle(primaryPlatform) }}
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
                ×
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
                onClick={() => handleReschedule(selectedDate)}
                disabled={isRescheduling}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded disabled:opacity-50"
              >
                {isRescheduling ? (
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
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsDeleting(true);
                  await new Promise((resolve) => setTimeout(resolve, 2000));
                  onDelete(post);
                  setIsDeleting(false);
                  setDeletePost(false);
                }}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded flex items-center justify-center min-w-20"
                disabled={isDeleting}
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
