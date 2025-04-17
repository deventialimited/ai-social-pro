import React, { useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { useEditor } from "../EditorStoreHooks/FullEditorHooks";
import EditableTextElement from "./EditableTextElement";
import { useElementResize } from "./helpers/useElementResize";
import { useElementRotate } from "./helpers/useElementRotate";
import { MoveDiagonal, RotateCcw } from "lucide-react"; // ✅ Add this at top with other imports
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
  const { id, type, position, styles = {}, props = {} } = element;
  const { updateElement } = useEditor();
  const elementRef = useRef(null);
  const startSizeRef = useRef(); // ✅ Declare it before using
  const onResizeStart = () => {
    startSizeRef.current = {
      width: styles.width || 100,
      height: styles.height || 30,
      fontSize: styles.fontSize || "16px",
    };
  };
  const handleDoubleClick = () => {
    setShowSelectorOverlay(false);
  };
  const onResize = ({ deltaX, deltaY }, direction) => {
    const { width, height, fontSize: rawFontSize } = startSizeRef.current;
    const fontSize = parseFloat(rawFontSize);

    let newWidth = width;
    let newHeight = height;
    let newX = position.x;
    let newY = position.y;

    switch (direction) {
      case "n":
        newHeight = Math.max(height - deltaY, 20);
        newY = position.y + (height - newHeight);
        break;
      case "s":
        newHeight = Math.max(height + deltaY, 20);
        break;
      case "w":
        newWidth = Math.max(width - deltaX, 20);
        newX = position.x + (width - newWidth);
        break;
      case "e":
        newWidth = Math.max(width + deltaX, 20);
        break;
      case "nw":
        newWidth = Math.max(width - deltaX, 20);
        newHeight = Math.max(height - deltaY, 20);
        newX = position.x + (width - newWidth);
        newY = position.y + (height - newHeight);
        break;
      case "ne":
        newWidth = Math.max(width + deltaX, 20);
        newHeight = Math.max(height - deltaY, 20);
        newY = position.y + (height - newHeight);
        break;
      case "sw":
        newWidth = Math.max(width - deltaX, 20);
        newHeight = Math.max(height + deltaY, 20);
        newX = position.x + (width - newWidth);
        break;
      case "se":
        newWidth = Math.max(width + deltaX, 20);
        newHeight = Math.max(height + deltaY, 20);
        break;
    }

    const scale = Math.max(newWidth / width, newHeight / height);
    const newFontSize = Math.max(fontSize * scale, 8);

    updateElement(id, {
      position: { x: newX, y: newY },
      styles: {
        ...styles,
        width: newWidth,
        height: newHeight,
        // fontSize: `${newFontSize}px`,
      },
    });
  };
  const { handleRotateMouseDown } = useElementRotate((angle) => {
    updateElement(id, {
      styles: {
        ...styles,
        transform: `rotate(${angle}deg)`,
      },
    });
  });
  return (
    <Rnd
      key={id}
      size={{ width: styles.width, height: styles.height }}
      position={{ x: position.x, y: position.y }}
      bounds="parent"
      onDragStop={(e, d) => updateElement(id, { position: { x: d.x, y: d.y } })}
      onClick={() => onSelect(id, type)}
      enableResizing={false} // for now, we focus on dragging
    >
      {type === "text" && (
        <div
          ref={elementRef}
          className={`absolute ${
            isSelected ? "border-2 border-blue-500" : "border"
          }`}
          style={{
            ...styles,
            transform: styles.transform || "rotate(0deg)",
          }}
        >
          <EditableTextElement
            text={props.text}
            styles={{
              ...styles,
              transform: "rotate(0deg)",
            }}
            onChange={(newText) =>
              updateElement(id, { props: { ...props, text: newText } })
            }
          />

          {isSelected && showSelectorOverlay && (
            <>
              {/* Resize Handle */}
              <div
                onDoubleClick={handleDoubleClick}
                className="absolute inset-0 border z-10 border-blue-500 bg-green-300/70"
              >
                {/* Corner Handles */}
                <ResizeHandle
                  onResize={onResize}
                  onResizeStart={onResizeStart}
                  position="nw"
                  className="top-0 left-0"
                />
                <ResizeHandle
                  onResize={onResize}
                  onResizeStart={onResizeStart}
                  position="ne"
                  className="top-0 right-0"
                />
                <ResizeHandle
                  onResize={onResize}
                  onResizeStart={onResizeStart}
                  position="sw"
                  className="bottom-0 left-0"
                />
                <ResizeHandle
                  onResize={onResize}
                  onResizeStart={onResizeStart}
                  position="se"
                  className="bottom-0 right-0"
                />

                {/* Edge Handles */}
                <ResizeHandle
                  onResize={onResize}
                  onResizeStart={onResizeStart}
                  position="n"
                  className="top-0 left-1/2 -translate-x-1/2"
                />
                <ResizeHandle
                  onResize={onResize}
                  onResizeStart={onResizeStart}
                  position="s"
                  className="bottom-0 left-1/2 -translate-x-1/2"
                />
                <ResizeHandle
                  onResize={onResize}
                  onResizeStart={onResizeStart}
                  position="w"
                  className="left-0 top-1/2 -translate-y-1/2"
                />
                <ResizeHandle
                  onResize={onResize}
                  onResizeStart={onResizeStart}
                  position="e"
                  className="right-0 top-1/2 -translate-y-1/2"
                />
              </div>

              {/* Rotate Handle */}
              <div
                onMouseDown={(e) => handleRotateMouseDown(e, elementRef)}
                className="absolute -top-5 left-1/2 flex flex-col justify-center items-center -translate-x-1/2 -translate-y-1/2"
              >
                <div className="bg-white rounded-full shadow cursor-crosshair  flex items-center justify-center border border-gray-300 h-5 w-5">
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
