import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@mui/material";
import {
  Image,
  Palette,
  Type,
  CalendarDays,
  Edit,
  Trash2,
  Download,
} from "lucide-react";

const dummyPost = {
  platform: "linkedin",
  postText:
    "Discover how EduTlush is revolutionizing the education landscape with cutting-edge technology and personalized learning solutions. Join us on a journey to empower learners worldwide.",
  brandName: "EduTlush",
  profileImage: "https://your-business-logo.jpg",
  postDate: "April 14, 2025",
};

const getImageStyle = (platform) => {
  switch (platform) {
    case "x":
      return { aspectRatio: "2/1", objectFit: "cover" };
    case "linkedin":
      return { aspectRatio: "4/3", objectFit: "cover" };
    case "instagram":
      return { aspectRatio: "1/1", objectFit: "cover" };
    default:
      return { aspectRatio: "1/1", objectFit: "cover" };
  }
};

export default function PostDetails() {
  const [selectedButton, setSelectedButton] = useState("image");
  const [showFullText, setShowFullText] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkClamping = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight } = contentRef.current;
        setIsClamped(scrollHeight > clientHeight);
      }
    };
    checkClamping();
    window.addEventListener("resize", checkClamping);
    return () => window.removeEventListener("resize", checkClamping);
  }, []);

  return (
    <div className="relative bg-white rounded-2xl shadow-md w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col">
      {/* Scrollable Content */}
      <div className="overflow-y-auto p-6 pb-24">
        {/* Header */}
        <h1 className="text-center font-bold text-3xl mb-10 text-purple-700">
          Congratulations! Your First Post Is Ready
        </h1>

        {/* Header with Profile Info + Visual Buttons */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
              <img
                src={dummyPost.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">
                {dummyPost.brandName}
              </h2>
              <span className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                New Post
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-2">
            <h2 className="text-[12px] text-gray-500 rounded">Visual</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedButton("image")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm ${
                  selectedButton === "image"
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "text-gray-500 border-gray-300"
                }`}
              >
                <Image className="w-4 h-4" />
                Image
              </button>
              <button
                onClick={() => setSelectedButton("branding")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm ${
                  selectedButton === "branding"
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "text-gray-500 border-gray-300"
                }`}
              >
                <Palette className="w-4 h-4" />
                Branding
              </button>
              <button
                onClick={() => setSelectedButton("slogan")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm ${
                  selectedButton === "slogan"
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "text-gray-500 border-gray-300"
                }`}
              >
                <Type className="w-4 h-4" />
                Slogan
              </button>
            </div>
          </div>
        </div>

        {/* Post Text */}
        <div className="mb-4 text-sm text-gray-800">
          <p
            ref={contentRef}
            className={`${!showFullText ? "line-clamp-2" : ""}`}
          >
            {dummyPost.postText}
          </p>
          {isClamped && (
            <button
              onClick={() => setShowFullText(!showFullText)}
              className="text-blue-600 text-sm mt-1 underline"
            >
              {showFullText ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {/* Post Image */}
        <div className="rounded-xl overflow-hidden mb-4">
          <img
            src="https://via.placeholder.com/600x400.png?text=Generated+Post+Image"
            alt="Post Visual"
            style={getImageStyle(dummyPost.platform)}
            className="w-full"
          />
        </div>

        {/* Post Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-4 flex-wrap">
            <button className="text-white bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 flex items-center gap-2">
              Approve
              <Check className="text-white w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>{dummyPost.postDate}</span>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded capitalize">
                {dummyPost.platform}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Edit className="w-4 h-4 cursor-pointer hover:text-blue-600" />
            <Trash2 className="w-4 h-4 cursor-pointer hover:text-red-600" />
            <Download className="w-4 h-4 cursor-pointer hover:text-green-600" />
          </div>
        </div>
      </div>

      {/* Sticky Footer Button */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="text-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-purple-700 hover:bg-purple-900 text-white px-6 py-2 rounded-lg text-sm w-full"
          >
            See All Posts
          </button>
        </div>
      </div>
    </div>
  );
}
