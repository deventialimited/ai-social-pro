import { useState, useRef, useEffect } from "react";

const EditableTextElement = ({ text, styles = {}, onChange }) => {
  const [currentText, setCurrentText] = useState(text || "");
  const inputRef = useRef(null);

  const handleBlur = () => {
    onChange?.(currentText);
  };
  console.log(styles);
  return (
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
      }}
    />
  );
};

export default EditableTextElement;
