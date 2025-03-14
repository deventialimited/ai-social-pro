// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const ACCESS_KEY = "FVuPZz9YhT7O4DdL8zWtjSQTCFMj9ubMCF06bDR52lk";

export function ImagesTabContent({ onSelectImage }) {
  const [images, setImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"uploaded" | "search">("uploaded");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastImageRef = useRef<HTMLImageElement | null>(null);

  type UnsplashImage = {
    urls: {
      small: string;
    };
    alt_description?: string;
  };

  const [fetchImages, setFetchImages] = useState<UnsplashImage[]>([]);

  // Handle Image Upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));

    setImages((prevImages) => [...prevImages, ...imageUrls]);
    setActiveTab("uploaded");
  };

  // Fetch from Unsplash (random or search)
  const fetchFromUnsplash = async (
    e?: React.FormEvent,
    resetResults: boolean = true
  ) => {
    if (e) e.preventDefault();

    try {
      setLoading(true);
      const currentPage = resetResults ? 1 : page;
      let response;

      if (searchQuery.trim()) {
        // If there's a search query, use search endpoint
        response = await axios.get(`https://api.unsplash.com/search/photos`, {
          params: {
            query: searchQuery,
            client_id: ACCESS_KEY,
            page: currentPage,
            per_page: 30,
          },
        });

        const fetched_data = response.data.results;
        console.log("Fetched Search Data:", fetched_data);

        if (Array.isArray(fetched_data)) {
          if (resetResults) {
            setFetchImages(fetched_data);
            setPage(2);
          } else {
            setFetchImages((prev) => [...prev, ...fetched_data]);
            setPage(currentPage + 1);
          }
          setHasMore(fetched_data.length === 30);
        }
      } else {
        // If no search query, fetch random images
        response = await axios.get(`https://api.unsplash.com/photos`, {
          params: {
            client_id: ACCESS_KEY,
            page: currentPage,
            per_page: 30,
            order_by: "popular",
          },
        });

        const fetched_data = response.data;
        console.log("Fetched Random Data:", fetched_data);

        if (Array.isArray(fetched_data)) {
          if (resetResults) {
            setFetchImages(fetched_data);
            setPage(2);
          } else {
            setFetchImages((prev) => [...prev, ...fetched_data]);
            setPage(currentPage + 1);
          }
          setHasMore(fetched_data.length === 30);
        }
      }

      setActiveTab("search");
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger input field focus
  const handleInputClick = () => {
    if (fetchImages.length === 0) {
      fetchFromUnsplash(undefined, true);
    }
  };

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    // Disconnect previous observer if exists
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        // If last image is visible and we're not currently loading and there's more to load
        if (
          entries[0].isIntersecting &&
          !loading &&
          hasMore &&
          activeTab === "search"
        ) {
          fetchFromUnsplash(undefined, false);
        }
      },
      {
        rootMargin: "100px", // Start loading a bit before reaching the end
      }
    );

    // Observe the last image
    if (lastImageRef.current) {
      observer.current.observe(lastImageRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, fetchImages, hasMore, activeTab]);

  // Attach ref to the last image
  const attachRef = (el: HTMLImageElement | null, index: number) => {
    if (!el) return;

    if (activeTab === "search" && index === fetchImages.length - 1) {
      lastImageRef.current = el;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Upload Button */}
        <label className="flex items-center justify-between py-2 gap-2 px-4 border rounded-md shadow-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
          Upload
          <ArrowUpTrayIcon className="h-5 w-5 text-gray-500" />
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>

        {/* Search Input */}
        <form
          onSubmit={(e) => fetchFromUnsplash(e, true)}
          className="flex justify-between items-center px-4 py-2 border rounded-md shadow-sm text-gray-700"
        >
          <input
            type="text"
            className="h-6 outline-0 w-full"
            placeholder="Search"
            value={searchQuery}
            onClick={handleInputClick}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            onClick={() => fetchFromUnsplash(undefined, true)}
          >
            <MagnifyingGlassIcon className="w-5 text-gray-500" />
          </button>
        </form>
      </div>

      {/* Images Display Section */}
      <div className="mt-4">
        {activeTab === "uploaded" && images.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Uploaded Images</h3>
            <div className="h-[350px] overflow-y-auto grid grid-cols-3 gap-2 p-1">
              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Uploaded ${i}`}
                  className="w-full h-24 object-cover rounded-md"
                  onClick={() => onSelectImage(src)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "search" && fetchImages.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">
              {searchQuery.trim()
                ? `Results for "${searchQuery}"`
                : "Popular Images"}
            </h3>
            <div className="h-[350px] overflow-y-auto grid grid-cols-3 gap-2 p-1">
              {fetchImages.map((image, i) => (
                <img
                  key={i}
                  ref={(el) => attachRef(el, i)}
                  src={image.urls.small}
                  alt={image.alt_description || `Image ${i}`}
                  className="w-full h-24 object-cover rounded-md"
                  onClick={() => onSelectImage(image.urls.small)}
                />
              ))}
              {loading && (
                <div className="col-span-3 text-center py-4">
                  Loading more images...
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "search" && fetchImages.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No images found. Try a different search term.
          </div>
        )}

        {activeTab === "search" && fetchImages.length === 0 && loading && (
          <div className="text-center py-8 text-gray-500">
            Loading images...
          </div>
        )}
      </div>
    </>
  );
}
