import { useState, useRef, useEffect } from "react";

const EditableTextElement = ({ text, styles = {}, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text || "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange?.(currentText);
  };

  return isEditing ? (
    <input
      ref={inputRef}
      type="text"
      value={currentText}
      onChange={(e) => setCurrentText(e.target.value)}
      onBlur={handleBlur}
      style={{
        ...styles,
        background: "transparent",
        outline: "none",
        width: "100%",
      }}
    />
  ) : (
    <div
      style={styles}
      onDoubleClick={handleDoubleClick}
      className="cursor-text select-none"
    >
      {currentText}
    </div>
  );
};

export default EditableTextElement;
