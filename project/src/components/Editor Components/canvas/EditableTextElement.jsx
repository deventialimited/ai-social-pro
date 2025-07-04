import { useState, useRef, useEffect } from "react";

const EditableTextElement = ({
  selectedElement,
  updateElement,
  text,
  styles = {},
  onChange,
}) => {
  const [currentText, setCurrentText] = useState(text || "");
  const [isEditing, setIsEditing] = useState(false);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const inputRef = useRef(null);
  const textRef = useRef(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);
  const initialFontSize = parseInt(styles?.fontSize) || 16;
  const minFontSize = 0.1;
  const [fontSize, setFontSize] = useState(initialFontSize);

  useEffect(() => {
    // Update local state if prop changes externally
    if (text !== currentText && !isEditing) {
      setCurrentText(text || "");
    }
  }, [text, isEditing]);

  useEffect(() => {
    // Calculate vertical alignment when text or styles change
    if (textRef.current && inputRef.current) {
      const containerHeight = inputRef.current.clientHeight;
      const textHeight = textRef.current.scrollHeight;

      // Calculate vertical offset based on verticalAlign style
      let offset = 0;
      switch (styles.verticalAlign) {
        case "middle":
          offset = Math.max(0, (containerHeight - textHeight) / 2);
          break;
        case "bottom":
          offset = Math.max(0, containerHeight - textHeight);
          break;
        case "top":
        default:
          offset = 0;
          break;
      }

      setVerticalOffset(offset);
    }
  }, [currentText, styles, styles.verticalAlign]);

  const getWordBoundaries = (text, position) => {
    if (!text || position < 0 || position > text.length) {
      return { start: 0, end: 0 };
    }

    let start = position;
    while (start > 0 && !/\s/.test(text[start - 1])) {
      start--;
    }

    let end = position;
    while (end < text.length && !/\s/.test(text[end])) {
      end++;
    }

    return { start, end };
  };

  const handleClick = (e) => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const rect = textarea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const style = window.getComputedStyle(textarea);
    const lineHeight =
      parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
    const charWidth = parseFloat(style.fontSize) * 0.6;

    const line = Math.floor(y / lineHeight);
    const char = Math.floor(x / charWidth);

    const text = textarea.value;
    const lines = text.split("\n");
    let position = 0;
    for (let i = 0; i < line && i < lines.length; i++) {
      position += lines[i].length + 1;
    }
    position = Math.min(position + char, text.length);

    // Use native click count
    const clickCount = e.detail;

    textarea.focus();

    if (clickCount === 1) {
      textarea.setSelectionRange(position, position);
      setIsEditing(true);
    } else if (clickCount === 2) {
      const { start, end } = getWordBoundaries(text, position);
      textarea.setSelectionRange(start, end);
      setIsEditing(true);
    } else if (clickCount >= 3) {
      textarea.setSelectionRange(0, text.length);
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange?.(currentText);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };
  const adjustFontSizeToFit = () => {
    if (!inputRef.current || !textRef.current) return;

    const containerHeight = inputRef.current.clientHeight;
    const containerWidth = inputRef.current.clientWidth;

    // Use current font size from computed style
    const computedFontSize = parseFloat(
      window.getComputedStyle(textRef.current).fontSize
    );
    let size = computedFontSize;

    // Only decrease font size if overflow
    while (
      (textRef.current.scrollHeight > containerHeight ||
        textRef.current.scrollWidth > containerWidth) &&
      size > minFontSize
    ) {
      size--;
      textRef.current.style.fontSize = size + "px";
    }

    if (!selectedElement || selectedElement.locked) return;

    const currentStyleFontSize = parseFloat(
      selectedElement?.styles?.fontSize?.toString().replace("px", "")
    );

    // ✅ Only update if changed
    if (currentStyleFontSize !== size) {
      updateElement(selectedElement.id, {
        styles: {
          ...selectedElement.styles,
          fontSize: `${size}px`,
        },
      });
    }
  };

  useEffect(() => {
    adjustFontSizeToFit();
  }, [currentText, styles]);

  return (
    <div
      className="text-container"
      style={{
        // backgroundColor: styles?.backgroundColor,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <textarea
        ref={inputRef}
        value={currentText}
        onChange={(e) => setCurrentText(e.target.value)}
        onClick={handleClick}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          ...styles,
          // background: "transparent",
          border: "none",
          outline: "none",
          // WebkitTextStroke: "none",
          resize: "none",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight || "normal",
          margin: styles.margin || "0",
          position: "absolute",
          top: verticalOffset,
          left: 0,
          right: 0,
        }}
      />
      <div
        ref={textRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize || "inherit",
          lineHeight: styles.lineHeight || "normal",
          margin: styles.margin || "0",
          width: "100%",
        }}
      >
        {currentText}
      </div>
    </div>
  );
};

export default EditableTextElement;
