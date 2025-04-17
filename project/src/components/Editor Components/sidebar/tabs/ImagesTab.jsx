import { Upload, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

function ImagesTab() {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const fileInputRef = useRef(null);

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

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) setPage((prev) => prev + 1);
  };

  const handleAddImage = (src) => {
    const newElement = createImageElement(src);
    addElement(newElement);
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
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary text-white px-3 py-1 rounded text-sm"
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

      <div
        className="grid grid-cols-2 gap-2 overflow-y-auto"
        onScroll={handleScroll}
      >
        {images?.map((img) => (
          <div
            key={img.id}
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
  );
}

export default ImagesTab;
