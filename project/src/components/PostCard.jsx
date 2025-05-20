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

  // Reschedule modal
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState("");

  const times = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    const suffix = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return {
      label: `${formattedHour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")} ${suffix}`,
      value: { hour, minutes },
    };
  });

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(contentRef.current).lineHeight
      );
      const maxHeight = lineHeight * 2;
      setIsClamped(contentRef.current.scrollHeight > maxHeight);
    }
  }, [post.content]);

  const handleSave = (updatedPost) => {
    onEdit(updatedPost, "generated");
    setShowEditModal(false);
  };

  const handleUpdateSchedule = () => {
    const now = new Date();
    if (selectedDate <= now) {
      setError("Scheduled date cannot be less than current");
      return;
    }
    setError("");
    onReschedule(post._id, selectedDate);
    setShowSchedulePopup(false);
  };

  const handleTimeClick = (timeObj) => {
    const updated = new Date(selectedDate);
    updated.setHours(timeObj.hour);
    updated.setMinutes(timeObj.minutes);
    updated.setSeconds(0);
    setSelectedDate(updated);
    setShowTimePicker(false);
  };

  const handleDateClick = (e) => {
    const newDate = new Date(e.target.value);
    const updated = new Date(selectedDate);
    updated.setFullYear(newDate.getFullYear());
    updated.setMonth(newDate.getMonth());
    updated.setDate(newDate.getDate());
    setSelectedDate(updated);
    setShowDatePicker(false);
  };

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
            {["image", "branding", "slogan"].map((key) => {
              const icons = {
                image: <Image className="w-4 h-4" />,
                branding: <Palette className="w-4 h-4" />,
                slogan: <Type className="w-4 h-4" />,
              };
              return (
                <button
                  key={key}
                  onClick={() => setSelectedButton(key)}
                  className={`text-[12px] px-2 py-1 rounded-3xl transition-colors ${
                    selectedButton === key
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  {icons[key]}
                </button>
              );
            })}
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
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowSchedulePopup(true)}
            >
              <Calendar className="h-4 w-4" />
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
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Edit post"
            >
              <Edit className="w-4 h-4" />
            </button>
            {post.status !== "drafted" && (
              <button
                onClick={() => onEdit(post, "drafted")}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Save to drafts"
              >
                <Save className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => console.log("Download clicked")}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
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
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showSchedulePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-[320px] space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reschedule Post
            </h3>
            <div className="flex justify-between gap-2">
              <div
                className="cursor-pointer border px-3 py-2 rounded text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                {format(selectedDate, "MMM d, yyyy")}
              </div>
              <div
                className="cursor-pointer border px-3 py-2 rounded text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700"
                onClick={() => setShowTimePicker(!showTimePicker)}
              >
                {format(selectedDate, "hh:mm a")}
              </div>
            </div>
            {showDatePicker && (
              <input
                type="date"
                className="w-full p-2 mt-2 rounded border"
                onChange={handleDateClick}
              />
            )}
            {showTimePicker && (
              <div className="h-48 overflow-y-auto border p-2 rounded bg-white dark:bg-gray-800 text-sm">
                {times.map((t, i) => (
                  <div
                    key={i}
                    className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded"
                    onClick={() => handleTimeClick(t.value)}
                  >
                    {t.label}
                  </div>
                ))}
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowSchedulePopup(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSchedule}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Update Schedule
              </button>
            </div>
          </div>
        </div>
      )}

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
