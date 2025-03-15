// @ts-nocheck

import React, { useState, useRef } from "react";
import Cropper from "react-cropper";
// import "cropperjs/dist/cropper.css";
import {
  FaImage,
  FaClone,
  FaBorderStyle,
  FaCrop,
  FaTextHeight,
  FaPalette,
  FaShapes,
} from "react-icons/fa";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { SketchPicker } from "react-color";

export default function ImageEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(
    location.state?.image || null
  );
  const [borderRadius, setBorderRadius] = useState<number>(10);
  const [border, setBorder] = useState<{ color: string; thickness: number }>({
    color: "#000000",
    thickness: 0,
  });
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [showBorderModal, setShowBorderModal] = useState<boolean>(false);
  const [duplicatedImage, setDuplicatedImage] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [shapes, setShapes] = useState<string[]>([]);
  const cropperRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);
  const textRef = useRef<HTMLDivElement | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
          setShowCropper(true);
          setShowUploadModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    setShowUploadModal(true);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCrop = () => {
    if (!cropperRef.current) return;
    const cropper = (cropperRef.current as any).cropper;
    const croppedImage = cropper.getCroppedCanvas().toDataURL();
    setImage(croppedImage);
    setShowCropper(false);
  };

  const handleDuplicate = () => {
    if (image) {
      setDuplicatedImage(image);
    }
  };

  const toggleCropperAndCrop = () => {
    setShowCropper(!showCropper);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
          setShowCropper(true);
          setShowUploadModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleBusiness = () => {
    setIsBusinessOpen(!isBusinessOpen);
  };

  const openProfile = () => {
    navigate("/profile");
  };

  const handleAddText = () => {
    const newText = prompt("Enter text to add/edit:", text);
    if (newText !== null) {
      setText(newText);
    }
  };

  const handleEditBackgroundColor = () => {
    setShowColorPicker(!showColorPicker);
  };

  const handleAddShapes = () => {
    const newShape = prompt("Enter shape to add (e.g., circle, square):");
    if (newShape) {
      setShapes([...shapes, newShape]);
    }
  };

  const handleTextDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const style = window.getComputedStyle(e.target as Element, null);
    const str =
      parseInt(style.getPropertyValue("left")) -
      e.clientX +
      "," +
      (parseInt(style.getPropertyValue("top")) - e.clientY);
    e.dataTransfer.setData("text/plain", str);
  };

  const handleTextDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const offset = e.dataTransfer.getData("text/plain").split(",");
    const dm = textRef.current;
    if (dm) {
      dm.style.left = e.clientX + parseInt(offset[0], 10) + "px";
      dm.style.top = e.clientY + parseInt(offset[1], 10) + "px";
    }
    e.preventDefault();
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="flex-1">
        <div className="flex ">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            toggleBusiness={toggleBusiness}
            isBusinessOpen={isBusinessOpen}
            openProfile={openProfile}
          />
          <div className="fixed md:ml-[15%] bg-white top-0 w-full md:w-[85%] hidden md:block">
            <Navbar />
          </div>
        </div>
        <div className="p-4 md:p-10 flex flex-col md:flex-row gap-4 md:gap-12 mt-20 mx-auto shadow-lg w-full md:w-[50%] justify-center bg-white rounded-xl md:ml-80">
          <div className="w-full md:w-28 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-row md:flex-col items-center py-4 md:py-8 gap-4 md:gap-8 justify-around md:justify-start">
            <div
              className="sidebar-item flex flex-col items-center"
              onClick={handleImageClick}
            >
              <FaImage size={30} className="text-gray-600" />
              <span className="text-sm mt-3 text-gray-600">Upload</span>
            </div>
            <div
              className="sidebar-item flex flex-col items-center"
              onClick={handleDuplicate}
            >
              <FaClone size={30} className="text-gray-600" />
              <span className="text-sm mt-3 text-gray-600">Duplicate</span>
            </div>
            <div
              className="sidebar-item flex flex-col items-center"
              onClick={() => setShowBorderModal(true)}
            >
              <FaBorderStyle size={30} className="text-gray-600" />
              <span className="text-sm mt-3 text-gray-600">Border</span>
            </div>
            <div
              className="sidebar-item flex flex-col items-center"
              onClick={toggleCropperAndCrop}
            >
              <FaCrop size={30} className="text-gray-600" />
              <span className="text-sm mt-3 text-gray-600">Crop</span>
            </div>
            <div
              className="sidebar-item flex flex-col items-center"
              onClick={handleAddText}
            >
              <FaTextHeight size={30} className="text-gray-600" />
              <span className="text-sm mt-3 text-gray-600">Text</span>
            </div>
            <div
              className="sidebar-item flex flex-col items-center"
              onClick={handleEditBackgroundColor}
            >
              <FaPalette size={30} className="text-gray-600" />
              <span className="text-sm mt-3 text-gray-600">Background</span>
            </div>
            <div
              className="sidebar-item flex flex-col items-center"
              onClick={handleAddShapes}
            >
              <FaShapes size={30} className="text-gray-600" />
              <span className="text-sm mt-3 text-gray-600">Shapes</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 md:gap-8">
            {image && (
              <div
                className="p-4 md:p-6 shadow-lg rounded-xl max-w-full md:max-w-xl text-center border border-gray-300"
                style={{ backgroundColor }}
              >
                {showCropper ? (
                  <div>
                    <Cropper
                      src={image}
                      style={{
                        height: 320,
                        width: "100%",
                        borderRadius: `${borderRadius}px`,
                        border: `${border.thickness}px solid ${border.color}`,
                      }}
                      initialAspectRatio={1}
                      guides={false}
                      ref={cropperRef}
                      cropBoxResizable={true}
                      cropBoxMovable={true}
                      viewMode={1}
                    />
                    <button
                      onClick={handleCrop}
                      className="w-full cursor-pointer py-3 md:py-4 bg-[#4f46e5] text-white rounded-lg transition font-bold hover:from-[#3b3a9a] hover:to-[#5a0c9d]"
                    >
                      Apply Crop
                    </button>
                  </div>
                ) : (
                  <div
                    className="relative"
                    onDrop={handleTextDrop}
                    onDragOver={handleDragOver}
                  >
                    <img
                      src={image}
                      alt="Uploaded"
                      className="w-full shadow-md rounded-xl mb-4"
                      style={{
                        borderRadius: `${borderRadius}px`,
                        border: `${border.thickness}px solid ${border.color}`,
                        backgroundColor,
                      }}
                    />
                    {text && (
                      <div
                        ref={textRef}
                        className="absolute bottom-4 left-4 text-lg text-black bg-transparent p-2 rounded cursor-pointer"
                        onClick={handleAddText}
                        draggable
                        onDragStart={handleTextDragStart}
                      >
                        {text}
                      </div>
                    )}
                  </div>
                )}
                {shapes.length > 0 && (
                  <div className="mt-4">
                    {shapes.map((shape, index) => (
                      <div key={index} className="text-sm">
                        {shape}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {duplicatedImage && (
              <div
                className="p-4 md:p-6 shadow-lg rounded-xl max-w-full md:max-w-xl text-center border border-gray-300"
                style={{ backgroundColor }}
              >
                <img
                  src={duplicatedImage}
                  alt="Duplicated"
                  className="w-full shadow-md rounded-xl mb-4"
                  style={{
                    borderRadius: `${borderRadius}px`,
                    border: `${border.thickness}px solid ${border.color}`,
                    backgroundColor,
                  }}
                />
              </div>
            )}
            {showBorderModal && (
              <div className="md:hidden bg-white p-8 rounded-lg shadow-lg border border-gray-300 max-w-xs w-full mx-4">
                <h2 className="text-lg font-bold mb-4">Set Border Options</h2>
                <label className="text-sm">Border Color:</label>
                <input
                  type="color"
                  value={border.color}
                  onChange={(e) =>
                    setBorder({ ...border, color: e.target.value })
                  }
                  className="border-2 border-gray-200 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
                <label className="text-sm mt-2">Border Thickness:</label>
                <input
                  type="number"
                  value={border.thickness}
                  onChange={(e) =>
                    setBorder({
                      ...border,
                      thickness: parseInt(e.target.value),
                    })
                  }
                  className="border-2 border-gray-200 rounded w-24 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
                <label className="text-sm mt-2">Border Radius:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                  className="w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
                <button
                  onClick={() => setShowBorderModal(false)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showUploadModal && (
        <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Upload Image</h2>
            <div
              className="border-2 border-dashed border-gray-300 p-4 mb-4 text-center cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()} // Trigger file input click on div click
            >
              Drag and drop an image here, or click to select a file
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleUpload}
              />
            </div>
            <button
              onClick={() => setShowUploadModal(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showColorPicker && (
        <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Select Background Color</h2>
            <SketchPicker
              color={backgroundColor}
              onChangeComplete={(color) => setBackgroundColor(color.hex)}
            />
            <button
              onClick={() => setShowColorPicker(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showBorderModal && (
        <div className="hidden md:flex right-82 top-72 fixed inset-0 bg-transparent justify-center items-center z-24">
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 max-w-xs w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Set Border Options</h2>
            <label className="text-sm">Border Color:</label>
            <input
              type="color"
              value={border.color}
              onChange={(e) => setBorder({ ...border, color: e.target.value })}
              className="border-2 border-gray-200 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <label className="text-sm mt-2">Border Thickness:</label>
            <input
              type="number"
              value={border.thickness}
              onChange={(e) =>
                setBorder({ ...border, thickness: parseInt(e.target.value) })
              }
              className="border-2 border-gray-200 rounded w-24 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <label className="text-sm mt-2">Border Radius:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={borderRadius}
              onChange={(e) => setBorderRadius(parseInt(e.target.value))}
              className="w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <button
              onClick={() => setShowBorderModal(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
