import { useState, useRef, useEffect } from "react";
import {
  Check,
  Image,
  Palette,
  Type,
  CalendarDays,
  Edit,
  Trash2,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const getImageStyle = (platform) => {
  const style = {
    width: "100%",
    objectFit: "cover",
    borderRadius: "0.5rem",
  };
  switch (platform?.toLowerCase()) {
    case "linkedin":
      return { ...style, aspectRatio: "1200/627" };
    case "x":
      return { ...style, aspectRatio: "1200/675" };
    case "facebook":
      return { ...style, aspectRatio: "1200/630" };
    case "instagram":
      return { ...style, aspectRatio: "1" };
    default:
      return { ...style, aspectRatio: "16/9" };
  }
};

export default function PostDetails({ postData }) {
  const [selectedButton, setSelectedButton] = useState("image");
  const [showFullText, setShowFullText] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const contentRef = useRef(null);
  const navigate = useNavigate();
  console.log("post data.... iin the Post Detail section", postData);
  const primaryPlatform = postData?.platforms?.[0] || "linkedin"; // Default to linkedin if no platform

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
  }, [postData?.content]);

  const handleSeeAllPosts = () => {
    navigate("/dashboard");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-auto">
      {/* Header Title */}
      <h1
        className="text-center font-bold text-2xl sm:text-xl px-4 pt-6 pb-2 text-transparent bg-clip-text"
        style={{
          background:
            "linear-gradient(90deg, rgba(49, 67, 204, 1) 0%, rgba(175, 87, 199, 1) 53%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Congratulations! Your First Post Is Ready
      </h1>

      {/* Card Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            {postData?.image ? (
              <img
                src={postData.image}
                alt="Brand logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <Type className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">
              {postData?.domainInfo?.clientName || "Your Brand"}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                ID: #{postData.id}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Toggle Buttons */}
        <div className="flex items-center space-x-2 p-2">
          <h2 className="text-[12px] text-gray-500 dark:text-gray-400 rounded">
            Visual
          </h2>
          <button
            onClick={() => setSelectedButton("image")}
            className={`${baseStyles} ${
              selectedButton === "image" ? selectedStyles : unselectedStyles
            }`}
          >
            <span className="text-[12px]">Image</span>
            <Image className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedButton("branding")}
            className={`${baseStyles} ${
              selectedButton === "branding" ? selectedStyles : unselectedStyles
            }`}
          >
            <span className="text-[12px]">Branding</span>
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedButton("slogan")}
            className={`${baseStyles} ${
              selectedButton === "slogan" ? selectedStyles : unselectedStyles
            }`}
          >
            <span className="text-[12px]">Slogan</span>
            <Type className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4 space-y-4">
        <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
          <p ref={contentRef} className={!showFullText ? "line-clamp-2" : ""}>
            {postData?.content || "Your post content will appear here"}
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
        {postData?.image ? (
          <img
            src={postData.image}
            alt="Post"
            className="cursor-pointer"
            style={getImageStyle(primaryPlatform)}
          />
        ) : (
          <div
            className="w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            style={getImageStyle(primaryPlatform)}
          >
            <Image className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 bg-primary p-4 rounded-lg">
          <button className="text-white bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 flex items-center gap-2">
            Approve <Check className="text-white w-4 h-4" />
          </button>
          <div className="flex items-center text-xs text-gray-800 dark:text-white">
            <CalendarDays className="h-4 w-4" />
            <span className="ml-2">
              {postData?.date
                ? format(new Date(postData.date), "MMM d, yyyy")
                : "Today"}
            </span>
          </div>
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded capitalize">
            {primaryPlatform}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sticky Bottom Button */}
      <div className="sticky bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 mt-4 shadow-lg">
        <button
          onClick={handleSeeAllPosts}
          className="w-full text-white rounded-xl px-6 py-3 font-semibold text-sm sm:text-base transition-colors duration-200"
          style={{
            background:
              "linear-gradient(90deg, rgba(49, 67, 204, 1) 0%, rgba(175, 87, 199, 1) 53%)",
          }}
        >
          See All Posts
        </button>
      </div>
    </div>
  );
}
