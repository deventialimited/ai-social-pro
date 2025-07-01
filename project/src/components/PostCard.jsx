import React, { useState, useRef, useEffect } from "react";
import { PostEditModal } from "../components/PostEditModal";
import {
  Calendar,
  Edit,
  Trash2,
  Check,
  Image as ImageLucide,
  Palette,
  Type,
  Download,
  Save,
  Copy,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  useReschedulePost,
  useApproveAndSchedulePost,
  useUpdatePostImage,
} from "../libs/postService";
import AIImageCustomizationModal from "../PopUps/AIImageCustomizationModal";

export const PostCard = ({ post, onEdit, onDelete, onReschedule, view }) => {
  const getValidDate = (date) => {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  };
  const updatePostMutation = useUpdatePostImage();

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedButton, setSelectedButton] = useState("brandingImage");
  const [showFullText, setShowFullText] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getValidDate(post.date));
  const [postDate, setPostDate] = useState(getValidDate(post.date));
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [deletePost, setDeletePost] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageBlurred, setImageBlurred] = useState(true);
  const [aiImageStep, setAiImageStep] = useState("select");
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const contentRef = useRef(null);
  const primaryPlatform = post?.platform;
  const { mutate: reschedule, isLoading: isRescheduling } = useReschedulePost();
  const { mutate: approveAndSchedule, isLoading: isApproving } =
    useApproveAndSchedulePost();

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

  useEffect(() => {
    if (imageLoaded) {
      const timer = setTimeout(() => setImageBlurred(false), 1500);
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

  useEffect(() => {
    if (post?.imageIdeas) {
      console.log("Image Ideas fetched:", post.imageIdeas);
    }
  }, [post]);

  const platformDimensions = {
    facebook: [1200, 630],
    x: [1200, 675],
    linkedin: [1200, 627],
    instagram: [1080, 1080],
  };

  const getImageStyle = (platform) => {
    const [canvasWidth, canvasHeight] = platformDimensions[
      platform?.toLowerCase()
    ] || [1200, 675];
    const edited = post[selectedButton]?.editorStatus === "edited";
    const aspectRatio = canvasWidth / canvasHeight;

    return {
      width: "100%",
      aspectRatio,
      objectFit: "cover",
      maxWidth: edited ? `${canvasWidth}px` : `${Math.min(canvasWidth, 600)}px`,
      height: "auto",
    };
  };

  const getStatusBadge = () => {
    switch (post.status) {
      case "drafted":
        return (
          <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
            Draft
          </span>
        );
      case "scheduled":
        return (
          <span className="badge bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full text-xs">
            Scheduled
          </span>
        );
      case "published":
        return (
          <span className="badge bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full text-xs">
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

  const handleDownload = () => {
    const imageUrl = getSelectedImageUrl();
    if (!imageUrl) {
      toast.error("Image not found");
      return;
    }

    const link = document.createElement("a");
    link.href = imageUrl;
    link.setAttribute("download", `${selectedButton}_${post.postId}.png`);
    link.setAttribute("target", "_blank"); // Optional: open in new tab if needed
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Download initiated!");
  };
  

  const getSelectedImageUrl = () => {
    if (selectedButton === "image" && generatedImageUrl)
      return generatedImageUrl;
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
      const img = new Image();
      img.crossOrigin = "anonymous";
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
        postId: post.postId,
        platform: primaryPlatform,
        imageIdea: selectedIdea.title,
        postTopic: post.topic || "",
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
        { postId: post.postId, imageUrl: data.imageUrl },
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
    if (post.image?.imageUrl) {
      return (
        <div className="relative" style={getImageStyle(primaryPlatform)}>
          <img
            src={post.image.imageUrl}
            alt="Post content"
            className="w-full h-full object-cover rounded-lg"
            onLoad={() => setImageLoaded(true)}
            style={{
              filter: imageBlurred ? "blur(20px)" : "none",
              transition: "filter 0.3s ease",
              display: imageLoaded ? "block" : "none",
              cursor: "pointer",
            }}
            onClick={() => setShowEditModal(true)}
          />
        </div>
      );
    }

    if (generatedImageUrl) {
      return (
        <div className="relative" style={getImageStyle(primaryPlatform)}>
          <img
            src={generatedImageUrl}
            alt="AI Generated"
            className="w-full h-full object-cover rounded-lg"
            onLoad={() => setImageLoaded(true)}
            style={{
              filter: imageBlurred ? "blur(20px)" : "none",
              transition: "filter 0.3s ease",
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
      <div className="w-full aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden">
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
                {post.imageIdeas.map((idea, index) => (
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
                      className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 font-semibold text-xs group-hover:scale-[1.02] transform flex-shrink-0"
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
  };

  const renderBrandingLayout = () => {
    if (post.id === "post-7") {
      return (
        <div className="w-full aspect-video bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg p-8">
          <div className="flex h-full">
            <div className="w-2/3 h-full pr-8">
              <img
                src="https://images.pexels.com/photos/4553012/pexels-photo-4553012.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Sustainable tourism"
                className="w-full h-full object-cover rounded-lg shadow-2xl"
              />
            </div>
            <div className="w-1/3 flex flex-col items-center justify-center">
              <img
                src={post?.domainId?.siteLogo || "/b-logo.png"}
                alt="Brand logo"
                className="w-32 h-32 object-contain rounded-lg bg-white/10 p-4 backdrop-blur-sm"
              />
              <h2 className="text-2xl font-bold text-white text-center mt-4">
                {post.domainId.clientName || "Kaz Routes"}
              </h2>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full aspect-video bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex flex-col items-center justify-center gap-6">
        <img
          src={generatedImageUrl || post.brandingImage?.imageUrl}
          alt="Post content"
          className="w-2/3 h-auto object-cover rounded-lg shadow-xl"
        />
        <div className="flex flex-col items-center">
          <img
            src={post?.domainId?.siteLogo || "/b-logo.png"}
            alt="Brand logo"
            className="w-24 h-24 object-contain bg-white/10 rounded-xl p-4 backdrop-blur-sm"
          />
          <h3 className="text-xl font-bold text-white mt-3">
            {post.domainId.clientName || "Kaz Routes"}
          </h3>
        </div>
      </div>
    );
  };

  const renderSloganLayout = () => {
    if (post.id === "post-7") {
      return (
        <div className="w-full aspect-video bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center p-8">
          <div className="w-1/2 bg-white rounded-xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-purple-600 text-center">
              {post.sloganImage?.imageUrl ||
                "Your Gateway to Authentic Kazakhstan"}
            </h2>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full aspect-video bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center p-8">
        <h2 className="w-2/3 text-5xl font-bold text-white text-center leading-tight">
          {post.sloganImage?.imageUrl || "Your Gateway to Authentic Kazakhstan"}
        </h2>
      </div>
    );
  };

  const baseStyles =
    "flex border-b border-gray-200 dark:border-gray-700 rounded-3xl items-center justify-between gap-1 px-2 py-1 transition-colors";
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
                src={post?.domainId?.siteLogo || "/b-logo.png"}
                alt="Business logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">
                {post.domainId.clientName || "Kaz Routes"}
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
                  ? ImageLucide
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
                      : "AI Image"}{" "}
                    {/* Changed from "image" to "AI Image" */}
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
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopyImageToClipboard}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm"
                  title="Copy post image"
                >
                  <ImageLucide className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center rounded-lg w-full">
            {selectedButton === "image" ? (
              renderImageLayout()
            ) : post[selectedButton]?.imageUrl ? (
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
          <div className="flex items-center gap-4 p-4 rounded-lg">
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
                {(
                  <span>
                    <a
                      href={getPlatformUrl(primaryPlatform)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {primaryPlatform}
                    </a>
                  </span>
                ) || "Platform not set"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs inline md:hidden bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded capitalize">
              {primaryPlatform}
            </span>
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Edit post"
            >
              <Edit className="w-4 h-4" />
            </button>
            {post.status !== "drafted" && (
              <button
                onClick={() => onEdit(post, "drafted")}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Save to drafts"
              >
                <Save className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
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
              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
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
                    <Loader2 className="animate-spin h-4 w-4" />
                    Updating...
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
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

      {showCustomizationModal && selectedIdea && (
        <div className="fixed z-[10000] bg-black bg-opacity-0">
          <AIImageCustomizationModal
            selectedIdea={selectedIdea}
            onClose={() => setShowCustomizationModal(false)}
            onGenerate={handleGenerateWithInputs}
          />
        </div>
      )}
    </>
  );
};

export default PostCard;
