import React, { useRef, useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { useEditor } from "../EditorStoreHooks/FullEditorHooks";
import EditableTextElement from "./EditableTextElement";
import { useElementResize } from "./helpers/useElementResize";
import { useElementRotate } from "./helpers/useElementRotate";
import { MoveDiagonal, RotateCcw } from "lucide-react";
import { ResizeHandle } from "./ResizeHandle";

/**
 * Renders and controls individual canvas elements
 */
const CanvasElement = ({
  element,
  onSelect,
  isSelected,
  showSelectorOverlay,
  setShowSelectorOverlay,
}) => {
  const {
    id,
    type,
    position,
    styles = {},
    props = {},
    visible,
    locked,
  } = element;
  const { updateElement, canvas } = useEditor();
  const elementRef = useRef(null);
  const startSizeRef = useRef();

  // Add keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isSelected || locked) return;

      const moveStep = 1; // Pixels to move per key press
      let newX = position.x;
      let newY = position.y;
      switch (e.key) {
        case "ArrowLeft":
          newX = Math.max(0, position.x - moveStep);
          break;
        case "ArrowRight":
          newX = Math.min(
            canvas.width - (styles.width || 100),
            position.x + moveStep
          );
          break;
        case "ArrowUp":
          newY = Math.max(0, position.y - moveStep);
          break;
        case "ArrowDown":
          newY = Math.min(
            canvas.height - (styles.height || 30),
            position.y + moveStep
          );
          break;
        default:
          return;
      }
      updateElement(id, {
        position: { x: newX, y: newY },
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isSelected,
    locked,
    position,
    id,
    updateElement,
    canvas.width,
    canvas.height,
    styles.width,
    styles.height,
  ]);

  const onResizeStart = () => {
    startSizeRef.current = {
      width: styles.width || 100,
      height: styles.height || 30,
      fontSize: styles.fontSize || "16px",
    };
  };

  const onResize = ({ deltaX, deltaY }, direction) => {
    if (!element || element.locked) return;
    const { width, height, fontSize: rawFontSize } = startSizeRef.current;
    const fontSize = parseFloat(rawFontSize);
    let newWidth = width;
    let newHeight = height;
    let newX = position.x;
    let newY = position.y;

    // Only maintain aspect ratio for images and shapes
    const shouldMaintainAspectRatio = (type === "image" || type === "shape") && window.event.shiftKey;
    const aspectRatio = shouldMaintainAspectRatio ? width / height : null;

    switch (direction) {
      case "n":
        newHeight = Math.max(height - deltaY, 20);
        if (shouldMaintainAspectRatio) {
          newWidth = newHeight * aspectRatio;
          newX = position.x + (width - newWidth);
        }
        newY = position.y + (height - newHeight);
        break;
      case "s":
        newHeight = Math.max(height + deltaY, 20);
        if (shouldMaintainAspectRatio) {
          newWidth = newHeight * aspectRatio;
        }
        break;
      case "w":
        newWidth = Math.max(width - deltaX, 20);
        if (shouldMaintainAspectRatio) {
          newHeight = newWidth / aspectRatio;
          newY = position.y + (height - newHeight);
        }
        newX = position.x + (width - newWidth);
        break;
      case "e":
        newWidth = Math.max(width + deltaX, 20);
        if (shouldMaintainAspectRatio) {
          newHeight = newWidth / aspectRatio;
        }
        break;
      case "nw":
        if (shouldMaintainAspectRatio) {
          // For diagonal resizing with SHIFT, use the larger delta to maintain aspect ratio
          const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
          newWidth = Math.max(width - delta, 20);
          newHeight = newWidth / aspectRatio;
          newX = position.x + (width - newWidth);
          newY = position.y + (height - newHeight);
        } else {
          newWidth = Math.max(width - deltaX, 20);
          newHeight = Math.max(height - deltaY, 20);
          newX = position.x + (width - newWidth);
          newY = position.y + (height - newHeight);
        }
        break;
      case "ne":
        if (shouldMaintainAspectRatio) {
          const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
          newWidth = Math.max(width + delta, 20);
          newHeight = newWidth / aspectRatio;
          newY = position.y + (height - newHeight);
        } else {
          newWidth = Math.max(width + deltaX, 20);
          newHeight = Math.max(height - deltaY, 20);
          newY = position.y + (height - newHeight);
        }
        break;
      case "sw":
        if (shouldMaintainAspectRatio) {
          const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
          newWidth = Math.max(width - delta, 20);
          newHeight = newWidth / aspectRatio;
          newX = position.x + (width - newWidth);
        } else {
          newWidth = Math.max(width - deltaX, 20);
          newHeight = Math.max(height + deltaY, 20);
          newX = position.x + (width - newWidth);
        }
        break;
      case "se":
        if (shouldMaintainAspectRatio) {
          const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
          newWidth = Math.max(width + delta, 20);
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = Math.max(width + deltaX, 20);
          newHeight = Math.max(height + deltaY, 20);
        }
        break;
    }

    // Only scale font size during diagonal resizing for text elements
    let newFontSize = fontSize;
    if (type === "text" && (
      direction === "nw" ||
      direction === "ne" ||
      direction === "sw" ||
      direction === "se"
    )) {
      const scale = Math.max(newWidth / width, newHeight / height);
      newFontSize = Math.max(fontSize * scale, 8);
    }

    updateElement(id, {
      position: { x: newX, y: newY },
      styles: {
        ...styles,
        width: newWidth,
        height: newHeight,
        fontSize: `${newFontSize}px`,
      },
    });
  };

  const { handleRotateMouseDown } = useElementRotate((angle) => {
    if (!element || element.locked) return;
    updateElement(id, {
      styles: {
        ...styles,
        transform: `rotate(${angle}deg)`,
      },
    });
  });

  // Handle image drag optimization - ADDED CODE
  const handleDragStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (type === "image" && elementRef.current) {
      elementRef.current.style.willChange = "transform";
      const img = elementRef.current.querySelector("img");
      if (img) {
        img.style.pointerEvents = "none";
      }
    }
  };

  const handleDragStop = (e, d) => {
    e.stopPropagation();
    e.preventDefault();
    if (!element || element.locked) return;

    if (type === "image" && elementRef.current) {
      elementRef.current.style.willChange = "auto";
      const img = elementRef.current.querySelector("img");
      if (img) {
        img.style.pointerEvents = "auto";
      }
    }

    updateElement(id, {
      position: { x: d.x, y: d.y },
      styles: {
        ...styles,
        position: "static",
        left: null,
        right: null,
        top: null,
        bottom: null,
      },
    });
  };

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(id, type);
  };

  return (
    <Rnd
      key={id}
      size={{ width: styles.width, height: styles.height }}
      position={{ x: position.x, y: position.y }}
      style={{
        position: "absolute",
        zIndex: styles?.zIndex,
        display: visible ? "block" : "none",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        cursor: isSelected ? "move" : "default",
      }}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onClick={handleClick}
      enableResizing={false}
      disableDragging={locked}
      dragHandleClassName={isSelected ? "drag-handle" : ""}
    >
      {["text", "image", "shape"].includes(type) && (
        <div
          ref={elementRef}
          className={`${
            isSelected ? "border-2 border-blue-500" : ""
          } drag-handle`}
          style={{
            position: "static",
            height: "inherit",
            transform:
              styles.transform && styles.transform.startsWith("rotate")
                ? styles.transform
                : "rotate(0deg)",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          {type === "text" && (
            <EditableTextElement
              text={props.text}
              styles={{
                ...styles,
                position: "static",
                transform: "rotate(0deg)",
              }}
              onChange={(newText) => {
                if (!element || element.locked) return;
                updateElement(id, { props: { ...props, text: newText } });
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                const textElement = e.target;
                if (textElement) {
                  const range = document.createRange();
                  range.selectNodeContents(textElement);
                  const selection = window.getSelection();
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }}
            />
          )}

          {type === "image" && (
            <img
              id={element.id}
              src={props.src}
              style={{
                ...styles,
                position: "static",
                transform: "rotate(0deg)",
              }}
              alt="Canvas"
              className="w-full h-full object-cover"
              draggable={false} // ADDED: Prevent default browser dragging
            />
          )}

          {type === "shape" && (
            <div
              style={{
                ...styles,
                position: "static",
                transform: "rotate(0deg)",
                overflow: "hidden",
                color: styles.fill || styles.color || "#D3D3D3",
                // Remove any default padding/margin that might create space
                padding: 0,
                margin: 0,
                // Ensure the div fits exactly to its content
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                }}
                dangerouslySetInnerHTML={{
                  __html: props.svg?.svg?.replace(
                    /<svg([^>]*)>/,
                    `<svg$1 width="100%" height="100%" preserveAspectRatio="none" style="display:block;">`
                  ),
                }}
              />
            </div>
          )}

          {isSelected && (
            <>
              {/* Resize Handles */}
              {/* Corners */}
              <ResizeHandle
                onResize={onResize}
                onResizeStart={onResizeStart}
                position="nw"
                className="absolute z-10 top-0 left-0"
              />
              <ResizeHandle
                onResize={onResize}
                onResizeStart={onResizeStart}
                position="ne"
                className="absolute z-10 top-0 right-0"
              />
              <ResizeHandle
                onResize={onResize}
                onResizeStart={onResizeStart}
                position="sw"
                className="absolute z-10 bottom-0 left-0"
              />
              <ResizeHandle
                onResize={onResize}
                onResizeStart={onResizeStart}
                position="se"
                className="absolute z-10 bottom-0 right-0"
              />
              {/* Edges */}
              <ResizeHandle
                onResize={onResize}
                onResizeStart={onResizeStart}
                position="n"
                className="absolute z-10 top-0 left-1/2 -translate-x-1/2"
              />
              <ResizeHandle
                onResize={onResize}
                onResizeStart={onResizeStart}
                position="s"
                className="absolute z-10 bottom-0 left-1/2 -translate-x-1/2"
              />
              <ResizeHandle
                onResize={onResize}
                onResizeStart={onResizeStart}
                position="w"
                className="absolute z-10 left-0 top-1/2 -translate-y-1/2"
              />
              <ResizeHandle
                onResize={onResize}
                onResizeStart={onResizeStart}
                position="e"
                className="absolute z-10 right-0 top-1/2 -translate-y-1/2"
              />
              {/* Rotate Handle */}
              <div
                onMouseDown={(e) => handleRotateMouseDown(e, elementRef)}
                className="absolute -top-5 left-1/2 flex flex-col justify-center items-center -translate-x-1/2 -translate-y-1/2"
              >
                <div className="bg-white rounded-full shadow cursor-crosshair flex items-center justify-center border border-gray-300 h-5 w-5">
                  <RotateCcw size={14} />
                </div>
                <span className="border-l-4 h-5 border-blue-500"></span>
              </div>
            </>
          )}
        </div>
      )}
    </Rnd>
  );
};

export default CanvasElement;
