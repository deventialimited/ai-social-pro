"use client";
import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dialog, Transition, Listbox } from "@headlessui/react";
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

import ShapesTabContent from "./shapTabContent";
import CanvasEditor from "./CanvasEditor";
import { ImagesTabContent } from "./editor_components/ImagesTabContent";
import { Toolbar, ShapeToolbar, ImageToolbar, BackgroundToolbar } from "./editor_components/Toolbar";

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
  | "arrow-up"
  | "textarea"; // Changed text to textarea for text input

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
  rotation: number; // Added rotation property
  textContent?: string; // Added text content for text shapes
  transparency?: number; // Added transparency property
  effects?: ShapeEffects; // Added effects property
}

interface ShapeEffects {
  shadow: boolean;
  blur: number; // Default blur set to 0
  offsetX: number;
  offsetY: number;
  opacity: number; // Default opacity set to 0
  color: string;
}

type EditorTab = "text" | "images" | "elements" | "background" | "layers" | "size" | "shapes" | "selectedImage";

const ACCESS_KEY = "FVuPZz9YhT7O4DdL8zWtjSQTCFMj9ubMCF06bDR52lk";

const FullEditor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const postdata = localStorage.getItem("postdata");
  let postId: string | null = null;
  let postContent: string = "";
  let postImage: string = "";

  if (postdata) {
    const parsedPostdata = JSON.parse(postdata);
    postId = parsedPostdata.post_id;
    postContent = parsedPostdata.content;
    postImage = parsedPostdata.image;
    console.log(postContent);
  }

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<EditorTab>("images");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [shapes, setShapes] = useState<Shape[]>(() => {
    const savedShapes = postId ? JSON.parse(localStorage.getItem(`shapes_${postId}`) || "[]") : [];
    return savedShapes;
  });
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>(() => {
    return postId ? localStorage.getItem(`backgroundColor_${postId}`) || "#ffffff" : "#ffffff";
  });
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [backgroundColors, setBackgroundColors] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [patterns, setPatterns] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>(() => {
    const savedHistory = postId ? JSON.parse(localStorage.getItem(`history_${postId}`) || "[]") : [];
    return savedHistory;
  });
  const [historyIndex, setHistoryIndex] = useState<number>(() => {
    const savedHistoryIndex = postId ? JSON.parse(localStorage.getItem(`historyIndex_${postId}`) || "-1") : -1;
    return savedHistoryIndex;
  });
  const [backgroundImage, setBackgroundImage] = useState<string | null>(() => {
    return postId ? localStorage.getItem(`backgroundImage_${postId}`) || location.state?.image || null : null;
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [postBody, setPostBody] = useState<string>(() => {
    return postId ? localStorage.getItem(`postBody_${postId}`) || postContent || "" : "";
  });
  const [postBodyActive, setPostBodyActive] = useState<boolean>(false); // New state to track post body activity
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textColor, setTextColor] = useState<string>("#000000"); // New state for text color
  const [isTextAreaActive, setIsTextAreaActive] = useState<boolean>(false); // State to track textarea focus

  const captureDiagramAsImage = async () => {
    const diagramElement = document.getElementById("canvas");
    if (diagramElement) {
      const canvas = await html2canvas(diagramElement);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
      if (blob) {
        // Create a URL for the blob and trigger a download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "diagram.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Proceed with the API call
        const formData = new FormData();
        formData.append("image", blob, "diagram.png");
        try {
          await axios.post("/api/update-image", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          console.log("Image successfully updated in the database");
        } catch (error) {
          console.error("Error updating image in the database:", error);
        }
      }
    }
  };

  useEffect(() => {
    const fetchBackgroundData = async () => {
      try {
        const response = await axios.get("https://api.unsplash.com/search/photos", {
          params: {
            client_id: ACCESS_KEY,
            query: "abstract gradient background",
            per_page: 30,
            orientation: "landscape",
          },
        });

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

  useEffect(() => {
    if (postId) {
      localStorage.setItem(`shapes_${postId}`, JSON.stringify(shapes));
      localStorage.setItem(`backgroundColor_${postId}`, backgroundColor);
      localStorage.setItem(`backgroundImage_${postId}`, backgroundImage || "");
      localStorage.setItem(`postBody_${postId}`, postBody);
      localStorage.setItem(`history_${postId}`, JSON.stringify(history));
      localStorage.setItem(`historyIndex_${postId}`, JSON.stringify(historyIndex));
    }
  }, [shapes, backgroundColor, backgroundImage, postBody, history, historyIndex, postId]);

  const closeModal = () => {
    setIsOpen(false);
    navigate("/posts");
  };

  const openModal = () => {
    setIsOpen(true);
  };

  // Add a shape to the canvas
  const handleAddShape = (shape: Shape) => {
    const newShape = {
      ...shape,
      effects: {
        shadow: false,
        blur: 0,
        opacity: 0,
        offsetX: 0,
        offsetY: 0,
        color: "#000000",
      },
    };
    const newShapes = [...shapes, newShape];
    setShapes(newShapes);
    addToHistory({ shapes: newShapes });
  };

  // Update a shape's properties
  const handleUpdateShape = (updatedShape: Shape) => {
    const newShapes = shapes.map((shape) => (shape.id === updatedShape.id ? updatedShape : shape));
    setShapes(newShapes);
    addToHistory({ shapes: newShapes });
  };

  // Delete the selected shape
  const handleDeleteShape = (id: string) => {
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

  // Add to history
  const addToHistory = (state: any) => {
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
    }
  };

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ shapes: [], backgroundColor: "#ffffff", postBody: "" }]);
      setHistoryIndex(0);
    }
  }, [history]);

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
            onSelectImage={(image) => {
              setBackgroundImage(image); // Set the image as the background in the canvas
            }}
          />
        );
      case "elements":
        return <ElementsTabContent />;
      case "background":
        return (
          <BackgroundTabContent
            onColorChange={(color) => {
              setBackgroundImage(null); // Clear pattern when color is selected
              setBackgroundColor(color);
              addToHistory({ backgroundColor: color });
            }}
            colors={colors}
            patterns={patterns}
            onPatternSelect={(pattern) => {
              setBackgroundColor("#ffffff"); // Reset color when pattern is selected
              setBackgroundImage(pattern);
              addToHistory({ backgroundImage: pattern });
            }}
          />
        );
      case "layers":
        return <LayersTabContent shapes={shapes} onSelectShape={setSelectedShapeId} selectedShapeId={selectedShapeId} />;
      case "size":
        return <SizeTabContent />;
      case "shapes":
        return <ShapesTabContent onAddShape={handleAddShape} />;
      case "selectedImage":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <img src={selectedImage || ""} alt="Selected" className="max-w-full max-h-full" />
          </div>
        );
      default:
        return <TextTabContent onAddText={handleAddText} />;
    }
  };

  const handleAddText = (textType: string) => {
    const newTextArea = createTextArea(textType);
    setPostBody((prevBody) => prevBody + "\n" + newTextArea.textContent); // Append new text content to the existing post body
  };

  const createTextArea = (textType: string) => {
    let defaultText = "";

    // Set default text based on type
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
      textContent: defaultText, // This sets the initial visible text
    };
  };

  const handleKeyDown = (event: KeyboardEvent) => {
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

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-[95%] h-[70vh] transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                  <div className="flex justify-between items-center px-4 py-3 border-b">
                    <Dialog.Title as="h3" className="text-lg font-medium flex items-center">
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
                    </Dialog.Title>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>

                      <div className="relative flex text-left">
                        <Listbox>
                          <div className="relative">
                            <Listbox.Button className="inline-flex items-center rounded-l-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
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
                            </Listbox.Button>
                          </div>
                        </Listbox>

                        <Dropdown menu={{ items }} trigger={["click"]}>
                          <button
                            type="button"
                            className="inline-flex items-center rounded-r border border-gray-300 px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <span className="ant-btn-icon">
                              <DownOutlined />
                            </span>
                          </button>
                        </Dropdown>
                      </div>

                      <button
                        type="button"
                        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
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
                          }`}
                          onClick={() => setActiveTab("text")}
                        >
                          <span className="text-2xl font-semibold">A+</span>
                          <span className="text-xs mt-1">Text</span>
                        </button>

                        <button
                          className={`w-full py-4 flex flex-col items-center justify-center ${
                            activeTab === "images" ? "bg-blue-100" : "hover:bg-gray-100"
                          }`}
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
                          }`}
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
                          }`}
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
                          }`}
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
                          }`}
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
                          }`}
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
                      <div className="w-1/5 p-4 shadow">{renderTabContent()}</div>

                      <div className="flex-1  flex flex-col">
                        {/* Toolbar */}
                        {isTextAreaActive ? (
                          <Toolbar
                            onFontChange={(font) => {
                              const updatedShapes = shapes.map((shape) =>
                                shape.id === editingTextId ? { ...shape, fontFamily: font } : shape
                              );
                              setShapes(updatedShapes);
                              addToHistory({ shapes: updatedShapes });
                            }}
                            onFontSizeChange={(size) => {
                              const updatedShapes = shapes.map((shape) =>
                                shape.id === editingTextId ? { ...shape, fontSize: size } : shape
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
                                shape.id === editingTextId ? { ...shape, backgroundColor: color } : shape
                              );
                              setShapes(updatedShapes);
                              addToHistory({ shapes: updatedShapes });
                            }}
                            onCopy={() => {
                              const shapeToCopy = shapes.find((shape) => shape.id === editingTextId);
                              if (shapeToCopy) {
                                const copiedShape = { ...shapeToCopy, id: generateUniqueId() };
                                setShapes([...shapes, copiedShape]);
                                addToHistory({ shapes: [...shapes, copiedShape] });
                              }
                            }}
                            onDelete={() => {
                              const updatedShapes = shapes.filter((shape) => shape.id !== editingTextId);
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
                                shape.id === selectedShapeId ? { ...shape, transparency } : shape
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
                            onOffsetXChange={(offsetX) => {
                              const updatedShapes = shapes.map((shape) =>
                                shape.id === selectedShapeId ? { ...shape, effects: { ...shape.effects, offsetX } } : shape
                              );
                              setShapes(updatedShapes);
                              addToHistory({ shapes: updatedShapes });
                            }}
                            onOffsetYChange={(offsetY) => {
                              const updatedShapes = shapes.map((shape) =>
                                shape.id === selectedShapeId ? { ...shape, effects: { ...shape.effects, offsetY } } : shape
                              );
                              setShapes(updatedShapes);
                              addToHistory({ shapes: updatedShapes });
                            }}
                            onEffectColorChange={(color) => {
                              const updatedShapes = shapes.map((shape) =>
                                shape.id === selectedShapeId ? { ...shape, effects: { ...shape.effects, color } } : shape
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
                          <ImageToolbar
                            onUpload={() => console.log("Upload action")}
                            onUndo={handleUndo}
                            onRedo={handleRedo}
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
                                className="p-2 rounded-md hover:bg-gray-100"
                                onClick={handleUndo}
                                disabled={historyIndex <= 0}
                              >
                                <ArrowUturnLeftIcon className="h-5 w-5 text-gray-500" />
                              </button>
                              <button
                                className="p-2 rounded-md hover:bg-gray-100"
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
                              <Listbox>
                                <div className="relative">
                                  <Listbox.Button className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    <span>Palette</span>
                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                  </Listbox.Button>
                                </div>
                              </Listbox>
                            </div>

                            <div className="flex items-center space-x-2 mr-4">
                              <div
                                className="h-8 w-8 rounded cursor-pointer border border-gray-300"
                                style={{ backgroundColor }}
                              ></div>
                              <span>Background Color</span>
                            </div>

                            <button className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                              <ArrowUpTrayIcon className="mr-2 h-5 w-5" />
                              Upload
                            </button>

                            <div className="ml-auto flex items-center space-x-4">
                              <div className="relative">
                                <button className="rounded-md hover:bg-gray-100" style={{ backgroundColor }}>
                                  <div className="">
                                    <input
                                      type="color"
                                      className="cursor-pointer w-8 rounded h-7"
                                      onChange={(e) => {
                                        const newColor = e.target.value;
                                        if (selectedShapeId) {
                                          const updatedShapes = shapes.map((shape) =>
                                            shape.id === selectedShapeId ? { ...shape, color: newColor } : shape
                                          );
                                          setShapes(updatedShapes);
                                          addToHistory({ shapes: updatedShapes });
                                        }
                                      }}
                                    />
                                  </div>
                                </button>
                              </div>
                              <button
                                className="p-2 rounded-md hover:bg-gray-100"
                                onClick={handleDuplicateShape}
                                disabled={!selectedShapeId}
                              >
                                <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />
                              </button>
                              <button
                                className="p-2 rounded-md hover:bg-gray-100"
                                onClick={handleRotateShape}
                                disabled={!selectedShapeId}
                              >
                                <ArrowsPointingInIcon className="h-5 w-5 text-gray-500" />
                              </button>
                              <button
                                className="p-2 rounded-md hover:bg-gray-100"
                                onClick={() => selectedShapeId && handleDeleteShape(selectedShapeId)}
                                disabled={!selectedShapeId}
                              >
                                <TrashIcon className="h-5 w-5 text-gray-500" />
                              </button>
                              <button className="p-2 rounded-md hover:bg-gray-100" onClick={captureDiagramAsImage}>
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
                          <div className="bg-white  w-full h-full rounded-md flex items-center justify-center">
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
                            />
                          </div>
                          <div className={`absolute top-48 right-[35%] ml-12 p-2 rounded-md ${isTextAreaActive ? 'border border-black-500' : ''}`}>
                            <textarea
                              className="w-full h-full text-sm resize border-none focus:outline-none"
                              value={postBody}
                              onChange={(e) => {
                                setPostBody(e.target.value);
                                
                                addToHistory({ postBody: e.target.value });

                              }}
                              onFocus={() => setIsTextAreaActive(true)}
                              onBlur={(e) => {
                                const toolbarElement = document.getElementById('toolfix');
                                if (!toolbarElement || !toolbarElement.contains(e.relatedTarget)) {
                                  setIsTextAreaActive(false);
                                  if (!postBodyActive) {
                                    // Perform any additional actions when clicking outside
                                    console.log("Clicked outside the textarea");
                                  }
                                }
                              }}
                            
                              style={{ color: textColor }}
                              draggable="true"
                            />
                          </div>

                          {/* Zoom controls */}
                          <div className="absolute bottom-4 right-4 flex items-center bg-white rounded-md shadow-sm">
                            <button
                              className="p-2 hover:bg-gray-100 rounded-l-md"
                              onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <div className="px-3 py-1 border-l border-r">{zoomLevel}%</div>
                            <button
                              className="p-2 hover:bg-gray-100 rounded-r-md"
                              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

// Tab content components
const TextTabContent: React.FC<{ onAddText: (textType: string) => void }> = ({ onAddText }) => {
  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4 cursor-pointer" onClick={() => onAddText("header")}>
        Create header
      </h1>
      <h2 className="text-2xl font-medium mb-4 cursor-pointer" onClick={() => onAddText("h2")}>
        Create sub header
      </h2>
      <p className="text-base cursor-pointer" onClick={() => onAddText("p")}>
        Create body text
      </p>
    </div>
  );
};

const ElementsTabContent: React.FC = () => {
  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center">
        <p className="text-gray-500">Elements will be displayed here</p>
      </div>
    </div>
  );
};

interface BackgroundTabContentProps {
  onColorChange: (color: string) => void;
  colors: string[];
  patterns: string[];
  onPatternSelect: (pattern: string) => void;
}

const BackgroundTabContent: React.FC<BackgroundTabContentProps> = ({ onColorChange, colors, patterns, onPatternSelect }) => {
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
            >
              {/* Pattern {index + 1} */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface LayersTabContentProps {
  shapes: Shape[];
  onSelectShape: (id: string | null) => void;
  selectedShapeId: string | null;
}

const LayersTabContent: React.FC<LayersTabContentProps> = ({ shapes, onSelectShape, selectedShapeId }) => {
  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="border rounded-lg divide-y">
        {shapes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No shapes added yet</div>
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
                <span>{shape.type.charAt(0).toUpperCase() + shape.type.slice(1)}</span>
              </div>
              <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: shape.color }}></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SizeTabContent: React.FC = () => {
  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
          <div className="flex items-center">
            <input type="range" min="100" max="1000" defaultValue="500" className="w-full" />
            <span className="ml-2 w-16 text-center">500px</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
          <div className="flex items-center">
            <input type="range" min="100" max="1000" defaultValue="500" className="w-full" />
            <span className="ml-2 w-16 text-center">500px</span>
          </div>
        </div>
        <div className="pt-4 border-t">
          <h3 className="text-lg font-medium mb-2">Preset Sizes</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="border rounded-md p-2 hover:bg-gray-50">Instagram Post</button>
            <button className="border rounded-md p-2 hover:bg-gray-50">Facebook Post</button>
            <button className="border rounded-md p-2 hover:bg-gray-50">Twitter Post</button>
            <button className="border rounded-md p-2 hover:bg-gray-50">LinkedIn Post</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullEditor;
