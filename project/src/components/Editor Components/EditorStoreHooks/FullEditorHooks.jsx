import { createContext, useContext, useState, useCallback } from "react";

const EditorContext = createContext(null);

export const EditorProvider = ({ children }) => {
  // ===================== 🌟 Design Data States =====================
  const [canvas, setCanvas] = useState({
    width: 1200,
    height: 628,
    ratio: "1.91:1",
    styles: {
      boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      // You can extend with other canvas-level styles here
    },
  });

  const [backgrounds, setBackgrounds] = useState({
    type: "image", // "color" | "gradient" | "image" | "video"
    url: "",
    color: "",
    gradient: null,
  });

  const [elements, setElements] = useState([]);

  const [layers, setLayers] = useState([]); // Can be used for z-index or ordering

  // ===================== 📦 All Asset Files =====================
  const [allFiles, setAllFiles] = useState([]); // [File, File, ...]

  // ===================== 🚀 Combined Post Data =====================
  const postDesignData = {
    canvas,
    backgrounds,
    elements,
    layers,
    // You can add postId separately if needed
  };

  // ===================== 🔧 Updaters =====================

  const updateCanvasSize = useCallback((width, height) => {
    console.log(width);
    console.log(height);
    setCanvas((prev) => ({
      ...prev,
      width,
      height,
    }));
  }, []);

  const updateCanvasStyles = useCallback((styles) => {
    setCanvas((prev) => {
      const updatedStyles = { ...prev.styles };

      if ("backgroundImage" in styles) {
        // Remove backgroundColor if setting backgroundImage
        delete updatedStyles.backgroundColor;

        // You can manually add default image styling here
        updatedStyles.backgroundSize = "cover"; // Or "contain"
        updatedStyles.backgroundRepeat = "no-repeat";
        updatedStyles.backgroundPosition = "center center";
      }

      if ("backgroundColor" in styles) {
        // Remove backgroundImage-related styles if setting backgroundColor
        delete updatedStyles.backgroundImage;
        delete updatedStyles.backgroundSize;
        delete updatedStyles.backgroundRepeat;
        delete updatedStyles.backgroundPosition;
      }

      return {
        ...prev,
        styles: {
          ...updatedStyles,
          ...styles,
        },
      };
    });
  }, []);

  const updateBackground = useCallback((type, value) => {
    const bg = { type };

    if (type === "color") {
      bg.color = value;
      bg.url = "";
      bg.gradient = null;
    } else if (type === "image" || type === "video") {
      bg.url = value;
      bg.color = "";
      bg.gradient = null;
    } else if (type === "gradient") {
      bg.gradient = value;
      bg.color = "";
      bg.url = "";
      // You can handle CSS gradient parsing or styling in rendering components
    }

    setBackgrounds(bg);
  }, []);

  const addElement = useCallback((element) => {
    setElements((prev) => [...prev, element]);
  }, []);

  const updateElement = useCallback((id, newProps) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...newProps } : el))
    );
  }, []);

  const removeElement = useCallback((id) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
  }, []);

  const addFile = useCallback((file) => {
    setAllFiles((prev) => [...prev, file]);
  }, []);

  const removeFileByName = useCallback((fileName) => {
    setAllFiles((prev) => prev.filter((file) => file.name !== fileName));
  }, []);

  const clearEditor = useCallback(() => {
    setCanvas({
      width: 1200,
      height: 628,
      ratio: "1.91:1",
      styles: {
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      },
    });
    setBackgrounds({
      type: "image",
      url: "",
      color: "",
      gradient: null,
    });
    setElements([]);
    setLayers([]);
    setAllFiles([]);
  }, []);

  const store = {
    // Design Data
    canvas,
    setCanvas,
    backgrounds,
    setBackgrounds,
    elements,
    setElements,
    layers,
    setLayers,

    // Files
    allFiles,
    setAllFiles,

    // Composite
    postDesignData,

    // Actions
    updateCanvasSize,
    updateCanvasStyles,
    updateBackground,
    addElement,
    updateElement,
    removeElement,
    addFile,
    removeFileByName,
    clearEditor,
  };

  return (
    <EditorContext.Provider value={store}>{children}</EditorContext.Provider>
  );
};

// ✅ Hook for usage
export const useEditor = () => useContext(EditorContext);
