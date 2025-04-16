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
  const { handleMouseDown } = useElementResize(({ deltaX, deltaY }) => {
    const newWidth = (styles.width || 100) + deltaX;
    const newHeight = (styles.height || 30) + deltaY;
    const rawFontSize = styles.fontSize ?? "16px";
    const initialFontSize = parseFloat(rawFontSize); // Convert '36px' → 36

    const scale = Math.min(
      newWidth / (styles.width || 100),
      newHeight / (styles.height || 30)
    );
    const newFontSize = Math.max(initialFontSize * scale, 8);

    updateElement(id, {
      styles: {
        ...styles,
        width: newWidth,
        height: newHeight,
        fontSize: `${newFontSize}px`, // Ensure we save as string again
      },
    });
  });
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
              <div
                onMouseDown={handleMouseDown}
                className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize bg-white rounded-full flex items-center justify-center border border-gray-300 shadow"
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
