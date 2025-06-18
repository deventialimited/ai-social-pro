import { Upload, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
import {
  useUploadUserImageMutation,
  useUploadedImagesQuery,
} from "../../../../libs/uploadedImageService";
import { createImageElement } from "../hooks/ImagesHooks";

function ImagesTab() {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const fileInputRef = useRef(null);
  const { addElement, addFile, setCanvasLoading } = useEditor();
  const { mutate: uploadImage } = useUploadUserImageMutation(); // For image upload
  const [userId, setUserId] = useState(null);
  const { postOtherValues } = useEditor();
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const toggleKeyword = (keyword) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  };
  useEffect(() => {
    if (selectedKeywords.length > 0) {
      const combined = selectedKeywords.join(" ");
      setQuery(combined);
      setPage(1);
      setImages([]);
    }
  }, [selectedKeywords]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?._id) {
      setUserId(storedUser._id);
    }
  }, []);
  const {
    data: uploadedImages,
    isLoading,
    isError,
  } = useUploadedImagesQuery(userId);
  // Fetch Unsplash images
  const fetchImages = async () => {
    try {
      let response;

      if (query) {
        response = await axios.get(`https://api.unsplash.com/search/photos`, {
          params: {
            query,
            page,
            per_page: 12,
            client_id: "FVuPZz9YhT7O4DdL8zWtjSQTCFMj9ubMCF06bDR52lk",
          },
        });
        setImages((prev) => [...prev, ...response.data.results]);
      } else {
        response = await axios.get(`https://api.unsplash.com/photos`, {
          params: {
            page,
            per_page: 12,
            client_id: "FVuPZz9YhT7O4DdL8zWtjSQTCFMj9ubMCF06bDR52lk",
          },
        });
        setImages((prev) => [...prev, ...response.data]);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
    }
  };
  useEffect(() => {
    fetchImages();
  }, [page, query]);
  useEffect(() => {
    if (postOtherValues?.keywords?.length > 0) {
      setSelectedKeywords(postOtherValues.keywords); // select all by default
    }
  }, [postOtherValues?.keywords]);

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) setPage((prev) => prev + 1);
  };

  const handleAddImage = async (src, category = null) => {
    try {
      setCanvasLoading(true);

      const response = await fetch(src, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const blob = await response.blob();

      const objectUrl = URL.createObjectURL(blob);
      const newElement = createImageElement(objectUrl, category,src); // includes a unique `id`
      addElement(newElement);

      const file = new File([blob], newElement.id, { type: blob.type });
      addFile(file);
      setCanvasLoading(false);
    } catch (error) {
      setCanvasLoading(false);
      console.error("Failed to add image:", error);
    }
  };

  const handleUploadImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file); // 'file' is the input file
    formData.append("userId", userId);

    uploadImage(formData); // Calling the mutation or API function
  };
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary text-black px-3 py-1 rounded text-sm"
          >
            Upload
          </button>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handleUploadImage}
          />
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Stock"
            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
              setImages([]);
            }}
          />
        </div>
      </div>
      {postOtherValues?.keywords?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {postOtherValues.keywords.map((keyword, idx) => (
            <button
              key={idx}
              onClick={() => toggleKeyword(keyword)}
              className={`px-3 py-1 capitalize rounded text-sm border transition-colors ${
                selectedKeywords.includes(keyword)
                  ? " text-black"
                  : "bg-gray-200 text-black"
              }`}
            >
              {keyword}
            </button>
          ))}
        </div>
      )}

      {/* Gallery Section */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 2px)" }}
        onScroll={handleScroll}
      >
        <div className="grid md:grid-cols-2 grid-cols-3 gap-2">
          {/* Display uploaded images */}
          {postOtherValues?.siteLogo && (
            <div
              onClick={() =>
                handleAddImage(postOtherValues?.siteLogo, "brandLogo")
              }
              className="aspect-square bg-gray-200 rounded-md overflow-hidden hover:opacity-80 cursor-pointer"
            >
              <img
                src={postOtherValues?.siteLogo}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {images[0] && (
            <div
              onClick={() => handleAddImage(images[0].urls.small, "other")}
              className="relative aspect-square bg-gray-200 rounded-md overflow-hidden hover:opacity-80 cursor-pointer"
            >
              <img
                src={images[0].urls.small}
                alt={images[0].alt_description}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 right-5 left-5 flex items-center justify-center">
                <div className="bg-white/70 px-4 py-2 rounded-md text-center text-sm font-semibold text-gray-800">
                  Image based on keywords
                </div>
              </div>
            </div>
          )}

          {uploadedImages?.map((img) => (
            <div
              key={img._id}
              onClick={() => handleAddImage(img.imageUrl)}
              className="aspect-square bg-gray-200 rounded-md overflow-hidden hover:opacity-80 cursor-pointer"
            >
              <img
                src={img.imageUrl}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Display Unsplash images */}
          {images?.slice(1)?.map((img, index) => (
            <div
              key={index}
              onClick={() => handleAddImage(img.urls.small)}
              className="aspect-square bg-gray-200 rounded-md overflow-hidden hover:opacity-80 cursor-pointer"
            >
              <img
                src={img.urls.small}
                alt={img.alt_description}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImagesTab;
