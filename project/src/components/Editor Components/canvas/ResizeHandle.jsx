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
  return (
    <div
      className={`absolute z-10 w-2 h-2 rounded-sm bg-white border border-blue-500 cursor-${getCursor(
        position
      )} ${className}`}
      onMouseDown={resize.handleMouseDown}
    />
  );
};
