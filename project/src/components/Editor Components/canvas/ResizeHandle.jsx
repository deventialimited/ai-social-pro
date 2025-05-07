import { useRef } from "react";
import { getCursor, useElementResize } from "./helpers/useElementResize";

export const ResizeHandle = ({
  position,
  className,
  onResizeStart,
  onResize,
}) => {
  const resize = useElementResize(onResizeStart, (delta) =>
    onResize(delta, position)
  );

  const handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    resize.handleMouseDown(e);
  };

  return (
    <div
      className={`absolute z-10 w-2 h-2 rounded-sm bg-white border border-blue-500 cursor-${getCursor(
        position
      )} ${className}`}
      onMouseDown={handleMouseDown}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        touchAction: "none",
      }}
    />
  );
};
