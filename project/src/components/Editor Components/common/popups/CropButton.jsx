import { useState, useEffect, useRef, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react"; // Headless UI Dialog
import { Crop } from "lucide-react"; // Icon for crop button
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

function CropModal({ selectedElement, updateElement, isOpen, closeModal }) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [aspect, setAspect] = useState(undefined);

  // Function to center and set the crop aspect ratio
  const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90, // 90% of the image width
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  };

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  // Update preview canvas whenever crop or scale changes
  useEffect(() => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      canvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop
      );
    }
  }, [completedCrop]);

  const canvasPreview = (image, canvas, crop) => {
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = "high";

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();
    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.translate(-centerX, -centerY);

    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    );

    ctx.restore();
  };

  const handleDone = () => {
    if (imgRef.current && completedCrop?.width && completedCrop?.height) {
      const updatedStyles = {
        ...selectedElement?.styles,
        width: completedCrop.width,
        height: completedCrop.height,
      };

      updateElement(selectedElement?.id, {
        styles: updatedStyles,
      });
    }
    closeModal();
  };

  const handleCancel = () => {
    closeModal();
  };

  const handleAspectChange = (newAspect) => {
    setAspect(newAspect);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, newAspect));
    }
  };

  // Ensure crop state is reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCrop(undefined);
      setCompletedCrop(undefined);
      setAspect(undefined); // Reset aspect on modal close
    }
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="max-w-3xl p-6 bg-white rounded-md shadow-lg">
                <Dialog.Title className="text-xl font-medium mb-4">
                  Crop Image
                </Dialog.Title>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h3 className="text-sm font-medium mb-2">Adjust Crop</h3>
                    {selectedElement?.props?.src && (
                      <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspect}
                        className="max-h-[400px] mx-auto"
                      >
                        <img
                          ref={imgRef}
                          alt="Crop me"
                          src={selectedElement.props.src || "/placeholder.svg"}
                          onLoad={onImageLoad}
                          crossOrigin="anonymous"
                        />
                      </ReactCrop>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="border rounded-md p-4 bg-gray-50 mb-4">
                      <h3 className="text-sm font-medium mb-2">Preview</h3>
                      {!!completedCrop && (
                        <canvas
                          ref={previewCanvasRef}
                          className="mx-auto border border-gray-200"
                          style={{
                            objectFit: "contain",
                            width: completedCrop.width,
                            height: completedCrop.height,
                          }}
                        />
                      )}
                    </div>

                    <div className="border rounded-md p-4 bg-gray-50">
                      <h3 className="text-sm font-medium mb-3">Controls</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm mb-1">
                            Aspect Ratio
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className={`px-3 py-1 text-xs rounded-md ${
                                aspect === undefined
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200"
                              }`}
                              onClick={() => handleAspectChange(undefined)}
                            >
                              Free
                            </button>
                            <button
                              type="button"
                              className={`px-3 py-1 text-xs rounded-md ${
                                aspect === 1
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200"
                              }`}
                              onClick={() => handleAspectChange(1)}
                            >
                              1:1
                            </button>
                            <button
                              type="button"
                              className={`px-3 py-1 text-xs rounded-md ${
                                aspect === 4 / 3
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200"
                              }`}
                              onClick={() => handleAspectChange(4 / 3)}
                            >
                              4:3
                            </button>
                            <button
                              type="button"
                              className={`px-3 py-1 text-xs rounded-md ${
                                aspect === 16 / 9
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200"
                              }`}
                              onClick={() => handleAspectChange(16 / 9)}
                            >
                              16:9
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    onClick={handleDone}
                    disabled={!completedCrop?.width || !completedCrop?.height}
                  >
                    Apply Crop
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}


export default function CropButton({ selectedElement, updateElement }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <button
        className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border"
        onClick={openModal} // Trigger the modal open
      >
        <Crop className="h-5 w-5 text-gray-600" />
        <span className="w-max">Crop</span>
      </button>

      {/* Modal for cropping */}
      <CropModal
        selectedElement={selectedElement}
        updateElement={updateElement}
        isOpen={isModalOpen}
        closeModal={closeModal}
      />
    </div>
  );
}
