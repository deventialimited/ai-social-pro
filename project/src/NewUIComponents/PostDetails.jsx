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
  const [postImage, setPostImage] = useState("");
  const [logoImage, setLogoImage] = useState("");
  const contentRef = useRef(null);
  const navigate = useNavigate();

  const unsplashAccessKey = "5w7aP7QnXpmTCtXBGALuXCLRuv6XxhJ4Fhb0q9jyn_I";

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

  useEffect(() => {
    const fetchPostImage = async () => {
      try {
        const res = await fetch(
          `https://api.unsplash.com/photos/random?query=education,technology&orientation=landscape&client_id=${unsplashAccessKey}`
        );
        const data = await res.json();
        setPostImage(data.urls.regular);
      } catch (error) {
        console.error("Error fetching post image:", error);
        setPostImage("https://via.placeholder.com/600x400.png?text=Post+Image");
      }
    };

    const fetchLogoImage = async () => {
      try {
        const res = await fetch(
          `https://api.unsplash.com/photos/random?query=${dummyPost.brandName}+logo&orientation=squarish&client_id=${unsplashAccessKey}`
        );
        const data = await res.json();
        setLogoImage(data.urls.thumb);
      } catch (error) {
        console.error("Error fetching logo image:", error);
        setLogoImage("https://via.placeholder.com/80x80.png?text=Logo");
      }
    };

    fetchPostImage();
    fetchLogoImage();
  }, []);

  return (
    <div className="relative bg-white dark:bg-gray-800 dark:text-white rounded-2xl shadow-md w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
      <div className="overflow-y-auto p-6 pb-24">
        <h1
          className="text-center font-bold text-3xl mb-10 text-transparent bg-clip-text"
          style={{
            background:
              "linear-gradient(90deg, rgba(49, 67, 204, 1) 0%, rgba(175, 87, 199, 1) 53%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Congratulations! Your First Post Is Ready
        </h1>

        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={logoImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                {dummyPost.brandName}
              </h2>
              <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                New Post
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-2">
            <h2 className="text-[12px] text-gray-500 dark:text-gray-300 rounded">
              Visual
            </h2>
            <div className="flex gap-2">
              {["image", "branding", "slogan"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedButton(type)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm ${
                    selectedButton === type
                      ? "bg-blue-100 text-blue-700 border-blue-300"
                      : "text-gray-500 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {type === "image" && <Image className="w-4 h-4" />}
                  {type === "branding" && <Palette className="w-4 h-4" />}
                  {type === "slogan" && <Type className="w-4 h-4" />}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-800 dark:text-gray-200">
          <p
            ref={contentRef}
            className={`${!showFullText ? "line-clamp-2" : ""}`}
          >
            {dummyPost.postText}
          </p>
          {isClamped && (
            <button
              onClick={() => setShowFullText(!showFullText)}
              className="text-blue-600 dark:text-blue-400 text-sm mt-1 underline"
            >
              {showFullText ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        <div className="rounded-xl overflow-hidden mb-4">
          <img
            src={postImage}
            alt="Post Visual"
            style={getImageStyle(dummyPost.platform)}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-300">
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

      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-700 p-4">
        <div className="text-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white px-6 py-2 rounded-lg text-sm w-full font-medium"
            style={{
              background:
                "linear-gradient(90deg, rgba(49, 67, 204, 1) 0%, rgba(175, 87, 199, 1) 53%)",
            }}
          >
            See All Posts
          </button>
        </div>
      </div>
    </div>
  );
}
