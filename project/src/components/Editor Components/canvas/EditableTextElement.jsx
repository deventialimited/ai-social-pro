import { useState, useRef, useEffect } from "react";

const EditableTextElement = ({ text, styles = {}, onChange }) => {
  const [currentText, setCurrentText] = useState(text || "");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);
  
  useEffect(() => {
    // Update local state if prop changes externally
    if (text !== currentText && !isEditing) {
      setCurrentText(text || "");
    }
  }, [text, isEditing]);

  const handleDoubleClick = (e) => {
    if (inputRef.current) {
      const textarea = inputRef.current;
      const cursorPosition = textarea.selectionStart;
      const text = textarea.value;
      
      // Find the start of the word
      let start = cursorPosition;
      while (start > 0 && !/\s/.test(text[start - 1])) {
        start--;
      }
      
      // Find the end of the word
      let end = cursorPosition;
      while (end < text.length && !/\s/.test(text[end])) {
        end++;
      }
      
      // Set the selection
      textarea.setSelectionRange(start, end);
    }
    setIsEditing(true);
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
        overflow: "hidden"
      }}
    >
      <textarea
        ref={inputRef}
        value={currentText}
        onChange={(e) => setCurrentText(e.target.value)}
        onDoubleClick={handleDoubleClick}
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
          // Ensure text wraps properly
          whiteSpace: "pre-wrap",
          wordBreak: "break-word"
        }}
      />
    </div>
  );
};

export default EditableTextElement;