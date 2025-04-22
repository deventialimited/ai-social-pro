import { X, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
import MaskPreview from "./MaskPreview";

function ApplyMaskTab({ onClose, selectedElementId }) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const { updateElement, elements } = useEditor();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (selectedElementId) {
      const element = elements.find((el) => el.id === selectedElementId);
      setSelectedElement(element);
      
      // Store the original image when first selecting an element
      if (element && !originalImage) {
        const img = new Image();
        img.src = element.props.src;
        img.onload = () => {
          setOriginalImage(img);
        };
      }
    }
  }, [elements, selectedElementId]);

  const masks = [
    { id: "square", label: "Square" },
    { id: "circle", label: "Circle" },
    { id: "star", label: "Star" },
    { id: "triangle", label: "Triangle" },
    { id: "triangle-bottom-left", label: "Triangle Bottom Left" },
    { id: "diamond", label: "Diamond" },
    { id: "pentagon", label: "Pentagon" },
    { id: "hexagon", label: "Hexagon" },
    { id: "speech-bubble", label: "Speech Bubble" },
    { id: "cross", label: "Cross" },
    { id: "oval", label: "Oval" },
    { id: "cloud", label: "Cloud" },
    { id: "arrow-left", label: "Arrow Left" },
    { id: "arrow-right", label: "Arrow Right" },
    { id: "arrow-down", label: "Arrow Down" },
    { id: "arrow-up", label: "Arrow Up" },
    { id: "flower", label: "Flower" },
    { id: "asterisk", label: "Asterisk" },
    { id: "flag", label: "Flag" },
    { id: "half-circle", label: "Half Circle" },
    { id: "cylinder", label: "Cylinder" },
    { id: "diamond-alt", label: "Diamond Alt" },
    { id: "rounded-rectangle", label: "Rounded Rectangle" },
    { id: "teardrop", label: "Teardrop" },
    { id: "droplet", label: "Droplet" },
    { id: "burst", label: "Burst" },
    { id: "wave", label: "Wave" },
    { id: "flower-alt", label: "Flower Alt" },
  ];

  const filteredMasks = searchQuery
    ? masks.filter((mask) => mask.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : masks;

  // Function to apply mask to the selected element
  const applyMask = (maskId) => {
    if (!selectedElement || !originalImage) return;

    // Create a canvas to apply the mask
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Set canvas dimensions to match the element
    canvas.width = selectedElement.styles.width || 300;
    canvas.height = selectedElement.styles.height || 300;
    
    // Draw the original image (not the masked one)
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    
    // Create a temporary canvas for the mask
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    
    // Draw the mask shape
    maskCtx.fillStyle = "#ffffff"; // Use white for the mask
    maskCtx.beginPath();
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(canvas.width, canvas.height);
    
    // Draw the mask shape based on the selected mask type
    switch (maskId) {
      case "circle":
        maskCtx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
        break;
      case "square":
        maskCtx.rect(centerX - size / 2, centerY - size / 2, size, size);
        break;
      case "star":
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const radius = i % 2 === 0 ? size / 2 : size / 4;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          if (i === 0) maskCtx.moveTo(x, y);
          else maskCtx.lineTo(x, y);
        }
        break;
      case "triangle":
        maskCtx.moveTo(centerX, centerY - size / 2);
        maskCtx.lineTo(centerX + size / 2, centerY + size / 2);
        maskCtx.lineTo(centerX - size / 2, centerY + size / 2);
        break;
      case "triangle-bottom-left":
        maskCtx.moveTo(centerX - size / 2, centerY - size / 2);
        maskCtx.lineTo(centerX + size / 2, centerY - size / 2);
        maskCtx.lineTo(centerX - size / 2, centerY + size / 2);
        break;
      case "diamond":
        maskCtx.moveTo(centerX, centerY - size / 2);
        maskCtx.lineTo(centerX + size / 2, centerY);
        maskCtx.lineTo(centerX, centerY + size / 2);
        maskCtx.lineTo(centerX - size / 2, centerY);
        break;
      case "pentagon":
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = centerX + (size / 2) * Math.cos(angle);
          const y = centerY + (size / 2) * Math.sin(angle);
          if (i === 0) maskCtx.moveTo(x, y);
          else maskCtx.lineTo(x, y);
        }
        break;
      case "hexagon":
        for (let i = 0; i < 6; i++) {
          const angle = (i * 2 * Math.PI) / 6;
          const x = centerX + (size / 2) * Math.cos(angle);
          const y = centerY + (size / 2) * Math.sin(angle);
          if (i === 0) maskCtx.moveTo(x, y);
          else maskCtx.lineTo(x, y);
        }
        break;
      case "speech-bubble":
        const bubbleRadius = size / 4;
        maskCtx.moveTo(centerX - size / 2, centerY - size / 2);
        maskCtx.lineTo(centerX + size / 2, centerY - size / 2);
        maskCtx.lineTo(centerX + size / 2, centerY + size / 4);
        maskCtx.lineTo(centerX + size / 4, centerY + size / 4);
        maskCtx.lineTo(centerX + size / 4, centerY + size / 2);
        maskCtx.lineTo(centerX - size / 2, centerY + size / 2);
        break;
      case "cross":
        const crossWidth = size / 3;
        maskCtx.rect(centerX - crossWidth / 2, centerY - size / 2, crossWidth, size);
        maskCtx.rect(centerX - size / 2, centerY - crossWidth / 2, size, crossWidth);
        break;
      case "oval":
        maskCtx.ellipse(centerX, centerY, size / 2, size / 3, 0, 0, Math.PI * 2);
        break;
      case "cloud":
        const cloudRadius = size / 4;
        maskCtx.arc(centerX - cloudRadius, centerY, cloudRadius, Math.PI, 0, true);
        maskCtx.arc(centerX, centerY - cloudRadius, cloudRadius, Math.PI * 1.5, Math.PI * 0.5, true);
        maskCtx.arc(centerX + cloudRadius, centerY, cloudRadius, Math.PI, 0, true);
        maskCtx.arc(centerX + cloudRadius, centerY + cloudRadius, cloudRadius, Math.PI * 1.5, Math.PI * 0.5, true);
        maskCtx.arc(centerX - cloudRadius, centerY + cloudRadius, cloudRadius, Math.PI * 1.5, Math.PI * 0.5, true);
        break;
      case "arrow-left":
        maskCtx.moveTo(centerX + size / 2, centerY - size / 3);
        maskCtx.lineTo(centerX - size / 2, centerY);
        maskCtx.lineTo(centerX + size / 2, centerY + size / 3);
        break;
      case "arrow-right":
        maskCtx.moveTo(centerX - size / 2, centerY - size / 3);
        maskCtx.lineTo(centerX + size / 2, centerY);
        maskCtx.lineTo(centerX - size / 2, centerY + size / 3);
        break;
      case "arrow-down":
        maskCtx.moveTo(centerX - size / 3, centerY - size / 2);
        maskCtx.lineTo(centerX, centerY + size / 2);
        maskCtx.lineTo(centerX + size / 3, centerY - size / 2);
        break;
      case "arrow-up":
        maskCtx.moveTo(centerX - size / 3, centerY + size / 2);
        maskCtx.lineTo(centerX, centerY - size / 2);
        maskCtx.lineTo(centerX + size / 3, centerY + size / 2);
        break;
      case "flower":
        for (let i = 0; i < 8; i++) {
          const angle = (i * 2 * Math.PI) / 8;
          const x = centerX + (size / 2) * Math.cos(angle);
          const y = centerY + (size / 2) * Math.sin(angle);
          if (i === 0) maskCtx.moveTo(x, y);
          else maskCtx.lineTo(x, y);
        }
        maskCtx.arc(centerX, centerY, size / 6, 0, Math.PI * 2);
        break;
      case "asterisk":
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const x = centerX + (size / 2) * Math.cos(angle);
          const y = centerY + (size / 2) * Math.sin(angle);
          if (i === 0) maskCtx.moveTo(x, y);
          else maskCtx.lineTo(x, y);
        }
        break;
      case "flag":
        maskCtx.moveTo(centerX - size / 2, centerY - size / 2);
        maskCtx.lineTo(centerX - size / 2, centerY + size / 2);
        maskCtx.moveTo(centerX - size / 2, centerY - size / 2);
        maskCtx.lineTo(centerX + size / 4, centerY - size / 4);
        maskCtx.lineTo(centerX - size / 2, centerY);
        break;
      case "half-circle":
        maskCtx.arc(centerX, centerY, size / 2, 0, Math.PI, true);
        break;
      case "cylinder":
        maskCtx.ellipse(centerX, centerY - size / 4, size / 2, size / 4, 0, 0, Math.PI * 2);
        maskCtx.ellipse(centerX, centerY + size / 4, size / 2, size / 4, 0, 0, Math.PI * 2);
        maskCtx.rect(centerX - size / 2, centerY - size / 4, size, size / 2);
        break;
      case "diamond-alt":
        maskCtx.moveTo(centerX, centerY - size / 2);
        maskCtx.lineTo(centerX + size / 2, centerY);
        maskCtx.lineTo(centerX, centerY + size / 2);
        maskCtx.lineTo(centerX - size / 2, centerY);
        break;
      case "rounded-rectangle":
        const cornerRadius = size / 6;
        maskCtx.moveTo(centerX - size / 2 + cornerRadius, centerY - size / 2);
        maskCtx.lineTo(centerX + size / 2 - cornerRadius, centerY - size / 2);
        maskCtx.arc(centerX + size / 2 - cornerRadius, centerY - size / 2 + cornerRadius, cornerRadius, -Math.PI / 2, 0);
        maskCtx.lineTo(centerX + size / 2, centerY + size / 2 - cornerRadius);
        maskCtx.arc(centerX + size / 2 - cornerRadius, centerY + size / 2 - cornerRadius, cornerRadius, 0, Math.PI / 2);
        maskCtx.lineTo(centerX - size / 2 + cornerRadius, centerY + size / 2);
        maskCtx.arc(centerX - size / 2 + cornerRadius, centerY + size / 2 - cornerRadius, cornerRadius, Math.PI / 2, Math.PI);
        maskCtx.lineTo(centerX - size / 2, centerY - size / 2 + cornerRadius);
        maskCtx.arc(centerX - size / 2 + cornerRadius, centerY - size / 2 + cornerRadius, cornerRadius, Math.PI, -Math.PI / 2);
        break;
      case "teardrop":
        maskCtx.ellipse(centerX, centerY, size / 2, size / 2, 0, 0, Math.PI * 2);
        break;
      case "droplet":
        maskCtx.ellipse(centerX, centerY, size / 2, size / 2, 0, 0, Math.PI * 2);
        break;
      case "burst":
        for (let i = 0; i < 12; i++) {
          const angle = (i * 2 * Math.PI) / 12;
          const r = i % 2 === 0 ? size / 2 : size / 4;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          if (i === 0) maskCtx.moveTo(x, y);
          else maskCtx.lineTo(x, y);
        }
        break;
      case "wave":
        const amplitude = size / 4;
        const frequency = Math.PI * 2;
        maskCtx.moveTo(centerX - size / 2, centerY);
        for (let x = centerX - size / 2; x <= centerX + size / 2; x += 2) {
          const y = centerY + amplitude * Math.sin((x - centerX) / (size / 2) * frequency);
          maskCtx.lineTo(x, y);
        }
        maskCtx.lineTo(centerX + size / 2, centerY + size / 2);
        maskCtx.lineTo(centerX - size / 2, centerY + size / 2);
        break;
      case "flower-alt":
        for (let i = 0; i < 10; i++) {
          const angle = (i * 2 * Math.PI) / 10;
          const r = i % 2 === 0 ? size / 2 : size / 4;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          if (i === 0) maskCtx.moveTo(x, y);
          else maskCtx.lineTo(x, y);
        }
        break;
      default:
        // Default to circle if mask type not recognized
        maskCtx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
    }
    
    maskCtx.closePath();
    maskCtx.fill();
    
    // Apply the mask using composite operation
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(maskCanvas, 0, 0);
    
    // Convert the canvas to a data URL
    const maskedImageUrl = canvas.toDataURL("image/png");
    
    // Update the element with the masked image
    updateElement(selectedElementId, {
      props: {
        ...selectedElement.props,
        src: maskedImageUrl,
        mask: maskId,
        originalSrc: originalImage.src // Store the original image source
      }
    });
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Mask image</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search masks..."
          className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {filteredMasks.map((mask) => (
          <div
            key={mask.id}
            className="aspect-square bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer flex flex-col items-center justify-center p-2"
            onClick={() => applyMask(mask.id)}
          >
            <MaskPreview maskId={mask.id} size={40} />
            <span className="text-xs mt-2 text-center">{mask.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApplyMaskTab;
