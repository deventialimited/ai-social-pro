import { useState, useRef, useEffect } from "react";
import {
  Check,
  Image as ImageLucide,
  Palette,
  Type,
  CalendarDays,
  Edit,
  Trash2,
  Download,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { updateSelectedDomain } from "../libs/authService";
import Tooltip from "@mui/material/Tooltip";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import {
  useReschedulePost,
  useApproveAndSchedulePost,
  useUpdatePostImage,
} from "../libs/postService";
import AIImageCustomizationModal from "../PopUps/AIImageCustomizationModal";

const platformDimensions = {
  facebook: [1200, 630],
  x: [1200, 675],
  linkedin: [1200, 627],
  instagram: [1080, 1080],
};
const getPlatformUrl = (platform) => {
  switch (platform?.toLowerCase()) {
    case "facebook":
      return "https://www.facebook.com";
    case "x":
      return "https://www.x.com";
    case "linkedin":
      return "https://www.linkedin.com";
    case "instagram":
      return "https://www.instagram.com";
    default:
      return "#";
  }
};
const getImageStyle = (platform) => {
  const [canvasWidth, canvasHeight] = platformDimensions[
    (platform || "")?.toLowerCase()
  ] || [1200, 675];
  const aspectRatio = canvasWidth / canvasHeight;
  return {
    width: "100%",
    aspectRatio,
    objectFit: "cover",
    maxWidth: `${Math.min(canvasWidth, 600)}px`,
    height: "auto",
  };
};

export default function PostDetails({ postData, onEdit, onDelete }) {
  const [selectedButton, setSelectedButton] = useState("brandingImage");
  const [showFullText, setShowFullText] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showBlur, setShowBlur] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    postData?.date ? new Date(postData.date) : new Date()
  );
  const [postDate, setPostDate] = useState(
    postData?.date ? new Date(postData.date) : new Date()
  );
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [aiImageStep, setAiImageStep] = useState("select");
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);

  const contentRef = useRef(null);
  const navigate = useNavigate();

  const primaryPlatform = postData?.platform || "linkedin";
  const { mutate: reschedule, isLoading: isRescheduling } = useReschedulePost();
  const { mutate: approveAndSchedule, isLoading: isApproving } =
    useApproveAndSchedulePost();
  const updatePostMutation = useUpdatePostImage();

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

  useEffect(() => {
    if (imageLoaded) {
      const timer = setTimeout(() => {
        setShowBlur(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded]);

  const handleSeeAllPosts = async () => {
    try {
      const result = await updateSelectedDomain(
        postData?.userId,
        postData?.domainId
      );
      if (result?.user) {
        console.log("user is changed in the localstorage");
        localStorage.setItem("user", JSON.stringify(result.user));
      }
      console.log(result);
    } catch (err) {
      console.error(
        "[LeftMenu] Error updating selected domain on backend:",
        err
      );
    }
    navigate(`/dashboard?domainId=${postData?.domainId?._id}`);
  };

  const handleDownload = async () => {
    const imageUrl = getSelectedImageUrl();
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
      const filename = `${selectedButton}_${postData.postId}.png`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download image");
    }
  };

  const getSelectedImageUrl = () => {
    if (selectedButton === "aiImage" && generatedImageUrl)
      return generatedImageUrl;
    switch (selectedButton) {
      case "brandingImage":
        return postData.brandingImage?.imageUrl || "";
      case "sloganImage":
        return postData.sloganImage?.imageUrl || "";
      case "aiImage":
        return (
          postData.image?.imageUrl || postData.brandingImage?.imageUrl || ""
        );
      default:
        return "";
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
      uid: postData.userId || "",
      postId: postData.postId,
      content: postData.content,
      image: getSelectedImageUrl(),
      platforms: [postData?.platform],
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
        { postId: postData._id },
        {
          onSuccess: (updatedPost) => {
            toast.success("Post approved and scheduled!");
            onEdit({ ...postData, status: "scheduled" }, "scheduled");
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

  const handleReschedule = (newDate) => {
    reschedule(
      { postId: postData._id, newTime: newDate.getTime() },
      {
        onSuccess: () => {
          toast.success("Post schedule updated!");
          setPostDate(newDate);
          setSelectedDate(newDate);
          setShowDatePicker(false);
        },
        onError: (error) => {
          toast.error(error || "Failed to update the post time.");
        },
      }
    );
  };

  const handleSelectIdea = (idea) => {
    setSelectedIdea(idea);
    setShowCustomizationModal(true);
  };

  const handleGenerateWithInputs = async ({ text, style }) => {
    setShowCustomizationModal(false);
    setAiImageStep("generating");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 1 : prev));
    }, 100);

    try {
      const payload = {
        postId: postData.postId,
        platform: primaryPlatform,
        imageIdea: selectedIdea.title,
        postTopic: postData.topic || "",
        imageTheme: style || "None",
        textToAdd: text || "My Slogan will be here",
      };

      const response = await fetch(
        "https://social-api-107470285539.us-central1.run.app/generate-image-for-post",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      setGeneratedImageUrl(data.imageUrl);
      setProgress(100);
      toast.success("Image generated successfully!");

      updatePostMutation.mutate(
        { postId: postData.postId, imageUrl: data.imageUrl },
        {
          onSuccess: () => toast.success("Post image updated successfully!"),
          onError: (error) =>
            toast.error(`Failed to update post image: ${error.message}`),
        }
      );

      setAiImageStep("preview");
    } catch (error) {
      console.error("Error generating image:", error);
      setProgress(100);
      toast.error("Failed to generate image. Please try again.");
      setAiImageStep("select");
    } finally {
      clearInterval(interval);
    }
  };

  const handleUseImage = () => {
    setAiImageStep("select");
  };

  const handleRegenerateImage = () => {
    if (selectedIdea) {
      setShowCustomizationModal(true);
    }
  };

  const truncateText = (text, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const toggleDescription = (ideaId, e) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedDescriptions((prev) => ({
      ...prev,
      [ideaId]: !prev[ideaId],
    }));
  };

  const renderImageLayout = () => {
    if (
      selectedButton === "aiImage" &&
      !postData.image?.imageUrl &&
      !generatedImageUrl
    ) {
      return (
        <div
          className="w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden"
          style={getImageStyle(primaryPlatform)}
        >
          {aiImageStep === "select" && (
            <div className="h-full flex flex-col p-6">
              <div className="text-center mb-4 flex-shrink-0">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-3">
                  <Sparkles className="w-4 h-4" />
                  AI Image Generator
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Generate Scroll-Stopping AI Image
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Choose your AI image concept and watch it come to life
                </p>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="grid grid-cols-3 gap-3 h-full">
                  {postData.imageIdeas?.map((idea, index) => (
                    <div
                      key={index}
                      className="group relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-3 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-lg flex flex-col h-full"
                    >
                      <div className="flex items-start gap-2 mb-2 flex-shrink-0">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0 font-bold text-xs shadow-md">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wide">
                            Concept #{index + 1}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 mb-3 overflow-y-auto min-h-0">
                        <div className="pr-1">
                          <p
                            className={`text-xs text-gray-600 dark:text-gray-400 leading-relaxed ${
                              expandedDescriptions[index] ? "" : "line-clamp-3"
                            }`}
                          >
                            {expandedDescriptions[index]
                              ? idea
                              : truncateText(idea, 60)}
                          </p>
                          {idea.length > 60 && (
                            <button
                              onClick={(e) => toggleDescription(index, e)}
                              className="mt-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md transition-colors"
                            >
                              {expandedDescriptions[index] ? (
                                <>
                                  Show less <ChevronUp className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  Show more <ChevronDown className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectIdea({ title: idea })}
                        className="w-full px-2 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1 font-semibold text-[9px] group-hover:scale-[1.02] transform flex-shrink-0"
                      >
                        <Sparkles className="w-3 h-3" />
                        Generate AI Image
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {aiImageStep === "generating" && (
            <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center animate-pulse shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Generating AI Image
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 text-center">
                Creating:{" "}
                <span className="font-semibold">{selectedIdea?.title}</span>
              </p>
              <div className="w-full max-w-xs mb-4">
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Processing...</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span>This may take a few moments</span>
              </div>
            </div>
          )}
          {aiImageStep === "preview" && generatedImageUrl && (
            <div className="h-full flex flex-col p-6">
              <div className="text-center mb-3 flex-shrink-0">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 text-sm font-medium mb-2">
                  <Check className="w-4 h-4" />
                  Image Generated
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Your AI Generated Image
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {selectedIdea?.title}
                </p>
              </div>
              <div className="flex-1 relative mb-3 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={generatedImageUrl}
                  alt="AI Generated"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                  <Check className="w-3 h-3" />
                  Generated
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleRegenerateImage}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors font-medium flex items-center justify-center gap-1.5 text-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  Regenerate
                </button>
                <button
                  onClick={handleUseImage}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center justify-center gap-1.5 shadow-md text-xs"
                >
                  <Check className="w-3 h-3" />
                  Use This Image
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (
      selectedButton === "aiImage" &&
      (postData.image?.imageUrl || generatedImageUrl)
    ) {
      return (
        <div className="relative" style={getImageStyle(primaryPlatform)}>
          <img
            src={postData.image?.imageUrl || generatedImageUrl}
            alt="AI Generated"
            className="w-full h-full object-cover rounded-lg"
            onLoad={() => setImageLoaded(true)}
            style={{
              filter: showBlur ? "blur(8px)" : "none",
              transition: "filter 0.5s ease-out",
              display: imageLoaded ? "block" : "none",
            }}
          />
          <button
            onClick={() => setAiImageStep("select")}
            className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-colors"
            title="Generate new AI image"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="relative" style={getImageStyle(primaryPlatform)}>
        <img
          src={postData[selectedButton]?.imageUrl}
          alt="Post content"
          className="w-full h-full object-cover rounded-lg"
          onLoad={() => setImageLoaded(true)}
          style={{
            filter: showBlur ? "blur(8px)" : "none",
            transition: "filter 0.5s ease-out",
            display: imageLoaded ? "block" : "none",
          }}
        />
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-auto">
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

        <div className="flex items-center space-x-2 p-2">
          <button
            onClick={() => setSelectedButton("aiImage")}
            className={`${baseStyles} ${
              selectedButton === "aiImage" ? selectedStyles : unselectedStyles
            }`}
          >
            <span className="text-[12px]">AI Image</span>
            <ImageLucide className="w-4 h-4" />
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
          <div className="flex items-center justify-center rounded-lg w-full">
            {selectedButton === "aiImage" ||
            selectedButton === "brandingImage" ||
            selectedButton === "sloganImage" ? (
              renderImageLayout()
            ) : (
              <div
                className="w-full flex items-center justify-center animate-pulse rounded"
                style={{
                  ...getImageStyle(primaryPlatform),
                  backgroundColor: "rgba(184, 188, 194, 0.87)",
                }}
              >
                <ImageLucide className="w-12 h-12 text-gray-500" />
              </div>
            )}
          </div>
        </Tooltip>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 bg-primary p-4 rounded-lg">
          <Tooltip title="Approve the Post" arrow>
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
                  Approve <Check className="text-white w-4 h-4" />
                </>
              )}
            </button>
          </Tooltip>
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setShowDatePicker(true)}
          >
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs ml-2">
              <Tooltip title="Post Date" arrow>
                {postData?.date
                  ? format(new Date(postDate), "MMM d, yyyy, h:mm a")
                  : "Today"}
              </Tooltip>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs md:block sm:hidden bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded capitalize">
            <Tooltip title="Platform" arrow>
              <a
                href={getPlatformUrl(primaryPlatform)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {primaryPlatform}
              </a>{" "}
            </Tooltip>
          </span>

          <button
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            onClick={() => onEdit(postData)}
          >
            <Tooltip title="Edit Post" arrow>
              <Edit className="w-4 h-4" />
            </Tooltip>
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Tooltip title="Download Post" arrow>
              <Download className="w-4 h-4" />
            </Tooltip>
          </button>
          <button
            onClick={() => onDelete(postData)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Tooltip title="Delete Post" arrow>
              <Trash2 className="w-4 h-4" />
            </Tooltip>
          </button>
        </div>
      </div>

      <div className="flex justify-center mt-[-13px] text-xs text-gray-500 dark:text-gray-400">
        <Tooltip title="Post Id">
          <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
            POST ID: #{postData?.postId}
          </span>
        </Tooltip>
      </div>

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

      {showCustomizationModal && selectedIdea && (
        <div className="fixed z-[10000] bg-black bg-opacity-0">
          <AIImageCustomizationModal
            selectedIdea={selectedIdea}
            onClose={() => setShowCustomizationModal(false)}
            onGenerate={handleGenerateWithInputs}
          />
        </div>
      )}

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
