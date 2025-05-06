import { useState, useRef, useEffect } from "react";

const EditableTextElement = ({ text, styles = {}, onChange }) => {
  const [currentText, setCurrentText] = useState(text || "");
  const [isEditing, setIsEditing] = useState(false);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const inputRef = useRef(null);
  const textRef = useRef(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);
  
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
        case 'middle':
          offset = Math.max(0, (containerHeight - textHeight) / 2);
          break;
        case 'bottom':
          offset = Math.max(0, containerHeight - textHeight);
          break;
        case 'top':
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

    // Get the click position relative to the textarea
    const rect = textarea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate the approximate character position
    const style = window.getComputedStyle(textarea);
    const lineHeight = parseInt(style.lineHeight) || parseInt(style.fontSize) * 1.2;
    const charWidth = parseInt(style.fontSize) * 0.6;
    const line = Math.floor(y / lineHeight);
    const char = Math.floor(x / charWidth);

    // Get the current text and selection
    const text = textarea.value;
    const lines = text.split('\n');
    let position = 0;

    // Calculate the actual position in the text
    for (let i = 0; i < line && i < lines.length; i++) {
      position += lines[i].length + 1;
    }
    position = Math.min(position + char, text.length);

    clickCountRef.current++;
    
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    
    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current === 1) {
        // Single click - place cursor at click position
        textarea.focus();
        textarea.setSelectionRange(position, position);
        setIsEditing(true);
      } else if (clickCountRef.current === 2) {
        // Double click - select word
        const { start, end } = getWordBoundaries(text, position);
        textarea.focus();
        textarea.setSelectionRange(start, end);
        setIsEditing(true);
      } else if (clickCountRef.current === 3) {
        // Triple click - select entire text
        textarea.focus();
        textarea.setSelectionRange(0, text.length);
        setIsEditing(true);
      }
      
      clickCountRef.current = 0;
    }, 200);
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

  return (
    <div 
      className="text-container"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        overflow: "hidden",
        position: "relative"
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
          background: "transparent",
          border: "none",
          outline: "none",
          resize: "none",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontFamily: styles.fontFamily || "inherit",
          fontSize: styles.fontSize || "inherit",
          lineHeight: styles.lineHeight || "normal",
          padding: styles.padding || "0",
          margin: styles.margin || "0",
          position: "absolute",
          top: verticalOffset,
          left: 0,
          right: 0
        }}
      />
      <div
        ref={textRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontFamily: styles.fontFamily || "inherit",
          fontSize: styles.fontSize || "inherit",
          lineHeight: styles.lineHeight || "normal",
          padding: styles.padding || "0",
          margin: styles.margin || "0",
          width: "100%"
        }}
      >
        {currentText}
      </div>
    </div>
  );
};

export default EditableTextElement;