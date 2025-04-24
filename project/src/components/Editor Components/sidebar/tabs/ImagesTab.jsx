import { Upload, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { createImageElement } from "../hooks/ImagesHooks";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";

function ImagesTab() {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const fileInputRef = useRef(null);
  const { addElement, addFile } = useEditor();
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
        console.log(response);
        setImages((prev) => [...prev, ...response.data]);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [page, query]);

  const handleScroll = (e) => {
    console.log(e)
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) setPage((prev) => prev + 1);
  };

  const handleAddImage = async (src) => {
    try {
      // 1. Fetch image from the remote URL
      const response = await fetch(src);
      const blob = await response.blob();

      // 2. Generate a local object URL for rendering in the frontend
      const objectUrl = URL.createObjectURL(blob);

      // 3. Create and add the canvas element with local object URL
      const newElement = createImageElement(objectUrl); // includes a unique `id`
      addElement(newElement);

      // 4. Store file with element ID as the name for backend API use
      const file = new File([blob], newElement.id, { type: blob.type });
      addFile(file);

      // ✅ Now the element is visible on canvas and its original file is stored for API upload
    } catch (error) {
      console.error("Failed to add image:", error);
    }
  };

  const handleUploadImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      handleAddImage(reader.result); // This adds image to canvas
    };
    reader.readAsDataURL(file);
  };
  console.log(images);
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

      <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
        <div className="grid grid-cols-2 gap-2" onScroll={handleScroll}>
          {images?.map((img, index) => (
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
