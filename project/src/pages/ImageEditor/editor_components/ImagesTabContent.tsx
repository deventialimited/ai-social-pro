// @ts-nocheck
import React from "react";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import html2canvas from "html2canvas";

const ACCESS_KEY = "FVuPZz9YhT7O4DdL8zWtjSQTCFMj9ubMCF06bDR52lk";

export function ImagesTabContent({
  onSelectImage,
  canvasEditor,
  onUploadClick,
}) {
  const [images, setImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"uploaded" | "search">("uploaded");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastImageRef = useRef<HTMLImageElement | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isImageLocked, setIsImageLocked] = useState<boolean>(false);
  const [imageData, setImageData] = useState(null);

  type UnsplashImage = {
    urls: {
      small: string;
    };
    alt_description?: string;
  };

  const [fetchImages, setFetchImages] = useState<UnsplashImage[]>([]);

  // Load image data from localStorage on component mount
  useEffect(() => {
    const storedImageData = localStorage.getItem("imageData");
    if (storedImageData) {
      const parsedData = JSON.parse(storedImageData);
      setImageData(parsedData);
      if (parsedData.id) {
        setSelectedImageId(parsedData.id);
      }
    }
  }, []);

  // Handle Image Upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));

    // Update local images
    setImages((prevImages) => [...prevImages, ...imageUrls]);

    // If the first uploaded image should be selected
    if (imageUrls.length > 0) {
      handleImageSelect(`uploaded-0`, imageUrls[0]);

      // Also call the parent's onSelectImage if provided
      onSelectImage(imageUrls[0]);
    }

    setActiveTab("uploaded");
  };

  // Fetch from Unsplash (random or search)
  const fetchFromUnsplash = async (
    e?: React.FormEvent,
    resetResults = true
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

  // Update image data in localStorage and state
  const updateImageData = (newData) => {
    const updatedData = { ...imageData, ...newData };
    setImageData(updatedData);
    localStorage.setItem("imageData", JSON.stringify(updatedData));

    // If we have a canvas editor reference, update the image there too
    if (
      canvasEditor &&
      canvasEditor.current &&
      canvasEditor.current.onUpdateImage
    ) {
      canvasEditor.current.onUpdateImage(updatedData);
    }
  };

  // Image toolbar action handlers
  const handleFlip = () => {
    if (!imageData) return;

    // Create a new canvas to flip the image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Flip horizontally
      ctx.translate(img.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);

      // Convert back to data URL
      const flippedImageUrl = canvas.toDataURL("image/png");

      // Update the image source
      updateImageData({ src: flippedImageUrl });

      // Update post data if needed
      const postData = localStorage.getItem("postdata");
      if (postData) {
        const parsedData = JSON.parse(postData);
        parsedData.image = flippedImageUrl;
        localStorage.setItem("postdata", JSON.stringify(parsedData));
      }
    };

    img.src = imageData.src;
  };

  const handleEffects = () => {
    if (!imageData) return;

    // Simple grayscale effect as an example
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Apply grayscale effect
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
      }

      ctx.putImageData(imageData, 0, 0);

      // Convert back to data URL
      const effectImageUrl = canvas.toDataURL("image/png");

      // Update the image source
      updateImageData({ src: effectImageUrl });

      // Update post data if needed
      const postData = localStorage.getItem("postdata");
      if (postData) {
        const parsedData = JSON.parse(postData);
        parsedData.image = effectImageUrl;
        localStorage.setItem("postdata", JSON.stringify(parsedData));
      }
    };

    img.src = imageData.src;
  };

  const handleFitToPage = () => {
    if (!imageData) return;

    // Get canvas dimensions
    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    // Calculate new dimensions while maintaining aspect ratio
    const aspectRatio = imageData.width / imageData.height;
    let newWidth, newHeight;

    if (canvasWidth / canvasHeight > aspectRatio) {
      // Canvas is wider than the image
      newHeight = canvasHeight * 0.9;
      newWidth = newHeight * aspectRatio;
    } else {
      // Canvas is taller than the image
      newWidth = canvasWidth * 0.9;
      newHeight = newWidth / aspectRatio;
    }

    // Calculate center position
    const newX = (canvasWidth - newWidth) / 2;
    const newY = (canvasHeight - newHeight) / 2;

    // Update image data
    updateImageData({
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY,
    });
  };

  const handleApplyMask = (maskType: string) => {
    if (!imageData) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Apply mask directly
      ctx.globalCompositeOperation = "destination-in";
      ctx.beginPath();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const size = Math.min(canvas.width, canvas.height);

      switch (maskType) {
        case "circle":
          ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
          break;
        case "square":
          ctx.rect(centerX - size / 2, centerY - size / 2, size, size);
          break;
        case "star":
          drawStar(ctx, centerX, centerY, 5, size / 2, size / 4);
          break;
        case "triangle":
          drawPolygon(ctx, centerX, centerY, 3, size / 2);
          break;
        case "diamond":
          ctx.moveTo(centerX, centerY - size / 2);
          ctx.lineTo(centerX + size / 2, centerY);
          ctx.lineTo(centerX, centerY + size / 2);
          ctx.lineTo(centerX - size / 2, centerY);
          break;
        case "hexagon":
          drawPolygon(ctx, centerX, centerY, 6, size / 2);
          break;
        case "cloud":
          drawCloud(ctx, centerX, centerY, size / 2);
          break;
        case "heart":
          drawHeart(ctx, centerX, centerY, size / 2);
          break;
        default:
          ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
      }

      ctx.closePath();
      ctx.clip();

      // Apply the mask to the original image
      ctx.drawImage(img, 0, 0);

      // Get the masked image data
      const maskedImageUrl = canvas.toDataURL("image/png");

      // Replace the existing image directly
      const existingImage = document.querySelector(
        `img[src="${imageData.src}"]`
      );
      if (existingImage) {
        existingImage.src = maskedImageUrl;
      }

      // Update the original image data
      imageData.src = maskedImageUrl;
      setImageData({ ...imageData });

      // Update post data if needed
      const postData = localStorage.getItem("postdata");
      if (postData) {
        const parsedData = JSON.parse(postData);
        parsedData.image = maskedImageUrl;
        localStorage.setItem("postdata", JSON.stringify(parsedData));
      }

      // Update the canvas editor if available
      if (canvasEditor?.current?.onUpdateImage) {
        canvasEditor.current.onUpdateImage(imageData);
      }

      // Update any other image references in the DOM
      const images = document.querySelectorAll(`img[src="${imageData.src}"]`);
      images.forEach((img) => {
        img.src = maskedImageUrl;
      });
    };

    img.src = imageData.src;
  };

  // Helper functions for drawing complex shapes
  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
  };

  const drawPolygon = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    sides: number,
    radius: number
  ) => {
    ctx.moveTo(cx + radius * Math.cos(0), cy + radius * Math.sin(0));
    for (let i = 1; i <= sides; i++) {
      ctx.lineTo(
        cx + radius * Math.cos((i * 2 * Math.PI) / sides),
        cy + radius * Math.sin((i * 2 * Math.PI) / sides)
      );
    }
  };

  const drawHeart = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number
  ) => {
    const width = size * 2;
    const height = size * 2;

    ctx.moveTo(cx, cy + height / 4);

    // Left curve
    ctx.bezierCurveTo(
      cx - width / 2,
      cy - height / 2,
      cx - width / 2,
      cy - height / 2,
      cx,
      cy - height / 4
    );

    // Right curve
    ctx.bezierCurveTo(
      cx + width / 2,
      cy - height / 2,
      cx + width / 2,
      cy - height / 2,
      cx,
      cy + height / 4
    );
  };

  const drawCloud = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number
  ) => {
    ctx.moveTo(cx - size / 2, cy);
    ctx.bezierCurveTo(cx - size / 2, cy - size / 2, cx, cy - size / 2, cx, cy);
    ctx.bezierCurveTo(
      cx,
      cy - size / 2,
      cx + size / 2,
      cy - size / 2,
      cx + size / 2,
      cy
    );
    ctx.bezierCurveTo(
      cx + size / 2,
      cy + size / 2,
      cx,
      cy + size / 2,
      cx - size / 2,
      cy
    );
  };

  const handleCrop = () => {
    if (!imageData) return;

    // For simplicity, we'll just crop to the center 50% of the image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const cropWidth = img.width / 2;
      const cropHeight = img.height / 2;
      const cropX = img.width / 4;
      const cropY = img.height / 4;

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Draw the cropped portion
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      // Convert back to data URL
      const croppedImageUrl = canvas.toDataURL("image/png");

      // Update the image source
      updateImageData({ src: croppedImageUrl });

      // Update post data if needed
      const postData = localStorage.getItem("postdata");
      if (postData) {
        const parsedData = JSON.parse(postData);
        parsedData.image = croppedImageUrl;
        localStorage.setItem("postdata", JSON.stringify(parsedData));
      }
    };

    img.src = imageData.src;
  };

  const handleUpload = () => {
    // Trigger file input click
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const handleChangeImage = () => {
    // Open image selection interface
    setActiveTab("search");
    if (fetchImages.length === 0) {
      fetchFromUnsplash(undefined, true);
    }
  };

  const handlePosition = () => {
    if (!imageData) return;

    // Center the image on the canvas
    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    const newX = (canvasWidth - imageData.width) / 2;
    const newY = (canvasHeight - imageData.height) / 2;

    updateImageData({ x: newX, y: newY });
  };

  const handleBorderChange = () => {
    if (!imageData) return;

    // Add a simple border to the image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const borderWidth = 10;
      canvas.width = img.width + borderWidth * 2;
      canvas.height = img.height + borderWidth * 2;

      // Draw border (white rectangle)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the image on top
      ctx.drawImage(img, borderWidth, borderWidth);

      // Convert back to data URL
      const borderedImageUrl = canvas.toDataURL("image/png");

      // Update the image source
      updateImageData({ src: borderedImageUrl });

      // Update post data if needed
      const postData = localStorage.getItem("postdata");
      if (postData) {
        const parsedData = JSON.parse(postData);
        parsedData.image = borderedImageUrl;
        localStorage.setItem("postdata", JSON.stringify(parsedData));
      }
    };

    img.src = imageData.src;
  };

  const handleCornerChange = () => {
    if (!imageData) return;

    // Round the corners of the image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Create rounded rectangle
      const radius = 20;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(canvas.width - radius, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
      ctx.lineTo(canvas.width, canvas.height - radius);
      ctx.quadraticCurveTo(
        canvas.width,
        canvas.height,
        canvas.width - radius,
        canvas.height
      );
      ctx.lineTo(radius, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.clip();

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Convert back to data URL
      const roundedImageUrl = canvas.toDataURL("image/png");

      // Update the image source
      updateImageData({ src: roundedImageUrl });

      // Update post data if needed
      const postData = localStorage.getItem("postdata");
      if (postData) {
        const parsedData = JSON.parse(postData);
        parsedData.image = roundedImageUrl;
        localStorage.setItem("postdata", JSON.stringify(parsedData));
      }
    };

    img.src = imageData.src;
  };

  const handleLock = () => {
    // Toggle image lock state
    setIsImageLocked(!isImageLocked);

    // Update the canvas editor if available
    if (canvasEditor && canvasEditor.current) {
      // This would need to be implemented in the canvas editor
      console.log("Image locked:", !isImageLocked);
    }
  };

  const handleCopy = async () => {
    if (!imageData) return;

    // Get the current image element to ensure we copy the masked version
    const currentImage = document.querySelector(`img[src="${imageData.src}"]`);
    if (!currentImage) return;

    // Create a temporary container for the image
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = `${currentImage.width}px`;
    container.style.height = `${currentImage.height}px`;
    container.style.overflow = "hidden";

    // Clone the image and add it to the container
    const clonedImage = currentImage.cloneNode(true) as HTMLImageElement;
    clonedImage.style.width = "100%";
    clonedImage.style.height = "100%";
    container.appendChild(clonedImage);

    // Add the container to the document
    document.body.appendChild(container);

    try {
      // Use html2canvas to capture the masked version
      const canvas = await html2canvas(container, {
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: currentImage.width,
        height: currentImage.height,
        scale: 1,
        x: 0,
        y: 0,
      });

      // Get the masked image data URL
      const maskedImageUrl = canvas.toDataURL("image/png");

      // Create a duplicate of the image with slight offset using the masked version
      const newImageData = {
        ...imageData,
        id: `${imageData.id}-copy-${Date.now()}`,
        x: imageData.x + 20,
        y: imageData.y + 20,
        src: maskedImageUrl, // Use the masked version from canvas
        maskType: imageData.maskType, // Preserve the mask type
        maskApplied: true, // Mark that a mask is applied
        originalSrc: imageData.originalSrc || imageData.src, // Store original source
        width: currentImage.naturalWidth || currentImage.width,
        height: currentImage.naturalHeight || currentImage.height,
      };

      // Update the image data with the masked version
      updateImageData(newImageData);

      // Update post data if needed
      const postData = localStorage.getItem("postdata");
      if (postData) {
        const parsedData = JSON.parse(postData);
        parsedData.image = maskedImageUrl;
        localStorage.setItem("postdata", JSON.stringify(parsedData));
      }

      // Update the canvas editor if available
      if (canvasEditor?.current?.onUpdateImage) {
        canvasEditor.current.onUpdateImage(newImageData);
      }

      // Force a re-render of the image
      const images = document.querySelectorAll(`img[src="${imageData.src}"]`);
      images.forEach((img) => {
        img.src = maskedImageUrl;
      });

      // Add the new image to the canvas
      const newImage = new Image();
      newImage.src = maskedImageUrl;
      newImage.onload = () => {
        if (canvasEditor?.current?.addImage) {
          canvasEditor.current.addImage(newImage, {
            x: newImageData.x,
            y: newImageData.y,
            width: newImageData.width,
            height: newImageData.height,
            maskType: newImageData.maskType,
            maskApplied: true,
            src: maskedImageUrl, // Ensure we use the masked version
            originalSrc: newImageData.originalSrc, // Store original source
            isMasked: true, // Explicitly mark as masked
          });
        }
      };
    } catch (error) {
      console.error("Error capturing masked image:", error);
    } finally {
      // Clean up the temporary container
      document.body.removeChild(container);
    }
  };

  const handleDelete = () => {
    if (!imageData || isImageLocked) return;

    // Clear the image data
    setImageData(null);
    setSelectedImageId(null);
    localStorage.removeItem("imageData");

    // Update post data if needed
    const postData = localStorage.getItem("postdata");
    if (postData) {
      const parsedData = JSON.parse(postData);
      parsedData.image = null;
      localStorage.setItem("postdata", JSON.stringify(parsedData));
    }

    // Notify the canvas editor
    if (
      canvasEditor &&
      canvasEditor.current &&
      canvasEditor.current.onDeleteImage
    ) {
      canvasEditor.current.onDeleteImage();
    }
  };

  const handleUndo = () => {
    // This would require keeping a history of changes
    console.log("Undo action");
  };

  const handleRedo = () => {
    // This would require keeping a history of changes
    console.log("Redo action");
  };

  // Handle image selection
  const handleImageSelect = (id: string, src: string) => {
    setSelectedImageId(id);

    // Call the parent's onSelectImage with both the image source and initial state
    if (onSelectImage) {
      onSelectImage(src);
      // Reset all transformations when selecting a new image
      updateImageData({
        id,
        src,
        scale: 1,
        rotation: 0,
        position: { x: 0, y: 0 },
        scaleX: 1,
        scaleY: 1,
        filters: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
        },
      });
    }
  };

  // Call handleImageUpload when the upload button in @enhanced-image-toolbar.tsx is clicked
  useEffect(() => {
    if (onUploadClick) {
      onUploadClick(() => {
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput) fileInput.click();
      });
    }
  }, [onUploadClick]);

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
                  id={`uploaded-${i}`}
                  src={src || "/placeholder.svg"}
                  alt={`Uploaded ${i}`}
                  className={`w-full h-24 object-cover rounded-md ${
                    selectedImageId === `uploaded-${i}`
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => handleImageSelect(`uploaded-${i}`, src)}
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
                  id={`search-${i}`}
                  ref={(el) => attachRef(el, i)}
                  src={image.urls.small || "/placeholder.svg"}
                  alt={image.alt_description || `Image ${i}`}
                  className={`w-full h-24 object-cover rounded-md ${
                    selectedImageId === `search-${i}`
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() =>
                    handleImageSelect(`search-${i}`, image.urls.small)
                  }
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
