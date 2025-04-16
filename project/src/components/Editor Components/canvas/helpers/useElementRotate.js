import { useCallback, useRef } from "react";

export function useElementRotate(onRotate) {
  const rotatingRef = useRef(false);

  const handleRotateMouseDown = useCallback((e, elementRef) => {
    e.stopPropagation();
    rotatingRef.current = true;

    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const onMouseMove = (moveEvent) => {
      if (!rotatingRef.current) return;

      const dx = moveEvent.clientX - centerX;
      const dy = moveEvent.clientY - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      onRotate(angle);
    };

    const onMouseUp = () => {
      rotatingRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [onRotate]);

  return { handleRotateMouseDown };
}
