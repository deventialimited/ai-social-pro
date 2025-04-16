import React, { useRef } from "react";
import { Rnd } from "react-rnd";
import { useEditor } from "../EditorStoreHooks/FullEditorHooks";
import EditableTextElement from "./EditableTextElement";
import { useElementResize } from "./helpers/useElementResize";
import { useElementRotate } from "./helpers/useElementRotate";
import { MoveDiagonal, RotateCcw } from "lucide-react"; // ✅ Add this at top with other imports

/**
 * Renders and controls individual canvas elements
 */
const CanvasElement = ({ element, onSelect, isSelected }) => {
  const { id, type, position, size, styles = {}, props = {} } = element;
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

  const onResize = ({ deltaX, deltaY }, direction) => {
    const {
      width: startWidth,
      height: startHeight,
      fontSize: rawFontSize,
    } = startSizeRef.current;

    const initialFontSize = parseFloat(rawFontSize);
    const scaleX = (startWidth + deltaX) / startWidth;
    const scaleY = (startHeight + deltaY) / startHeight;
    const scale = Math.max(scaleX, scaleY);

    const newWidth = Math.max(startWidth * scaleX, 20);
    const newHeight = Math.max(startHeight * scaleY, 20);
    const newFontSize = Math.max(initialFontSize * scale, 8);

    const newPosition = { ...position };

    // Handle opposite corner as fixed point
    if (direction.includes("n")) {
      newPosition.y = position.y + (startHeight - newHeight);
    }
    if (direction.includes("w")) {
      newPosition.x = position.x + (startWidth - newWidth);
    }

    updateElement(id, {
      position: newPosition,
      styles: {
        ...styles,
        width: newWidth,
        height: newHeight,
        fontSize: `${newFontSize}px`,
      },
    });
  };

  const resizeSE = useElementResize(onResizeStart, (delta) =>
    onResize(delta, "se")
  );
  const resizeSW = useElementResize(onResizeStart, (delta) =>
    onResize(delta, "sw")
  );
  const resizeNE = useElementResize(onResizeStart, (delta) =>
    onResize(delta, "ne")
  );
  const resizeNW = useElementResize(onResizeStart, (delta) =>
    onResize(delta, "nw")
  );

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
              width: "100%",
              height: "100%",
              ...styles,
              transform: "rotate(0deg)",
            }}
            onChange={(newText) =>
              updateElement(id, { props: { ...props, text: newText } })
            }
          />

          {isSelected && (
            <>
              {/* Resize Handle */}
              {/* Bottom Right (SE) */}
              <div
                onMouseDown={resizeSE.handleMouseDown}
                className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize bg-white rounded-full flex items-center justify-center border border-gray-300 shadow"
              >
                <MoveDiagonal size={14} />
              </div>

              {/* Bottom Left (SW) */}
              <div
                onMouseDown={resizeSW.handleMouseDown}
                className="absolute bottom-0 left-0 w-5 h-5 cursor-sw-resize bg-white rounded-full flex items-center justify-center border border-gray-300 shadow"
              >
                <MoveDiagonal size={14} />
              </div>

              {/* Top Right (NE) */}
              <div
                onMouseDown={resizeNE.handleMouseDown}
                className="absolute top-0 right-0 w-5 h-5 cursor-ne-resize bg-white rounded-full flex items-center justify-center border border-gray-300 shadow"
              >
                <MoveDiagonal size={14} />
              </div>

              {/* Top Left (NW) */}
              <div
                onMouseDown={resizeNW.handleMouseDown}
                className="absolute top-0 left-0 w-5 h-5 cursor-nw-resize bg-white rounded-full flex items-center justify-center border border-gray-300 shadow"
              >
                <MoveDiagonal size={14} />
              </div>

              {/* Rotate Handle */}
              <div
                onMouseDown={(e) => handleRotateMouseDown(e, elementRef)}
                className="absolute top-0 left-1/2 w-5 h-5 cursor-crosshair bg-white rounded-full flex items-center justify-center border border-gray-300 shadow -translate-x-1/2 -translate-y-1/2"
              >
                <RotateCcw size={14} />
              </div>
            </>
          )}
        </div>
      )}
    </Rnd>
  );
};

export default CanvasElement;
