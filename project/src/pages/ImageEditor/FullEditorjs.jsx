"use client";

// @ts-nocheck
import React from "react";
import { Fragment, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowUpTrayIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ChevronDownIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ChevronRightIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/outline";
import { Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas";
import axios from "axios";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Importing Firebase config

import ShapesTabContent from "./shapTabContent";
import CanvasEditor from "./CanvasEditor";
import { ImagesTabContent } from "./editor_components/ImagesTabContent";
import {
  Toolbar,
  ShapeToolbar,
  BackgroundToolbar,
} from "./editor_components/Toolbar";
import { EnhancedImageToolbar } from "./editor_components/enhanced-image-toolbar";
import { EffectsPanel } from "./editor_components/EffectsPanel"; // Import EffectsPanel

const ACCESS_KEY = "FVuPZz9YhT7O4DdL8zWtjSQTCFMj9ubMCF06bDR52lk";

const FullEditor = ({
  postImageDetails,
  setPostImageDetails,
  setIsGraphicEditorModal,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [postId, setPostId] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");

  const [activeTab, setActiveTab] = useState("images");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [shapes, setShapes] = useState([]);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundImages, setBackgroundImages] = useState([]);
  const [backgroundColors, setBackgroundColors] = useState([]);
  const [colors, setColors] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // New state for enhanced image editing
  const [selectedTool, setSelectedTool] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({
    x: 0,
    y: 0,
  });
  const [imageFilters, setImageFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });

  const [imageEffects, setImageEffects] = useState({
    blur: 0,
    brightness: 100,
    sepia: 0,
    grayscale: 0,
    border: 0,
    cornerRadius: 0,
    shadow: {
      blur: 0,
      offsetX: 0,
      offsetY: 0,
    },
  });

  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  const [postBodyActive, setPostBodyActive] = useState(false);
  const [editingTextId, setEditingTextId] = useState(null);
  const [textColor, setTextColor] = useState("#000000");
  const [isTextAreaActive, setIsTextAreaActive] = useState(false);
  const postData = localStorage.getItem("postdata");
  if (postData) {
    var { topic, content, image, post_id } = JSON.parse(postData);
  }
  const [postBody, setPostBody] = useState("");

  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);

  // Add state to store original images
  const [originalImages, setOriginalImages] = useState({});

  // Save data to Firebase Firestore
  const saveDataToFirebase = async () => {
    try {
      const postId = post_id;
      const idToUse = postId || "1";
      await setDoc(doc(db, "posts", idToUse), {
        shapes,
        backgroundColor,
        backgroundImage,
        postBody,
        history,
        historyIndex,
        imageScale,
        imagePosition,
        imageFilters,
        scaleX,
        scaleY,
        imageEffects,
        images,
      });
      console.log("Data saved successfully to Firebase with postId:", idToUse);
    } catch (e) {
      console.error("Error saving document: ", e);
    }
  };

  // Load data from Firebase Firestore
  const loadDataFromFirebase = async () => {
    try {
      const docRef = doc(db, "posts", post_id || "1");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Data retrieved from Firebase:", data);
        setShapes(data.shapes || []);
        setBackgroundColor(data.backgroundColor || "#ffffff");
        setBackgroundImage(data.backgroundImage || null);
        setPostBody(data.postBody || "");
        setHistory(data.history || []);
        setHistoryIndex(data.historyIndex || -1);

        if (data.imageScale) setImageScale(data.imageScale);
        if (data.imagePosition) setImagePosition(data.imagePosition);
        if (data.imageFilters) setImageFilters(data.imageFilters);
        if (data.scaleX) setScaleX(data.scaleX);
        if (data.scaleY) setScaleY(data.scaleY);
        if (data.imageEffects) setImageEffects(data.imageEffects);
        if (data.images) setImages(data.images);
      } else {
        console.log("No such document!");
      }
    } catch (e) {
      console.error("Error getting document: ", e);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("postId");
    if (id) {
      setPostId(id);
    }
  }, [location]);

  useEffect(() => {
    if (!postId) {
      setPostId("1");
    } else {
      loadDataFromFirebase();
    }
  }, [postId]);

  // Image editing functions

  const captureDiagramAsImage = async () => {
    try {
      // First, load the data from Firebase to ensure we have the latest data
      saveDataToFirebase();
      await loadDataFromFirebase();

      // Wait a moment for the React state to update and render with the loaded data
      await new Promise((resolve) => setTimeout(resolve, 500)); // Increased timeout for reliable rendering

      // Get the canvas element
      const diagramElement = document.getElementById("canvas");

      if (!diagramElement) {
        console.error("Canvas element not found");
        return;
      }

      // Add the postBody text directly to the original DOM before capturing
      // This is more reliable than trying to add it in the onclone callback
      const tempTextElement = document.createElement("div");
      tempTextElement.id = "temp-post-body-text";
      tempTextElement.style.position = "absolute";
      tempTextElement.style.top = "10px";
      tempTextElement.style.left = "10px";
      tempTextElement.style.color = textColor || "#000000";
      tempTextElement.style.fontSize = "16px";
      tempTextElement.style.fontFamily = "Arial, sans-serif";
      tempTextElement.style.zIndex = "1000"; // Ensure it's on top
      tempTextElement.style.padding = "5px";
      // tempTextElement.style.backgroundColor = "rgba(255, 255, 255, 0.7)"; // Semi-transparent background for readability
      tempTextElement.textContent = postBody;

      // Make sure the container can handle absolute positioning
      if (
        diagramElement.style.position !== "absolute" &&
        diagramElement.style.position !== "relative" &&
        diagramElement.style.position !== "fixed"
      ) {
        diagramElement.style.position = "relative";
      }

      diagramElement.appendChild(tempTextElement);

      // Create a canvas from the HTML element with the loaded Firebase data
      const canvas = await html2canvas(diagramElement, {
        useCORS: true, // This helps with any cross-origin images
        scale: 2, // Increase quality
        backgroundColor: backgroundColor || "#ffffff", // Use the loaded background color
        logging: true, // Enable logging for debugging
        allowTaint: true, // This can help with rendering issues
      });

      // Clean up by removing the temporary text element
      const textToRemove = document.getElementById("temp-post-body-text");
      if (textToRemove && textToRemove.parentNode) {
        textToRemove.parentNode.removeChild(textToRemove);
      }

      // Convert the canvas to a blob
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png", 1.0)
      );

      if (!blob) {
        console.error("Failed to create blob from canvas");
        return;
      }

      // Create a downloadable link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Include some Firebase data in the filename
      const timestamp = new Date().getTime();
      const filename = `editor_${postId || "1"}_${timestamp}.png`;
      a.download = filename;

      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log("Image downloaded successfully with Firebase data");
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  useEffect(() => {
    const fetchBackgroundData = async () => {
      try {
        const response = await axios.get(
          "https://api.unsplash.com/search/photos",
          {
            params: {
              client_id: ACCESS_KEY,
              query: "abstract gradient background",
              per_page: 30,
              orientation: "landscape",
            },
          }
        );

        if (response.data?.results?.length > 0) {
          const images = response.data.results.map((image) => ({
            url: image.urls.regular,
            color: image.color || "#ffffff",
            pattern: image.urls.thumb,
          }));

          setBackgroundImages(images.map((image) => image.url));
          setBackgroundColors(images.map((image) => image.color));
          setColors(images.map((image) => image.color));
          setPatterns(images.map((image) => image.pattern));
        }
      } catch (error) {
        console.error("Error fetching backgrounds from Unsplash:", error);
      }
    };

    fetchBackgroundData();
  }, []);

  // Add a shape to the canvas
  const handleAddShape = (shape) => {
    const lastShape = shapes[shapes.length - 1];
    const offset = lastShape ? 15 : 40;
    const newShape = {
      ...shape,
      x: lastShape ? lastShape.x + offset : offset,
      y: lastShape ? lastShape.y + offset : offset,
      effects: {
        shadow: false,
        blur: 0,
        opacity: 0,
        offsetX: 0,
        offsetY: 0,
        color: "#000000",
      },
      borderStyle: "solid",
      borderColor: "#000000",
      borderWidth: 0,
    };
    const newShapes = [...shapes, newShape];
    setShapes(newShapes);
    addToHistory({ shapes: newShapes });
  };

  // Update a shape's properties
  const handleUpdateShape = (updatedShape) => {
    const newShapes = shapes.map((shape) =>
      shape.id === updatedShape.id ? updatedShape : shape
    );
    setShapes(newShapes);
    addToHistory({ shapes: newShapes });
  };

  // Update an image's properties
  const handleUpdateImage = (updatedImage) => {
    setImages((currentImages) => {
      const existingIndex = currentImages.findIndex(
        (img) => img.id === updatedImage.id
      );
      if (existingIndex !== -1) {
        const newImages = [...currentImages];
        newImages[existingIndex] = updatedImage;
        return newImages;
      } else {
        return [...currentImages, updatedImage];
      }
    });

    localStorage.setItem("imageData", JSON.stringify(updatedImage));
  };

  // Delete the selected shape
  const handleDeleteShape = (id) => {
    const newShapes = shapes.filter((shape) => shape.id !== id);
    setShapes(newShapes);
    setSelectedShapeId(null);
    addToHistory({ shapes: newShapes });
  };

  // Duplicate the selected shape
  const handleDuplicateShape = () => {
    if (selectedShapeId) {
      const shapeToClone = shapes.find((shape) => shape.id === selectedShapeId);
      if (shapeToClone) {
        const newShape = {
          ...shapeToClone,
          id: `${shapeToClone.id}-copy-${Date.now()}`,
          x: shapeToClone.x + 20,
          y: shapeToClone.y + 20,
        };
        const newShapes = [...shapes, newShape];
        setShapes(newShapes);
        setSelectedShapeId(newShape.id);
        addToHistory({ shapes: newShapes });
      }
    }
  };

  // Duplicate the selected image
  const handleDuplicateImage = (imageId) => {
    const imageToDuplicate = images.find((img) => img.id === imageId);
    if (imageToDuplicate) {
      const duplicatedImage = {
        ...imageToDuplicate,
        id: `${imageToDuplicate.id}-${Date.now()}`,
        x: imageToDuplicate.x + 20,
        y: imageToDuplicate.y + 20,
        rotation: imageToDuplicate.rotation,
      };

      setImages((currentImages) => [...currentImages, duplicatedImage]);
      localStorage.setItem("imageData", JSON.stringify(duplicatedImage));
      setSelectedImageId(duplicatedImage.id);

      setBackgroundImage(duplicatedImage.url);
    }
  };

  // Delete the selected image
  const handleDeleteImage = (imageId) => {
    setImages((currentImages) =>
      currentImages.filter((img) => img.id !== imageId)
    );

    localStorage.removeItem("imageData");
    setSelectedImageId(null);
  };

  // Rotate the selected shape
  const handleRotateShape = () => {
    if (!selectedShapeId) {
      console.error("No shape selected for rotation");
      return;
    }

    const shapeToRotate = shapes.find((shape) => shape.id === selectedShapeId);
    if (!shapeToRotate) {
      console.error("Shape to rotate not found");
      return;
    }

    const currentRotation = shapeToRotate.rotation;
    if (typeof currentRotation !== "number" || isNaN(currentRotation)) {
      console.error("Current rotation value is not a valid number");
      return;
    }

    const newRotation = (currentRotation + 45) % 360;
    const updatedShape = { ...shapeToRotate, rotation: newRotation };
    handleUpdateShape(updatedShape);
  };

  // Rotate the selected image
  const handleRotateImage = () => {
    if (!selectedImageId) {
      console.error("No image selected for rotation");
      return;
    }

    const imageToRotate = images.find((img) => img.id === selectedImageId);
    if (!imageToRotate) {
      console.error("Image to rotate not found");
      return;
    }

    const currentRotation = imageToRotate.rotation;
    if (typeof currentRotation !== "number" || isNaN(currentRotation)) {
      console.error("Current rotation value is not a valid number");
      return;
    }

    const newRotation = (currentRotation + 45) % 360;
    const updatedImage = { ...imageToRotate, rotation: newRotation };
    handleUpdateImage(updatedImage);
  };

  const handleEffectChange = (effect, value) => {
    if (effect.includes(".")) {
      const [parent, child] = effect.split(".");
      setImageEffects((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setImageEffects((prev) => ({
        ...prev,
        [effect]: value,
      }));
    }

    addToHistory({
      imageEffects: {
        ...imageEffects,
        [effect]: value,
      },
    });
  };

  // Add to history
  const addToHistory = (state) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo action
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousState = history[historyIndex - 1];
      setShapes(previousState.shapes || []);
      setBackgroundColor(previousState.backgroundColor || "#ffffff");
      setPostBody(previousState.postBody || "");

      if (previousState.imageScale !== undefined)
        setImageScale(previousState.imageScale);
      if (previousState.imagePosition !== undefined)
        setImagePosition(previousState.imagePosition);
      if (previousState.imageFilters !== undefined)
        setImageFilters(previousState.imageFilters);
      if (previousState.scaleX !== undefined) setScaleX(previousState.scaleX);
      if (previousState.scaleY !== undefined) setScaleY(previousState.scaleY);
      if (previousState.imageEffects !== undefined)
        setImageEffects(previousState.imageEffects);
      if (previousState.images !== undefined) setImages(previousState.images);
    }
  };

  // Redo action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      setShapes(nextState.shapes || []);
      setBackgroundColor(nextState.backgroundColor || "#ffffff");
      setPostBody(nextState.postBody || "");

      if (nextState.imageScale !== undefined)
        setImageScale(nextState.imageScale);
      if (nextState.imagePosition !== undefined)
        setImagePosition(nextState.imagePosition);
      if (nextState.imageFilters !== undefined)
        setImageFilters(nextState.imageFilters);
      if (nextState.scaleX !== undefined) setScaleX(nextState.scaleX);
      if (nextState.scaleY !== undefined) setScaleY(nextState.scaleY);
      if (nextState.imageEffects !== undefined)
        setImageEffects(nextState.imageEffects);
      if (nextState.images !== undefined) setImages(nextState.images);
    }
  };

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([
        {
          shapes: [],
          backgroundColor: "#ffffff",
          postBody: "",
          imageScale: 1,
          imagePosition: { x: 0, y: 0 },
          imageFilters: { brightness: 100, contrast: 100, saturation: 100 },
          scaleX: 1,
          scaleY: 1,
          imageEffects: {
            blur: 0,
            brightness: 100,
            sepia: 0,
            grayscale: 0,
            border: 0,
            cornerRadius: 0,
            shadow: {
              blur: 0,
              offsetX: 0,
              offsetY: 0,
            },
          },
          images: [],
        },
      ]);
      setHistoryIndex(0);
    }
  }, [history]);

  // Enhanced image editing functions
  const handleCrop = () => {
    setIsCropping(true);
    setSelectedTool("crop");
  };

  const handleFlipHorizontal = () => {
    const newScaleX = scaleX * -1;
    setScaleX(newScaleX);
    addToHistory({ scaleX: newScaleX });
  };

  const handleCropStart = (x, y) => {
    setCropArea({ x, y, width: 0, height: 0 });
  };

  const handleCropMove = (width, height) => {
    if (cropArea) {
      setCropArea({ ...cropArea, width, height });
    }
  };

  const handleCropComplete = () => {
    if (
      cropArea &&
      Math.abs(cropArea.width) > 10 &&
      Math.abs(cropArea.height) > 10
    ) {
      const normalizedCropArea = {
        x: cropArea.width < 0 ? cropArea.x + cropArea.width : cropArea.x,
        y: cropArea.height < 0 ? cropArea.y + cropArea.height : cropArea.y,
        width: Math.abs(cropArea.width),
        height: Math.abs(cropArea.height),
      };
      setCropArea(normalizedCropArea);
    } else {
      handleCropCancel();
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setCropArea(null);
    setSelectedTool(null);
  };

  const handleCropApply = () => {
    if (!cropArea || !backgroundImage) return;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const displayedWidth = img.width * imageScale;
      const displayedHeight = img.height * imageScale;

      tempCanvas.width = cropArea.width;
      tempCanvas.height = cropArea.height;

      tempCtx.drawImage(
        img,
        (cropArea.x - imagePosition.x) / imageScale,
        (cropArea.y - imagePosition.y) / imageScale,
        cropArea.width / imageScale,
        cropArea.height / imageScale,
        0,
        0,
        cropArea.width,
        cropArea.height
      );

      const croppedImageUrl = tempCanvas.toDataURL("image/png");

      setBackgroundImage(croppedImageUrl);

      setIsCropping(false);
      setCropArea(null);
      setSelectedTool(null);

      setImagePosition({ x: 0, y: 0 });
      setImageScale(1);
      setScaleX(1);
      setScaleY(1);

      addToHistory({
        backgroundImage: croppedImageUrl,
        imageScale: 1,
        imagePosition: { x: 0, y: 0 },
        scaleX: 1,
        scaleY: 1,
      });
    };

    img.src = backgroundImage;
  };

  const handleImageDragStart = (x, y) => {
    setImagePosition((prev) => ({
      ...prev,
      startX: x,
      startY: y,
    }));
  };

  const handleImageDrag = (deltaX, deltaY) => {
    setImagePosition((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  };

  const handleImageDragEnd = () => {
    addToHistory({ imagePosition });
  };

  const handleFlipVertical = () => {
    const newScaleY = scaleY * -1;
    setScaleY(newScaleY);
    addToHistory({ scaleY: newScaleY });
  };

  const handleZoomIn = () => {
    const newScale = imageScale * 1.1;
    setImageScale(newScale);
    addToHistory({ imageScale: newScale });
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.1, imageScale * 0.9);
    setImageScale(newScale);
    addToHistory({ imageScale: newScale });
  };

  const handleFitToPage = () => {
    if (selectedImage) {
      setBackgroundImage(selectedImage);
      setSelectedImage(null);

      setImageScale(1);
      setImagePosition({ x: 0, y: 0 });
      setScaleX(1);
      setScaleY(1);
      setImageFilters({
        brightness: 100,
        contrast: 100,
        saturation: 100,
      });
      addToHistory({
        backgroundImage: selectedImage,
        imageScale: 1,
        imagePosition: { x: 0, y: 0 },
        scaleX: 1,
        scaleY: 1,
        imageFilters: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
        },
      });

      const canvasElement = document.getElementById("canvas");
      if (canvasElement) {
        const canvasWidth = canvasElement.clientWidth;
        const canvasHeight = canvasElement.clientHeight;
        const imageElement = new Image();
        imageElement.src = selectedImage;
        imageElement.onload = () => {
          const imageWidth = imageElement.width;
          const imageHeight = imageElement.height;
          const widthRatio = canvasWidth / imageWidth;
          const heightRatio = canvasHeight / imageHeight;
          const fitScale = Math.min(widthRatio, heightRatio);
          setImageScale(fitScale);
          setImagePosition({
            x: (canvasWidth - imageWidth * fitScale) / 2,
            y: (canvasHeight - imageHeight * fitScale) / 2,
          });
          addToHistory({
            imageScale: fitScale,
            imagePosition: {
              x: (canvasWidth - imageWidth * fitScale) / 2,
              y: (canvasHeight - imageHeight * fitScale) / 2,
            },
          });
        };
      }
    }
  };

  const handleBrightnessChange = (value) => {
    setImageFilters((prev) => ({
      ...prev,
      brightness: value,
    }));
  };

  const handleContrastChange = (value) => {
    setImageFilters((prev) => ({
      ...prev,
      contrast: value,
    }));
  };

  const handleSaturationChange = (value) => {
    setImageFilters((prev) => ({
      ...prev,
      saturation: value,
    }));
  };

  const handleFilterChangeComplete = () => {
    addToHistory({ imageFilters });
  };

  const handleEffects = () => {
    setActiveTab(activeTab === "effects" ? "images" : "effects");
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result;
        setBackgroundImage(imageUrl);
        addToHistory({ backgroundImage: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyMask = (maskType) => {
    if (!backgroundImage) return;

    const selectedImageElement =
      document.querySelector("#canvas img.selected") ||
      document.querySelector("#canvas img");
    if (!selectedImageElement) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = "#000000";
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
        case "rectangle":
          const rectWidth = size;
          const rectHeight = size * 0.75;
          ctx.rect(
            centerX - rectWidth / 2,
            centerY - rectHeight / 2,
            rectWidth,
            rectHeight
          );
          break;
        case "triangle":
          ctx.moveTo(centerX, centerY - size / 2);
          ctx.lineTo(centerX + size / 2, centerY + size / 2);
          ctx.lineTo(centerX - size / 2, centerY + size / 2);
          break;
        case "diamond":
          ctx.moveTo(centerX, centerY - size / 2);
          ctx.lineTo(centerX + size / 2, centerY);
          ctx.lineTo(centerX, centerY + size / 2);
          ctx.lineTo(centerX - size / 2, centerY);
          break;
        case "pentagon":
          for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const x = centerX + (size / 2) * Math.cos(angle);
            const y = centerY + (size / 2) * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          break;
        case "hexagon":
          for (let i = 0; i < 6; i++) {
            const angle = (i * 2 * Math.PI) / 6;
            const x = centerX + (size / 2) * Math.cos(angle);
            const y = centerY + (size / 2) * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          break;
        case "octagon":
          for (let i = 0; i < 8; i++) {
            const angle = (i * 2 * Math.PI) / 8;
            const x = centerX + (size / 2) * Math.cos(angle);
            const y = centerY + (size / 2) * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          break;
        case "star":
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const radius = i % 2 === 0 ? size / 2 : size / 4;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          break;
        case "heart":
          const topCurveHeight = size * 0.3;
          ctx.moveTo(centerX, centerY + size / 4);
          ctx.bezierCurveTo(
            centerX,
            centerY,
            centerX - size / 2,
            centerY,
            centerX - size / 2,
            centerY - topCurveHeight
          );
          ctx.bezierCurveTo(
            centerX - size / 2,
            centerY - size / 2,
            centerX,
            centerY - size / 3,
            centerX,
            centerY - size / 3
          );
          ctx.bezierCurveTo(
            centerX,
            centerY - size / 3,
            centerX + size / 2,
            centerY - size / 2,
            centerX + size / 2,
            centerY - topCurveHeight
          );
          ctx.bezierCurveTo(
            centerX + size / 2,
            centerY,
            centerX,
            centerY,
            centerX,
            centerY + size / 4
          );
          break;
        case "cloud":
          const radius = size / 4;
          ctx.arc(centerX - radius, centerY, radius, Math.PI, 0, true);
          ctx.arc(
            centerX,
            centerY - radius,
            radius,
            Math.PI * 1.5,
            Math.PI * 0.5,
            true
          );
          ctx.arc(centerX + radius, centerY, radius, Math.PI, 0, true);
          ctx.arc(
            centerX + radius,
            centerY + radius,
            radius,
            Math.PI * 1.5,
            Math.PI * 0.5,
            true
          );
          ctx.arc(
            centerX - radius,
            centerY + radius,
            radius,
            Math.PI * 1.5,
            Math.PI * 0.5,
            true
          );
          break;
        case "cross":
          const armWidth = size / 3;
          const armLength = size / 2;
          ctx.rect(centerX - armWidth / 2, centerY - armLength, armWidth, size);
          ctx.rect(centerX - armLength, centerY - armWidth / 2, size, armWidth);
          break;
        case "shield":
          ctx.moveTo(centerX, centerY - size / 2);
          ctx.lineTo(centerX + size / 2, centerY - size / 4);
          ctx.quadraticCurveTo(
            centerX + size / 2,
            centerY + size / 2,
            centerX,
            centerY + size / 2
          );
          ctx.quadraticCurveTo(
            centerX - size / 2,
            centerY + size / 2,
            centerX - size / 2,
            centerY - size / 4
          );
          break;
        case "blob1":
          ctx.moveTo(centerX, centerY - size / 2);
          ctx.bezierCurveTo(
            centerX + size / 3,
            centerY - size / 2,
            centerX + size / 2,
            centerY - size / 3,
            centerX + size / 2,
            centerY
          );
          ctx.bezierCurveTo(
            centerX + size / 2,
            centerY + size / 3,
            centerX + size / 3,
            centerY + size / 2,
            centerX,
            centerY + size / 2
          );
          ctx.bezierCurveTo(
            centerX - size / 3,
            centerY + size / 2,
            centerX - size / 2,
            centerY + size / 3,
            centerX - size / 2,
            centerY
          );
          ctx.bezierCurveTo(
            centerX - size / 2,
            centerY - size / 3,
            centerX - size / 3,
            centerY - size / 2,
            centerX,
            centerY - size / 2
          );
          break;
        case "blob2":
          ctx.moveTo(centerX, centerY - size / 2);
          ctx.bezierCurveTo(
            centerX + size / 2,
            centerY - size / 3,
            centerX + size / 3,
            centerY + size / 3,
            centerX,
            centerY + size / 2
          );
          ctx.bezierCurveTo(
            centerX - size / 3,
            centerY + size / 3,
            centerX - size / 2,
            centerY - size / 3,
            centerX,
            centerY - size / 2
          );
          break;
        case "wave":
          const amplitude = size / 4;
          const frequency = Math.PI * 2;
          ctx.moveTo(0, centerY);
          for (let x = 0; x < canvas.width; x++) {
            const y =
              centerY + amplitude * Math.sin((x / canvas.width) * frequency);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(canvas.width, canvas.height);
          ctx.lineTo(0, canvas.height);
          break;
        default:
          ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
      }

      ctx.closePath();
      ctx.fill();

      const maskedImageUrl = canvas.toDataURL("image/png");

      selectedImageElement.src = maskedImageUrl;

      if (selectedImageElement.classList.contains("main-image")) {
        setBackgroundImage(maskedImageUrl);
      }

      addToHistory({
        backgroundImage: maskedImageUrl,
        imageScale,
        imageRotation: imageToRotate.rotation,
        imagePosition,
        scaleX,
        scaleY,
        imageFilters,
      });
    };

    const imageId = selectedImageElement.dataset.imageId;
    if (!originalImages[imageId]) {
      setOriginalImages((prev) => ({
        ...prev,
        [imageId]: selectedImageElement.src,
      }));
      img.src = selectedImageElement.src;
    } else {
      img.src = originalImages[imageId];
    }
  };

  const items = [
    {
      key: "1",
      label: "Auto animate",
    },
    {
      key: "2",
      label: "Option 2",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "text":
        return <TextTabContent onAddText={handleAddText} />;
      case "images":
        return (
          <ImagesTabContent
            onSelectImage={handleImageSelect}
            onDuplicateImage={handleDuplicateImage}
            onDeleteImage={handleDeleteImage}
          />
        );
      case "elements":
        return <ElementsTabContent />;
      case "background":
        return (
          <BackgroundTabContent
            onColorChange={(color) => {
              setBackgroundImage(null);
              setBackgroundColor(color);
              addToHistory({ backgroundColor: color });
            }}
            colors={colors}
            patterns={patterns}
            onPatternSelect={(pattern) => {
              setBackgroundColor("#ffffff");
              setBackgroundImage(pattern);
              addToHistory({ backgroundImage: pattern });
            }}
          />
        );
      case "layers":
        return (
          <LayersTabContent
            shapes={shapes}
            onSelectShape={setSelectedShapeId}
            selectedShapeId={selectedShapeId}
          />
        );
      case "size":
        return <SizeTabContent />;
      case "shapes":
        return <ShapesTabContent onAddShape={handleAddShape} />;
      case "selectedImage":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={selectedImage || ""}
              alt="Selected"
              className="max-w-full max-h-full"
            />
          </div>
        );
      case "effects":
        return (
          <EffectsPanel
            isOpen={() => activeTab === "effects"}
            onClose={() => setActiveTab("images")}
            effects={imageEffects}
            onEffectChange={handleEffectChange}
            onEffectToggle={(effect) => {
              console.log(`Effect ${effect} toggled`);
            }}
          />
        );
      default:
        return <TextTabContent onAddText={handleAddText} />;
    }
  };

  const handleAddText = (textType) => {
    const newTextArea = createTextArea(textType);
    setPostBody((prevBody) => prevBody + "\n" + newTextArea.textContent);
  };

  const createTextArea = (textType) => {
    let defaultText = "";

    switch (textType) {
      case "header":
        defaultText = "Header";
        break;
      case "h2":
        defaultText = "Sub Header";
        break;
      case "p":
        defaultText = "Body Text";
        break;
      default:
        defaultText = "New Text";
    }

    return {
      id: `textarea-${Date.now()}`,
      textContent: defaultText,
    };
  };

  const handleKeyDown = (event) => {
    if (event.key === "Delete" && selectedShapeId) {
      handleDeleteShape(selectedShapeId);
    } else if (event.ctrlKey && event.key === "c" && selectedShapeId) {
      handleDuplicateShape();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedShapeId]);

  const handleClickOutside = (event) => {
    const editorElement = document.querySelector(".editor-container");
    if (editorElement && !editorElement.contains(event.target)) {
      navigate("/posts");
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const generateUniqueId = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  const handleImageSelect = (image) => {
    setBackgroundImage(image);
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
    setScaleX(1);
    setScaleY(1);
    setImageFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
    });
    addToHistory({
      backgroundImage: image,
      imageScale: 1,
      imagePosition: { x: 0, y: 0 },
      scaleX: 1,
      scaleY: 1,
      imageFilters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
      },
    });
  };

  return (
    <>
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <h3 className="text-lg font-medium flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Image Post Editor
        </h3>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:cursor-pointer"
            onClick={() => setIsGraphicEditorModal(false)}
          >
            Cancel
          </button>

          <div className="relative flex text-left">
            <div>
              <div className="relative">
                <button className="inline-flex items-center rounded-l-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Change to Video</span>
                </button>
              </div>
            </div>

            <Dropdown menu={{ items }} trigger={["click"]}>
              <button
                type="button"
                className="inline-flex items-center rounded-r border border-gray-300 px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                <span className="ant-btn-icon">
                  <DownOutlined />
                </span>
              </button>
            </Dropdown>
          </div>

          <button
            type="button"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:cursor-pointer"
            onClick={captureDiagramAsImage}
          >
            Save and Close
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Left sidebar */}
        <div className="w-24 border-r bg-gray-50">
          <div className="flex flex-col items-center">
            <button
              className={`w-full py-4 flex flex-col items-center justify-center ${
                activeTab === "text" ? "bg-blue-100" : "hover:bg-gray-100"
              } hover:cursor-pointer`}
              onClick={() => setActiveTab("text")}
            >
              <span className="text-2xl font-semibold">A+</span>
              <span className="text-xs mt-1">Text</span>
            </button>

            <button
              className={`w-full py-4 flex flex-col items-center justify-center ${
                activeTab === "images" ? "bg-blue-100" : "hover:bg-gray-100"
              } hover:cursor-pointer`}
              onClick={() => setActiveTab("images")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs mt-1">Images</span>
            </button>

            <button
              className={`w-full py-4 flex flex-col items-center justify-center ${
                activeTab === "elements" ? "bg-blue-100" : "hover:bg-gray-100"
              } hover:cursor-pointer`}
              onClick={() => setActiveTab("shapes")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span className="text-xs mt-1">Elements</span>
            </button>

            <button
              className={`w-full py-4 flex flex-col items-center justify-center ${
                activeTab === "background" ? "bg-blue-100" : "hover:bg-gray-100"
              } hover:cursor-pointer`}
              onClick={() => setActiveTab("background")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              <span className="text-xs mt-1">Background</span>
            </button>

            <button
              className={`w-full py-4 flex flex-col items-center justify-center ${
                activeTab === "layers" ? "bg-blue-100" : "hover:bg-gray-100"
              } hover:cursor-pointer`}
              onClick={() => setActiveTab("layers")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span className="text-xs mt-1">Layers</span>
            </button>

            <button
              className={`w-full py-4 flex flex-col items-center justify-center ${
                activeTab === "size" ? "bg-blue-100" : "hover:bg-gray-100"
              } hover:cursor-pointer`}
              onClick={() => setActiveTab("size")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                />
              </svg>
              <span className="text-xs mt-1">Size</span>
            </button>

            <button
              className={`w-full py-4 flex flex-col items-center justify-center ${
                activeTab === "selectedImage" ? "bg-blue-100" : "hover:bg-gray-100"
              } hover:cursor-pointer`}
              onClick={() => setActiveTab("selectedImage")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
              <span className="text-xs mt-1">Selected Image</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex">
          {/* Sidebar for active tab */}
          <div className="w-1/5 p-4 shadow">
            {renderTabContent()}
          </div>

          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            {isTextAreaActive ? (
              <Toolbar
                onFontChange={(font) => {
                  const updatedShapes = shapes.map((shape) =>
                    shape.id === editingTextId
                      ? { ...shape, fontFamily: font }
                      : shape
                  );
                  setShapes(updatedShapes);
                  addToHistory({ shapes: updatedShapes });
                }}
                onFontSizeChange={(size) => {
                  const updatedShapes = shapes.map((shape) =>
                    shape.id === editingTextId
                      ? { ...shape, fontSize: size }
                      : shape
                  );
                  setShapes(updatedShapes);
                  addToHistory({ shapes: updatedShapes });
                }}
                onColorChange={(color) => {
                  const updatedShapes = shapes.map((shape) =>
                    shape.id === editingTextId ? { ...shape, color } : shape
                  );
                  setShapes(updatedShapes);
                  addToHistory({ shapes: updatedShapes });
                }}
                onBackgroundColorChange={(color) => {
                  const updatedShapes = shapes.map((shape) =>
                    shape.id === editingTextId
                      ? { ...shape, backgroundColor: color }
                      : shape
                  );
                  setShapes(updatedShapes);
                  addToHistory({ shapes: updatedShapes });
                }}
                onCopy={() => {
                  const shapeToCopy = shapes.find(
                    (shape) => shape.id === editingTextId
                  );
                  if (shapeToCopy) {
                    const copiedShape = {
                      ...shapeToCopy,
                      id: generateUniqueId(),
                    };
                    setShapes([...shapes, copiedShape]);
                    addToHistory({
                      shapes: [...shapes, copiedShape],
                    });
                  }
                }}
                onDelete={() => {
                  const updatedShapes = shapes.filter(
                    (shape) => shape.id !== editingTextId
                  );
                  setShapes(updatedShapes);
                  addToHistory({ shapes: updatedShapes });
                }}
                onUndo={handleUndo}
                onRedo={handleRedo}
              />
            ) : selectedShapeId ? (
              <ShapeToolbar
                onColorChange={(color) => {
                  const updatedShapes = shapes.map((shape) =>
                    shape.id === selectedShapeId ? { ...shape, color } : shape
                  );
                  setShapes(updatedShapes);
                  addToHistory({ shapes: updatedShapes });
                }}
                onTransparencyChange={(transparency) => {
                  const updatedShapes = shapes.map((shape) =>
                    shape.id === selectedShapeId
                      ? { ...shape, transparency }
                      : shape
                  );
                  setShapes(updatedShapes);
                  addToHistory({ shapes: updatedShapes });
                }}
                onEffectsChange={(effects) => {
                  const updatedShapes = shapes.map((shape) =>
                    shape.id === selectedShapeId ? { ...shape, effects } : shape
                  );
                  setShapes(updatedShapes);
                  addToHistory({ shapes: updatedShapes });
                }}
                onBorderStyleChange={(style) => {
                  const updatedShapes = shapes.map((shape) =>
                    shape.id === selectedShapeId
                      ? { ...shape, borderStyle: style }
                      : shape
                  );
                  setShapes(updatedShapes);
                  addToHistory({ shapes: updatedShapes });
                }}
                onBorderColorChange={(color) => {
                  const updatedShapes = shapes.map((shape) =>
                    shape.id === selectedShapeId
                      ? { ...shape, borderColor: color }
                      : shape
                  );
                  setShapes(updatedShapes);
                  addToHistory({ shapes: updatedShapes });
                }}
                onBorderWidthChange={(width) => {
                  const updatedShapes = shapes.map((shape) =>
                    shape.id === selectedShapeId
                      ? { ...shape, borderWidth: width }
                      : shape
                  );
                  setShapes(updatedShapes);
                  addToHistory({ shapes: updatedShapes });
                }}
                onCopy={handleDuplicateShape}
                onDelete={() => handleDeleteShape(selectedShapeId)}
                onUndo={handleUndo}
                onRedo={handleRedo}
              />
            ) : backgroundImage ? (
              <EnhancedImageToolbar
                onUndo={handleUndo}
                onRedo={handleRedo}
                onCrop={handleCrop}
                onCropApply={handleCropApply}
                onCropCancel={handleCropCancel}
                onRotate={handleRotateImage}
                onFlip={handleFlipHorizontal}
                onVerticalFlip={handleFlipVertical}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onFitToPage={handleFitToPage}
                onEffects={handleEffects}
                onApplyMask={handleApplyMask}
                onUpload={handleUpload}
                onSelectTool={setSelectedTool}
                onDuplicateImage={handleDuplicateImage}
                onDeleteImage={handleDeleteImage}
              />
            ) : backgroundColor ? (
              <BackgroundToolbar
                onColorChange={(color) => {
                  setBackgroundColor(color);
                  addToHistory({ backgroundColor: color });
                }}
                onUndo={handleUndo}
                onRedo={handleRedo}
              />
            ) : (
              <div className="flex items-center p-2 border-b">
                <div className="flex space-x-2 mr-4">
                  <button
                    className="p-2 rounded-md hover:bg-gray-100 hover:cursor-pointer"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                  >
                    <ArrowUturnLeftIcon className="h-5 w-5 text-gray-500" />
                  </button>
                  <button
                    className="p-2 rounded-md hover:bg-gray-100 hover:cursor-pointer"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                  >
                    <ArrowUturnRightIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex items-center space-x-2 mr-4">
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <span>5s</span>
                </div>

                <div className="relative mr-4">
                  <div>
                    <div className="relative">
                      <button className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:cursor-pointer">
                        <span>Palette</span>
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mr-4">
                  <div
                    className="h-8 w-8 rounded cursor-pointer border border-gray-300"
                    style={{ backgroundColor }}
                  ></div>
                  <span>Background Color</span>
                </div>

                <button className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:cursor-pointer">
                  <ArrowUpTrayIcon className="mr-2 h-5 w-5" />
                  Upload
                </button>

                <div className="ml-auto flex items-center space-x-4">
                  <div className="relative">
                    <button
                      className="rounded-md hover:bg-gray-100 hover:cursor-pointer"
                      style={{ backgroundColor }}
                    >
                      <div className="">
                        <input
                          type="color"
                          className="cursor-pointer w-8 rounded h-7"
                          onChange={(e) => {
                            const newColor = e.target.value;
                            if (selectedShapeId) {
                              const updatedShapes = shapes.map(
                                (shape) =>
                                  shape.id === selectedShapeId
                                    ? { ...shape, color: newColor }
                                    : shape
                              );
                              setShapes(updatedShapes);
                              addToHistory({
                                shapes: updatedShapes,
                              });
                            }
                          }}
                        />
                      </div>
                    </button>
                  </div>
                  <button
                    className="p-2 rounded-md hover:bg-gray-100 hover:cursor-pointer"
                    onClick={handleDuplicateShape}
                    disabled={!selectedShapeId}
                  >
                    <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />
                  </button>
                  <button
                    className="p-2 rounded-md hover:bg-gray-100 hover:cursor-pointer"
                    onClick={handleRotateShape}
                    disabled={!selectedShapeId}
                  >
                    <ArrowsPointingInIcon className="h-5 w-5 text-gray-500" />
                  </button>
                  <button
                    className="p-2 rounded-md hover:bg-gray-100 hover:cursor-pointer"
                    onClick={() =>
                      selectedShapeId && handleDeleteShape(selectedShapeId)
                    }
                    disabled={!selectedShapeId}
                  >
                    <TrashIcon className="h-5 w-5 text-gray-500" />
                  </button>
                  <button
                    className="p-2 rounded-md hover:bg-gray-100 hover:cursor-pointer"
                    onClick={captureDiagramAsImage}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Editor area */}
            <div className="flex-1 bg-gray-200 p-4 ">
              <div className="bg-white w-full h-full rounded-md flex items-center justify-center">
                <CanvasEditor
                  shapes={shapes}
                  onUpdateShape={handleUpdateShape}
                  onSelectShape={setSelectedShapeId}
                  onDeleteShape={handleDeleteShape}
                  onDuplicateShape={handleDuplicateShape}
                  selectedShapeId={selectedShapeId}
                  editingTextId={editingTextId}
                  setEditingTextId={setEditingTextId}
                  backgroundColor={backgroundColor}
                  backgroundImage={backgroundImage}
                  selectedImage={selectedImage}
                  images={images}
                  onUpdateImage={handleUpdateImage}
                  onDeleteImage={handleDeleteImage}
                  onDuplicateImage={handleDuplicateImage}
                  selectedImageId={selectedImageId}
                  onSelectImage={setSelectedImageId}
                  selectedTool={selectedTool}
                  isCropping={isCropping}
                  cropArea={cropArea}
                  onCropStart={handleCropStart}
                  onCropMove={handleCropMove}
                  onCropComplete={handleCropComplete}
                  imageScale={imageScale}
                  imagePosition={imagePosition}
                  imageFilters={imageFilters}
                  onImageDragStart={handleImageDragStart}
                  onImageDrag={handleImageDrag}
                  onImageDragEnd={handleImageDragEnd}
                  scaleX={scaleX}
                  scaleY={scaleY}
                  imageEffects={imageEffects}
                />
              </div>
              <div
                className={`absolute top-60 ml-[10%] text-center rounded-md ${
                  isTextAreaActive ? "border border-black-500" : ""
                }`}
              ></div>

              {/* Zoom controls */}
              <div className="absolute bottom-4 right-4 flex items-center bg-white rounded-md shadow-sm">
                <button
                  className="p-2 hover:bg-gray-100 rounded-l-md hover:cursor-pointer"
                  onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <div className="px-3 py-1 border-l border-r">
                  {zoomLevel}%
                </div>
                <button
                  className="p-2 hover:bg-gray-100 rounded-r-md hover:cursor-pointer"
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Tab content components
const TextTabContent = ({ onAddText }) => {
  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h1
        className="text-4xl font-bold mb-4 cursor-pointer"
        onClick={() => onAddText("header")}
      >
        Create header
      </h1>
      <h2
        className="text-2xl font-medium mb-4 cursor-pointer"
        onClick={() => onAddText("h2")}
      >
        Create sub header
      </h2>
      <p className="text-base cursor-pointer" onClick={() => onAddText("p")}>
        Create body text
      </p>
    </div>
  );
};

const ElementsTabContent = () => {
  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center">
        <p className="text-gray-500">Elements will be displayed here</p>
      </div>
    </div>
  );
};

const BackgroundTabContent = ({
  onColorChange,
  colors,
  patterns,
  onPatternSelect,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="mb-4" style={{ height: "30%" }}>
        <h3 className="text-lg font-medium mb-2">Colors</h3>
        <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-24">
          {colors.map((color, index) => (
            <div
              key={index}
              className="h-10 rounded-md cursor-pointer border border-gray-200"
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
            ></div>
          ))}
        </div>
      </div>
      <div style={{ height: "70%" }}>
        <h3 className="text-lg font-medium mb-2">Patterns</h3>
        <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-128">
          {patterns.map((pattern, index) => (
            <div
              key={index}
              className="h-20 bg-gray-200 rounded-md cursor-pointer flex items-center justify-center"
              style={{ backgroundImage: `url(${pattern})` }}
              onClick={() => onPatternSelect(pattern)}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LayersTabContent = ({ shapes, onSelectShape, selectedShapeId }) => {
  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="border rounded-lg divide-y">
        {shapes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No shapes added yet
          </div>
        ) : (
          shapes.map((shape) => (
            <div
              key={shape.id}
              className={`p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                selectedShapeId === shape.id ? "bg-blue-50" : ""
              }`}
              onClick={() => onSelectShape(shape.id)}
            >
              <div className="flex items-center">
                <ChevronRightIcon className="h-4 w-4 mr-2" />
                <span>
                  {shape.type.charAt(0).toUpperCase() + shape.type.slice(1)}
                </span>
              </div>
              <div
                className="h-4 w-4 rounded-sm"
                style={{ backgroundColor: shape.color }}
              ></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SizeTabContent = () => {
  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="100"
              max="1000"
              defaultValue="500"
              className="w-full"
            />
            <span className="ml-2 w-16 text-center">500px</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="100"
              max="1000"
              defaultValue="500"
              className="w-full"
            />
            <span className="ml-2 w-16 text-center">500px</span>
          </div>
        </div>
        <div className="pt-4 border-t">
          <h3 className="text-lg font-medium mb-2">Preset Sizes</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="border rounded-md p-2 hover:bg-gray-50 hover:cursor-pointer">
              Instagram Post
            </button>
            <button className="border rounded-md p-2 hover:bg-gray-50 hover:cursor-pointer">
              Facebook Post
            </button>
            <button className="border rounded-md p-2 hover:bg-gray-50 hover:cursor-pointer">
              Twitter Post
            </button>
            <button className="border rounded-md p-2 hover:bg-gray-50 hover:cursor-pointer">
              LinkedIn Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullEditor;
