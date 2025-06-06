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
import { updateSelectedDomain } from "../libs/authService";
import Tooltip from "@mui/material/Tooltip";

const platformDimensions = {
  facebook: [1200, 630],
  x: [1200, 675],
  linkedin: [1200, 627],
  instagram: [1080, 1080], // default square post
};

const getImageStyle = (platform) => {
  const [canvasWidth, canvasHeight] = platformDimensions[
    (platform || "")?.toLowerCase()
  ] || [600, 600];
  return {
    // aspectRatio: getImageAspectRatio(platform),
    width: `${Math.max(Math.min(canvasWidth / 3, 600))}px`,
    height: `${Math.max(Math.min(675 / 3, 600))}px`,
    // objectFit: "cover",
  };
};
export default function PostDetails({ postData }) {
  const [selectedButton, setSelectedButton] = useState("brandingImage");
  const [showFullText, setShowFullText] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showBlur, setShowBlur] = useState(true);

  const contentRef = useRef(null);
  const navigate = useNavigate();

  const primaryPlatform = postData?.platforms?.[0] || "linkedin";

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

  const handleSeeAllPosts = async () => {
    try {
      const result = await updateSelectedDomain(
        postData.userId,
        postData?.domainId?._id
      );
      console.log(result);
    } catch (err) {
      console.error(
        "[LeftMenu] Error updating selected domain on backend:",
        err
      );
    }
    navigate(`/dashboard?domainId=${postData?.domainId?._id}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-auto">
      {/* Header Title */}
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 text-center rounded-t-lg">
        <h1
          className="font-bold text-2xl sm:text-xl text-transparent bg-clip-text"
          style={{
            background:
              "linear-gradient(90deg, rgba(49, 67, 204, 1) 0%, rgba(175, 87, 199, 1) 53%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Congratulations! Your First Post Is Ready
        </h1>
      </div>

      {/* Card Header */}
      <div className="p-4 flex flex-col md:flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <Tooltip title="Domain Logo" arrow>
              {postData?.domainId ? (
                <img
                  src={postData.domainId.siteLogo}
                  alt="Brand logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <Type className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
              )}
            </Tooltip>
          </div>
          <div>
            <Tooltip title="Domain Name" arrow>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">
                {postData?.domainId?.clientName || "Your Brand"}
              </h3>
            </Tooltip>
          </div>
        </div>

        {/* Visual Toggle Buttons */}
        <div className="flex items-center space-x-2 p-2">
          {/* <h2 className="text-[12px] text-gray-500 dark:text-gray-400 rounded">
            Visual
          </h2> */}
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
            onClick={() => setSelectedButton("brandingImage")}
            className={`${baseStyles} ${
              selectedButton === "brandingImage"
                ? selectedStyles
                : unselectedStyles
            }`}
          >
            <span className="text-[12px]">Branding</span>
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedButton("sloganImage")}
            className={`${baseStyles} ${
              selectedButton === "sloganImage"
                ? selectedStyles
                : unselectedStyles
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
          <Tooltip title="Post Content" arrow>
            <p ref={contentRef} className={!showFullText ? "line-clamp-2" : ""}>
              {postData?.content || "Your post content will appear here"}
            </p>
          </Tooltip>
          {isClamped && (
            <button
              onClick={() => setShowFullText(!showFullText)}
              className="mt-1 text-blue-600 dark:text-blue-400 text-sm underline hover:text-blue-800"
            >
              {showFullText ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        <Tooltip title="Post Image" arrow>
          <div className="flex items-center justify-center rounded-lg w-full bg-gray-200">
            {postData[selectedButton] ? (
              <img
                src={postData[selectedButton]?.imageUrl}
                alt="Post"
                className="cursor-pointer"
                style={{
                  ...getImageStyle(primaryPlatform),
                  filter: showBlur ? "blur(8px)" : "none",
                  transition: "filter 0.5s ease-out",
                }}
                onLoad={() => {
                  setImageLoaded(true);
                  setTimeout(() => {
                    setShowBlur(false);
                  }, 1500);
                }}
              />
            ) : (
              <div
                className="w-full flex items-center justify-center animate-pulse rounded"
                style={{
                  ...getImageStyle(primaryPlatform),
                  backgroundColor: "rgba(184, 188, 194, 0.87)",
                }}
              >
                <Image className="w-12 h-12 text-gray-500" />
              </div>
            )}
          </div>
        </Tooltip>
      </div>

      {/* Footer */}
      <div className="flex flex-col md:flex-row gap-0 md:gap-8 items-center justify-center text-center p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-0 md:gap-4 bg-primary p-3 md:p-2 rounded-lg">
          <Tooltip title="Approve the Post" arrow>
            <button className="text-white bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 flex items-center gap-2">
              Approve <Check className="text-white w-4 h-4" />
            </button>
          </Tooltip>
          <div className="flex pl-0 pl-6 items-center text-xs text-gray-800 dark:text-white">
            <CalendarDays className="h-4 w-4" />
            <span className="ml-2">
              <Tooltip title="Post Date" arrow>
                {postData?.date
                  ? format(new Date(postData.date), "MMM d, yyyy")
                  : "Today"}
              </Tooltip>
            </span>
          </div>
          {/* <span className="text-xs hidden sm:inline bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded capitalize">
            <Tooltip title="Platform" arrow>
              {primaryPlatform}
            </Tooltip>
          </span> */}
        </div>
        

        <div className="flex items-center gap-2 md:gap-9">
        <span className="text-xs md:block sm:hidden bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded capitalize">
            <Tooltip title="Platform" arrow>
              {primaryPlatform}
            </Tooltip>
          </span>
          <div>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Tooltip title="Edit Post" arrow>
              <Edit className="w-4 h-4" />
            </Tooltip>
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Tooltip title="Download Post" arrow>
              <Download className="w-4 h-4" />
            </Tooltip>
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Tooltip title="Delete Post" arrow>
              <Trash2 className="w-4 h-4" />
            </Tooltip>
          </button>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-[-13px] text-xs text-gray-500 dark:text-gray-400">
  <Tooltip title="Post Id">
    <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
      POST ID: #{postData?.postId}
    </span>
  </Tooltip>
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
