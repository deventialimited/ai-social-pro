// @ts-nocheck
;
import type React from "react";
import { useRef, useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { TrashIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { FaSyncAlt } from "react-icons/fa";

// Define shape types
type ShapeType =
  | "square"
  | "circle"
  | "star"
  | "triangle"
  | "pentagon"
  | "hexagon"
  | "speech-bubble"
  | "cross"
  | "oval"
  | "cloud"
  | "arrow-left"
  | "arrow-right"
  | "arrow-down"
  | "arrow-up";

// Define shape object structure
interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  zIndex: number;
  rotation: number;
  transparency?: number;
  effects?: ShapeEffects;
  borderStyle?: string;
  borderWidth?: number;
  borderColor?: string;
}

interface ShapeEffects {
  shadow: boolean;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
  color: string;
}

interface ImageData {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
  maintainAspectRatio?: boolean;
  rotation: number;
  zIndex: number;
  scaleX?: number;
  scaleY?: number;
}

interface CanvasEditorProps {
  shapes: Shape[];
  onUpdateShape: (updatedShape: Shape) => void;
  onSelectShape: (id: string | null) => void;
  onDeleteShape: (id: string) => void;
  onDuplicateShape: (id: string) => void;
  selectedShapeId: string | null;
  backgroundImage?: string;
  backgroundColor?: string;
  onBorderStyleChange: (style: string) => void;
  onBorderWidthChange: (width: number) => void;
  onBorderColorChange: (color: string) => void;
  onTransparencyChange?: (transparency: number) => void;
  onUpdateImage?: (imageData: ImageData) => void;
  onDeleteImage?: (id: string) => void;
  onDuplicateImage?: (id: string) => void;
  selectedImageId?: string | null;
  onSelectImage?: (id: string | null) => void;
  newImageSrc?: string; // New prop for selected image URL
  scaleX?: number;
  scaleY?: number;
  imageScale?: number;
  imageRotation?: number;
  imagePosition?: { x: number; y: number };
  imageFilters?: { brightness: number; contrast: number; saturation: number };
  imageEffects?: {
    blur: number;
    brightness: number;
    sepia: number;
    grayscale: number;
    border: number;
    cornerRadius: number;
    shadow: {
      blur: number;
      offsetX: number;
      offsetY: number;
    };
    opacity: number;
    borderColor: string;
  };
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({
  shapes,
  onUpdateShape,
  onSelectShape,
  onDeleteShape,
  onDuplicateShape,
  selectedShapeId,
  backgroundImage,
  backgroundColor = "#ffffff",
  onBorderStyleChange,
  onBorderWidthChange,
  onBorderColorChange,
  onUpdateImage,
  onDeleteImage,
  onDuplicateImage,
  selectedImageId,
  onSelectImage,
  scaleX = 1,
  scaleY = 1,
  imageScale = 1,
  imageRotation = 0,
  imagePosition = { x: 0, y: 0 },
  imageFilters,
  newImageSrc, // New prop
  imageEffects,
}) => {
  const [images, setImages] = useState<ImageData[]>([]);

  // Effect to load images from localStorage and include backgroundImage
  useEffect(() => {
    const loadImagesFromStorage = () => {
      const postData = localStorage.getItem("postdata");
      const storedImagesData = localStorage.getItem("imagesData");

      // Initialize images array
      let initialImages: ImageData[] = [];

      if (postData) {
        const { image } = JSON.parse(postData);
        if (image && image !== "none") {
          initialImages.push({
            id: "post-image",
            src: image,
            x: 0,
            y: 0,
            width: 200,
            height: 300,
            rotation: 0,
            zIndex: 1,
          });
        }
      }

      // Add backgroundImage from props if not already included
      if (
        backgroundImage &&
        !initialImages.some((img) => img.src === backgroundImage)
      ) {
        initialImages.push({
          id: `background-image-${Date.now()}`,
          src: backgroundImage,
          x: 0,
          y: 0,
          width: 200,
          height: 300,
          rotation: 0,
          zIndex: 0,
        });
      }

      if (storedImagesData) {
        const parsedStoredImages = JSON.parse(storedImagesData);
        initialImages = [...initialImages, ...parsedStoredImages];
      }

      setImages(initialImages);
    };

    loadImagesFromStorage();
  }, [backgroundImage]);

  // Effect to handle new image selection from props
  useEffect(() => {
    // Filter out the original post image and background image
    const imagesToStore = images.filter(
      (img) => img.id !== "post-image" && img.id !== "background-image"
    );

    if (newImageSrc) {
      // Create a temporary image to get the natural dimensions

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const newImage: ImageData = {
          id: `image-${Date.now()}`, // Unique ID for each new image
          src: newImageSrc,
          x: 0,
          y: 0,
          width: 200,
          height: 300,
          originalWidth: img.naturalWidth, // Store original dimensions
          originalHeight: img.naturalHeight,
          maintainAspectRatio: true, // Default to maintaining aspect ratio
          rotation: 0,
          zIndex: images.length + 1, // Place it above existing images
          scaleX: 1,
          scaleY: 1,
        };

        // Add the new image to the state if it doesn't already exist
        setImages((prevImages) => {
          if (!prevImages.some((img) => img.src === newImageSrc)) {
            return [...prevImages, newImage];
          }
          return prevImages;
        });

        // Optionally, trigger onSelectImage to highlight the new image
        if (onSelectImage) {
          onSelectImage(newImage.id);
        }
      };
      img.src = newImageSrc;
    }
  }, [newImageSrc, onSelectImage]);

  // Save images to localStorage when they change
  useEffect(() => {
    const imagesToStore = images.filter((img) => img.id !== "post-image");
    if (imagesToStore.length > 0) {
      localStorage.setItem("imagesData", JSON.stringify(imagesToStore));
    } else {
      localStorage.removeItem("imagesData");
    }
  }, [images]);

  const rotationRef = useRef({
    isRotating: false,
    startAngle: 0,
    originalRotation: 0,
    shapeId: "",
  });

  const getAngle = (cx: number, cy: number, ex: number, ey: number) => {
    const dy = ey - cy;
    const dx = ex - cx;
    const rad = Math.atan2(dy, dx);
    const deg = (rad * 360) / Math.PI;
    return deg;
  };

  const startRotation = (
    e: React.MouseEvent,
    item: Shape | ImageData,
    isShape: boolean
  ) => {
    e.stopPropagation();
    const centerX = item.x + item.width / 2;
    const centerY = item.y + item.height / 2;
    const startAngle = getAngle(centerX, centerY, e.clientX, e.clientY);
    rotationRef.current = {
      isRotating: true,
      startAngle,
      originalRotation: item.rotation,
      shapeId: item.id,
    };
    const handleRotate = isShape ? handleShapeRotate : handleImageRotate;
    const stopRotation = isShape ? stopShapeRotation : stopImageRotation;
    window.addEventListener("mousemove", handleRotate);
    window.addEventListener("mouseup", stopRotation);
  };

  const handleShapeRotate = (e: MouseEvent) => {
    if (!rotationRef.current.isRotating) return;
    const shape = shapes.find((s) => s.id === rotationRef.current.shapeId);
    if (!shape) return;
    const shapeCenterX = shape.x + shape.width / 2;
    const shapeCenterY = shape.y + shape.height / 2;
    const currentAngle = getAngle(
      shapeCenterX,
      shapeCenterY,
      e.clientX,
      e.clientY
    );
    const angleDiff = currentAngle - rotationRef.current.startAngle;
    let newRotation = (rotationRef.current.originalRotation + angleDiff) % 360;
    if (newRotation < 0) newRotation += 360;
    onUpdateShape({
      ...shape,
      rotation: newRotation,
    });
  };

  const stopShapeRotation = () => {
    rotationRef.current.isRotating = false;
    window.removeEventListener("mousemove", handleShapeRotate);
    window.removeEventListener("mouseup", stopShapeRotation);
  };

  const handleImageRotate = (e: MouseEvent) => {
    if (!rotationRef.current.isRotating || !onUpdateImage) return;
    const imageData = images.find(
      (img) => img.id === rotationRef.current.shapeId
    );
    if (!imageData) return;
    const imageCenterX = imageData.x + imageData.width / 2;
    const imageCenterY = imageData.y + imageData.height / 2;
    const currentAngle = getAngle(
      imageCenterX,
      imageCenterY,
      e.clientX,
      e.clientY
    );
    const angleDiff = currentAngle - rotationRef.current.startAngle;
    let newRotation = (rotationRef.current.originalRotation + angleDiff) % 360;
    if (newRotation < 0) newRotation += 360;
    const updatedImage = { ...imageData, rotation: newRotation };
    setImages((prevImages) =>
      prevImages.map((img) => (img.id === imageData.id ? updatedImage : img))
    );
    onUpdateImage(updatedImage);
  };

  const stopImageRotation = () => {
    rotationRef.current.isRotating = false;
    window.removeEventListener("mousemove", handleImageRotate);
    window.removeEventListener("mouseup", stopImageRotation);
  };

  const getShadowStyle = (effects?: ShapeEffects) => {
    if (!effects || !effects.shadow) return {};

    const opacityDecimal = effects.opacity / 100;
    let shadowColor = effects.color || "#000000";

    if (shadowColor.startsWith("#")) {
      const r = Number.parseInt(shadowColor.slice(1, 3), 16);
      const g = Number.parseInt(shadowColor.slice(3, 5), 16);
      const b = Number.parseInt(shadowColor.slice(5, 7), 16);
      shadowColor = `rgba(${r}, ${g}, ${b}, ${opacityDecimal})`;
    } else if (shadowColor.startsWith("rgb(")) {
      shadowColor = shadowColor
        .replace("rgb(", "rgba(")
        .replace(")", `, ${opacityDecimal})`);
    } else if (shadowColor.startsWith("rgba(")) {
      shadowColor = shadowColor.replace(
        /rgba$$(\d+),\s*(\d+),\s*(\d+),\s*[\d.]+$$/,
        `rgba($1, $2, $3, ${opacityDecimal})`
      );
    }

    return {
      filter: `drop-shadow(${effects.offsetX}px ${effects.offsetY}px ${effects.blur}px ${shadowColor})`,
    };
  };

  const getShapeStyle = (shape: Shape) => {
    const opacity =
      shape.transparency !== undefined ? 1 - shape.transparency : 1;

    return {
      color: shape.color,
      opacity: opacity,
      borderStyle: shape.borderStyle || "none",
      borderWidth: shape.borderWidth ? `${shape.borderWidth}px` : "0",
      borderColor: shape.borderColor || "transparent",
    };
  };

  const renderShape = (shape: Shape) => {
    const isSelected = selectedShapeId === shape.id;
    const shadowStyle = getShadowStyle(shape.effects);
    const shapeStyle = getShapeStyle(shape);

    const divBorderStyle =
      shape.borderStyle !== "none"
        ? {
            border: `${shape.borderWidth || 0}px ${
              shape.borderStyle || "solid"
            } ${shape.borderColor || "transparent"}`,
          }
        : {};

    const svgStrokeProps = {
      stroke:
        shape.borderStyle !== "none" ? shape.borderColor || "black" : "none",
      strokeWidth: shape.borderStyle !== "none" ? shape.borderWidth || 0 : 0,
      strokeDasharray:
        shape.borderStyle === "dashed"
          ? "5,5"
          : shape.borderStyle === "dotted"
          ? "1,3"
          : undefined,
    };

    const doubleStrokeProps =
      shape.borderStyle === "double"
        ? {
            filter: "url(#doubleStroke)",
          }
        : {};

    const baseStyle = {
      ...shapeStyle,
      ...shadowStyle,
    };

    switch (shape.type) {
      case "square":
        return (
          <div
            className="w-full h-full bg-current rounded-sm"
            style={{ ...baseStyle, ...divBorderStyle }}
          ></div>
        );

      case "circle":
        return (
          <div
            className="w-full h-full bg-current rounded-full"
            style={{ ...baseStyle, ...divBorderStyle }}
          ></div>
        );

      case "oval":
        return (
          <div
            className="w-full h-full bg-current rounded-full"
            style={{ ...baseStyle, ...divBorderStyle, height: "75%" }}
          ></div>
        );

      case "star":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" style={baseStyle}>
            <defs>
              <filter
                id="doubleStroke"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feMorphology
                  operator="dilate"
                  radius={shape.borderWidth || 1}
                />
              </filter>
            </defs>
            <path
              fill="currentColor"
              d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
              {...svgStrokeProps}
              {...doubleStrokeProps}
            />
          </svg>
        );

      case "triangle":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" style={baseStyle}>
            <defs>
              <filter
                id="doubleStroke"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feMorphology
                  operator="dilate"
                  radius={shape.borderWidth || 1}
                />
              </filter>
            </defs>
            <path
              fill="currentColor"
              d="M1,21H23L12,2L1,21Z"
              {...svgStrokeProps}
              {...doubleStrokeProps}
            />
          </svg>
        );

      case "pentagon":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" style={baseStyle}>
            <defs>
              <filter
                id="doubleStroke"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feMorphology
                  operator="dilate"
                  radius={shape.borderWidth || 1}
                />
              </filter>
            </defs>
            <path
              fill="currentColor"
              d="M12,2L1,9.5L4.5,21H19.5L23,9.5L12,2Z"
              {...svgStrokeProps}
              {...doubleStrokeProps}
            />
          </svg>
        );

      case "hexagon":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" style={baseStyle}>
            <defs>
              <filter
                id="doubleStroke"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feMorphology
                  operator="dilate"
                  radius={shape.borderWidth || 1}
                />
              </filter>
            </defs>
            <path
              fill="currentColor"
              d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5Z"
              {...svgStrokeProps}
              {...doubleStrokeProps}
            />
          </svg>
        );

      case "speech-bubble":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" style={baseStyle}>
            <defs>
              <filter
                id="doubleStroke"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feMorphology
                  operator="dilate"
                  radius={shape.borderWidth || 1}
                />
              </filter>
            </defs>
            <path
              fill="currentColor"
              d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2Z"
              {...svgStrokeProps}
              {...doubleStrokeProps}
            />
          </svg>
        );

      case "cross":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" style={baseStyle}>
            <defs>
              <filter
                id="doubleStroke"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feMorphology
                  operator="dilate"
                  radius={shape.borderWidth || 1}
                />
              </filter>
            </defs>
            <path
              fill="currentColor"
              d="M10,2H14V8H20V12H14V22H10V12H4V8H10V2Z"
              {...svgStrokeProps}
              {...doubleStrokeProps}
            />
          </svg>
        );

      case "cloud":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" style={baseStyle}>
            <defs>
              <filter
                id="doubleStroke"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feMorphology
                  operator="dilate"
                  radius={shape.borderWidth || 1}
                />
              </filter>
            </defs>
            <path
              fill="currentColor"
              d="M19.35,10.03C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.03C2.34,8.36 0,10.9 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.03Z"
              {...svgStrokeProps}
              {...doubleStrokeProps}
            />
          </svg>
        );

      case "arrow-right":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" style={baseStyle}>
            <defs>
              <filter
                id="doubleStroke"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feMorphology
                  operator="dilate"
                  radius={shape.borderWidth || 1}
                />
              </filter>
            </defs>
            <path
              fill="currentColor"
              d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
              {...svgStrokeProps}
              {...doubleStrokeProps}
            />
          </svg>
        );

      case "arrow-left":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" style={baseStyle}>
            <defs>
              <filter
                id="doubleStroke"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feMorphology
                  operator="dilate"
                  radius={shape.borderWidth || 1}
                />
              </filter>
            </defs>
            <path
              fill="currentColor"
              d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"
              {...svgStrokeProps}
              {...doubleStrokeProps}
            />
          </svg>
        );

      case "arrow-up":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" style={baseStyle}>
            <defs>
              <filter
                id="doubleStroke"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feMorphology
                  operator="dilate"
                  radius={shape.borderWidth || 1}
                />
              </filter>
            </defs>
            <path
              fill="currentColor"
              d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"
              {...svgStrokeProps}
              {...doubleStrokeProps}
            />
          </svg>
        );

      case "arrow-down":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" style={baseStyle}>
            <defs>
              <filter
                id="doubleStroke"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feMorphology
                  operator="dilate"
                  radius={shape.borderWidth || 1}
                />
              </filter>
            </defs>
            <path
              fill="currentColor"
              d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z"
              {...svgStrokeProps}
              {...doubleStrokeProps}
            />
          </svg>
        );

      default:
        return (
          <div
            className="w-full h-full bg-current"
            style={{ ...baseStyle, ...divBorderStyle }}
          ></div>
        );
    }
  };

  const handleFlipHorizontal = () => {
    if (selectedImageId) {
      const newScaleX = scaleX * -1;
      setScaleX(newScaleX);

      // Update the specific image's scale
      const updatedImages = images.map((img) =>
        img.id === selectedImageId
          ? { ...img, scaleX: (img.scaleX || 1) * -1 }
          : img
      );
      setImages(updatedImages);

      if (onUpdateImage) {
        const selectedImage = images.find((img) => img.id === selectedImageId);
        if (selectedImage) {
          onUpdateImage({
            ...selectedImage,
            scaleX: (selectedImage.scaleX || 1) * -1,
          });
        }
      }

      addToHistory({ scaleX: newScaleX });
    }
  };

  const handleFitToPage = () => {
    if (!selectedImageId) return;

    const selectedImage = images.find((img) => img.id === selectedImageId);
    if (!selectedImage) return;

    const canvasElement = document.getElementById("canvas");
    if (!canvasElement) return;

    const canvasWidth = canvasElement.clientWidth;
    const canvasHeight = canvasElement.clientHeight;

    // Create a temporary image to get the natural dimensions
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      // Calculate the scale to fit the image within the canvas
      const widthRatio = canvasWidth / imgWidth;
      const heightRatio = canvasHeight / imgHeight;
      const scale = Math.min(widthRatio, heightRatio) * 0.9; // 90% of the available space

      // Calculate centered position
      const x = (canvasWidth - imgWidth * scale) / 2;
      const y = (canvasHeight - imgHeight * scale) / 2;

      // Update the image
      const updatedImage = {
        ...selectedImage,
        width: imgWidth * scale,
        height: imgHeight * scale,
        x: x,
        y: y,
        scaleX: 1, // Reset any flipping
        scaleY: 1,
      };

      setImages((prevImages) =>
        prevImages.map((img) =>
          img.id === selectedImageId ? updatedImage : img
        )
      );

      if (onUpdateImage) {
        onUpdateImage(updatedImage);
      }
    };

    img.src = selectedImage.src;
  };

  const renderImage = () => {
    // Sort images to ensure selected image is rendered last (on top)
    const sortedImages = [...images].sort((a, b) => {
      if (a.id === selectedImageId) return 1;
      if (b.id === selectedImageId) return -1;
      return (a.zIndex || 1) - (b.zIndex || 1);
    });

    return sortedImages.map((imageData) => {
      const isSelected = selectedImageId === imageData.id;
      const isBackgroundImage = imageData.id === "background-image";

      // Generate CSS filter string based on imageFilters prop
      let filterString = imageFilters
        ? `brightness(${imageFilters.brightness}%) contrast(${imageFilters.contrast}%) saturate(${imageFilters.saturation}%)`
        : "";

      // Create additional CSS filter string for effects
      if (imageEffects) {
        // Add blur effect
        if (imageEffects.blur > 0) {
          filterString += ` blur(${imageEffects.blur}px)`;
        }

        // Add brightness effect
        if (imageEffects.brightness !== 100) {
          filterString += ` brightness(${imageEffects.brightness}%)`;
        }

        // Add sepia effect
        if (imageEffects.sepia > 0) {
          filterString += ` sepia(${imageEffects.sepia}%)`;
        }

        // Add grayscale effect
        if (imageEffects.grayscale > 0) {
          filterString += ` grayscale(${imageEffects.grayscale}%)`;
        }
      }

      // Image container transform (for rotation and flipping)
      const containerTransform = `scale(${scaleX}, ${scaleY}) rotate(${
        imageData.rotation || 0
      }deg)`;

      // Image transform (for scaling)
      const imageTransform = `scale(${imageScale || 1})`;

      // Get border style from effects
      const borderStyle =
        imageEffects && imageEffects.border > 0
          ? `${imageEffects.border}px solid ${
              imageEffects.borderColor || "#000000"
            }`
          : undefined;

      // Border radius from effects
      const borderRadius =
        imageEffects && imageEffects.cornerRadius > 0
          ? `${imageEffects.cornerRadius}px`
          : undefined;

      // Shadow from effects
      const boxShadow =
        imageEffects && imageEffects.shadow && imageEffects.shadow.blur > 0
          ? `${imageEffects.shadow.offsetX}px ${
              imageEffects.shadow.offsetY
            }px ${imageEffects.shadow.blur}px ${
              imageEffects.shadow.color || "rgba(0,0,0,0.5)"
            }`
          : undefined;

      // Apply opacity
      const opacity =
        imageEffects && imageEffects.opacity !== undefined
          ? 1 - imageEffects.opacity / 100 // Reverse the calculation: 0 = visible (1), 100 = invisible (0)
          : 1;

      return (
        <Rnd
          key={imageData.id}
          id={imageData.id}
          size={{ width: imageData.width, height: imageData.height }}
          position={{ x: imageData.x, y: imageData.y }}
          onDragStart={(e) => {
            e.stopPropagation();
            if (onSelectImage) {
              onSelectImage(imageData.id);
              // Deselect any selected shape when selecting an image
              if (onSelectShape) onSelectShape(null);
            }
          }}
          onDrag={(e, d) => {
            const updatedImages = images.map((img) =>
              img.id === imageData.id ? { ...img, x: d.x, y: d.y } : img
            );
            setImages(updatedImages);
            if (onUpdateImage) onUpdateImage({ ...imageData, x: d.x, y: d.y });
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            // Get original aspect ratio
            const originalAspectRatio =
              imageData.originalWidth && imageData.originalHeight
                ? imageData.originalWidth / imageData.originalHeight
                : 1;

            const newWidth = Math.max(50, Number.parseInt(ref.style.width));
            let newHeight = Math.max(50, Number.parseInt(ref.style.height));

            // Maintain aspect ratio if the flag is set
            if (imageData.maintainAspectRatio) {
              newHeight = newWidth / originalAspectRatio;
            }

            const updatedImage = {
              ...imageData,
              width: newWidth,
              height: newHeight,
              x: position.x,
              y: position.y,
            };
            const updatedImages = images.map((img) =>
              img.id === imageData.id ? updatedImage : img
            );
            setImages(updatedImages);
            if (onUpdateImage) onUpdateImage(updatedImage);
          }}
          className={`${isSelected ? "z-50" : ""}`}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            if (onSelectImage) {
              onSelectImage(imageData.id);
              // Deselect any selected shape when selecting an image
              if (onSelectShape) onSelectShape(null);
            }
          }}
          bounds="canvas"
          enableResizing={{
            top: isSelected,
            right: isSelected,
            bottom: isSelected,
            left: isSelected,
            topRight: isSelected,
            bottomRight: isSelected,
            bottomLeft: isSelected,
            topLeft: isSelected,
          }}
          disableDragging={!isSelected}
          style={{
            transformOrigin: "center center",
            zIndex: isSelected ? 50 : imageData.zIndex || 1,
            filter: filterString || undefined,
            border: borderStyle,
            borderRadius,
            boxShadow,
            opacity,
          }}
        >
          <div
            className="relative w-full h-full"
            style={{
              transform: containerTransform,
              transformOrigin: "center center",
            }}
          >
            {/* Image container */}
            <div
              className="w-full h-full overflow-hidden"
              style={{ borderRadius }}
            >
              <img
                src={imageData.src || "/placeholder.svg"}
                alt="Post"
                className={`w-full h-full ${
                  selectedImageId === imageData.id ? "selected" : ""
                } ${imageData.id === "background-image" ? "main-image" : ""}`}
                data-image-id={imageData.id}
                style={{
                  filter: filterString,
                  transform: imageTransform,
                  transformOrigin: "center center",
                  // objectFit: "contain",
                  borderRadius,
                }}
                draggable={false}
              />
            </div>

            {/* Controls for selected image */}
            {isSelected && (
              <>
                {/* Rotation handle */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-blue-500 flex items-center justify-center cursor-move pointer-events-auto"
                    onMouseDown={(e) => startRotation(e, imageData, false)}
                  >
                    <FaSyncAlt className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-px h-4 bg-blue-500 pointer-events-none"></div>
                </div>

                {/* Border and resize handles */}
                <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none"></div>

                {/* Corner resize handles */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nwse-resize"></div>
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nesw-resize"></div>
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nesw-resize"></div>
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nwse-resize"></div>

                {/* Middle resize handles */}
                <div className="absolute top-1/2 -left-1.5 transform -translate-y-1/2 w-3 h-3 bg-white border border-blue-500 cursor-ew-resize"></div>
                <div className="absolute top-1/2 -right-1.5 transform -translate-y-1/2 w-3 h-3 bg-white border border-blue-500 cursor-ew-resize"></div>
                <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border border-blue-500 cursor-ns-resize"></div>
                <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border border-blue-500 cursor-ns-resize"></div>

                {/* Delete and duplicate buttons - these should NOT rotate */}
                <div
                  className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10"
                  style={{
                    transform: `rotate(${-(
                      imageData.rotation ||
                      imageRotation ||
                      0
                    )}deg)`,
                    transformOrigin: "center bottom",
                  }}
                >
                  <button
                    className="p-1 bg-white rounded-sm shadow hover:bg-gray-100 border border-gray-200"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      // Only protect the original post image from deletion
                      const updatedImages = images.filter(
                        (img) => img.id !== imageData.id
                      );
                      setImages(updatedImages);
                      if (onDeleteImage) onDeleteImage(imageData.id);
                    }}
                  >
                    <TrashIcon className="h-4 w-4 text-gray-700" />
                  </button>
                  <button
                    className="p-1 bg-white rounded-sm shadow hover:bg-gray-100 border border-gray-200"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      const newImageId = `image-${Date.now()}`;
                      const newImage = {
                        ...imageData,
                        id: newImageId,
                        x: imageData.x + 20,
                        y: imageData.y + 20,
                      };
                      setImages([...images, newImage]);
                      if (onDuplicateImage) onDuplicateImage(newImageId);
                    }}
                  >
                    <DocumentDuplicateIcon className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </>
            )}
          </div>
        </Rnd>
      );
    });
  };

  return (
    <div
      id="canvas"
      className="w-full h-full overflow-hidden"
      style={{
        backgroundColor,
        width: "65vw",
        height: "100%",
      }}
      onClick={() => {
        // Clear both selections when clicking on canvas
        onSelectShape(null);
        if (onSelectImage) onSelectImage(null);
      }}
    >
      {renderImage()}
      {shapes.map((shape) => {
        const isSelected = selectedShapeId === shape.id;

        return (
          <div
            key={shape.id}
            className="absolute"
            style={{
              width: shape.width,
              height: shape.height,
              transform: `translate(${shape.x}px, ${shape.y}px) rotate(${shape.rotation}deg)`,
              transformOrigin: "center center",
              zIndex: shape.zIndex,
            }}
          >
            <Rnd
              size={{ width: shape.width, height: shape.height }}
              position={{ x: 0, y: 0 }}
              onDragStart={(e) => {
                e.stopPropagation();
                onSelectShape(shape.id);
              }}
              onDrag={(e, d) => {
                // Proper drag handling that accounts for rotation
                const deltaX = d.x;
                const deltaY = d.y;

                // Update shape position
                onUpdateShape({
                  ...shape,
                  x: shape.x + deltaX,
                  y: shape.y + deltaY,
                });
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                onUpdateShape({
                  ...shape,
                  width: Math.max(5, Number.parseInt(ref.style.width)),
                  height: Math.max(5, Number.parseInt(ref.style.height)),
                });
              }}
              className={`${isSelected ? "z-10" : ""}`}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                // Deselect any selected image when selecting a shape
                if (onSelectImage) onSelectImage(null);
                onSelectShape(shape.id);
              }}
              bounds="canvas"
              enableResizing={{
                top: isSelected,
                right: isSelected,
                bottom: isSelected,
                left: isSelected,
                topRight: isSelected,
                bottomRight: isSelected,
                bottomLeft: isSelected,
                topLeft: isSelected,
              }}
              disableDragging={!isSelected}
            >
              <div className="relative w-full h-full">
                {/* Shape container */}
                <div className="w-full h-full flex items-center justify-center">
                  {renderShape(shape)}
                </div>

                {/* Controls for selected shape */}
                {isSelected && (
                  <>
                    {/* Rotation handle */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                      <div
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-blue-500 flex items-center justify-center cursor-move pointer-events-auto"
                        onMouseDown={(e) => startRotation(e, shape, true)}
                      >
                        <FaSyncAlt className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-px h-4 bg-blue-500 pointer-events-none"></div>
                    </div>

                    {/* Border and resize handles */}
                    <div
                      className="absolute inset-0 border-2 border-blue-500 pointer-events-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBorderStyleChange(shape.borderStyle || "solid");
                        onBorderWidthChange(shape.borderWidth || 1);
                        onBorderColorChange(shape.borderColor || "#000000");
                      }}
                    ></div>

                    {/* Corner resize handles */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nwse-resize"></div>
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nesw-resize"></div>
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nesw-resize"></div>
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nwse-resize"></div>

                    {/* Middle resize handles */}
                    <div className="absolute top-1/2 -left-1.5 transform -translate-y-1/2 w-3 h-3 bg-white border border-blue-500 cursor-ew-resize"></div>
                    <div className="absolute top-1/2 -right-1.5 transform -translate-y-1/2 w-3 h-3 bg-white border border-blue-500 cursor-ew-resize"></div>
                    <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border border-blue-500 cursor-ns-resize"></div>
                    <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border border-blue-500 cursor-ns-resize"></div>

                    {/* Delete and duplicate buttons */}
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                      <button
                        className="p-1 bg-white rounded-sm shadow hover:bg-gray-100 border border-gray-200"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onDeleteShape(shape.id);
                        }}
                      >
                        <TrashIcon className="h-4 w-4 text-gray-700" />
                      </button>
                      <button
                        className="p-1 bg-white rounded-sm shadow hover:bg-gray-100 border border-gray-200"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onDuplicateShape(shape.id);
                        }}
                      >
                        <DocumentDuplicateIcon className="h-4 w-4 text-gray-700" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Rnd>
          </div>
        );
      })}
    </div>
  );
};

export default CanvasEditor;
