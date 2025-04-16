import { useCallback, useRef } from "react";

export function useElementResize(onResizeStart, onResize, direction = "se") {
  const resizingRef = useRef(false);

  const handleMouseDown = useCallback((e) => {
    e.stopPropagation();
    resizingRef.current = true;

    const startX = e.clientX;
    const startY = e.clientY;

    onResizeStart();

    const onMouseMove = (moveEvent) => {
      if (!resizingRef.current) return;

      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      onResize({ deltaX, deltaY }, direction); // send direction
    };

    const onMouseUp = () => {
      resizingRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [onResizeStart, onResize, direction]);

  return { handleMouseDown };
}
