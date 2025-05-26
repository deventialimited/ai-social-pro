import { createContext, useContext, useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

const EditorContext = createContext(null);

export const EditorProvider = ({ children }) => {
  // ===================== 🌟 Design Data States =====================
  const [isCanvasLoading, setCanvasLoading] = useState(false);
  const [postOtherValues, setPostOtherValues] = useState(null);
  const [canvas, setCanvas] = useState({
    width: 1080,
    height: 1080,
    ratio: "1.91:1",
    styles: {
      boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      // You can extend with other canvas-level styles here
    },
  });

  const [backgrounds, setBackgrounds] = useState(null);

  const [elements, setElements] = useState([]);

  const [layers, setLayers] = useState([]); // Can be used for z-index or ordering

  // ===================== 📦 All Asset Files =====================
  const [allFiles, setAllFiles] = useState([]); // [File, File, ...]

  // ===================== 🔄 Undo/Redo History =====================
  const historyRef = useRef({
    past: [],
    present: {
      canvas,
      backgrounds,
      elements,
      layers,
      allFiles,
    },
    future: [],
  });

  const pushToHistory = useCallback((newState) => {
    historyRef.current = {
      past: [...historyRef.current.past, historyRef.current.present],
      present: newState,
      future: [],
    };
  }, []);

  const undo = useCallback(() => {
    const { past, present, future } = historyRef.current;
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    historyRef.current = {
      past: newPast,
      present: previous,
      future: [present, ...future],
    };

    // Update all states
    setCanvas(previous.canvas);
    setBackgrounds(previous.backgrounds);
    setElements(previous.elements);
    setLayers(previous.layers);
    setAllFiles(previous.allFiles);
  }, []);

  const redo = useCallback(() => {
    const { past, present, future } = historyRef.current;
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    historyRef.current = {
      past: [...past, present],
      present: next,
      future: newFuture,
    };

    // Update all states
    setCanvas(next.canvas);
    setBackgrounds(next.backgrounds);
    setElements(next.elements);
    setLayers(next.layers);
    setAllFiles(next.allFiles);
  }, []);

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
    setCanvas((prev) => {
      const newState = {
        ...prev,
        width,
        height,
      };
      pushToHistory({
        ...historyRef.current.present,
        canvas: newState,
      });
      return newState;
    });
  }, [pushToHistory]);

  const updateCanvasStyles = useCallback((styles) => {
    console.log(styles);

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

      const newState = {
        ...prev,
        styles: {
          ...updatedStyles,
          ...styles,
        },
      };
      pushToHistory({
        ...historyRef.current.present,
        canvas: newState,
      });
      return newState;
    });
  }, [pushToHistory]);

  const updateBackground = useCallback((type, value) => {
    console.log(type, value);
    const bg = { type };

    if (type === "color") {
      bg.color = value;
      bg.src = "";
      bg.gradient = null;
    } else if (type === "image" || type === "video") {
      bg.src = value;
      bg.color = "";
      bg.gradient = null;
    } else if (type === "gradient") {
      bg.gradient = value;
      bg.color = "";
      bg.src = "";
      // You can handle CSS gradient parsing or styling in rendering components
    }

    setBackgrounds(bg);
    pushToHistory({
      ...historyRef.current.present,
      backgrounds: bg,
    });
  }, [pushToHistory]);

  const addElement = useCallback((element) => {
    setElements((prev) => {
      const newElement = {
        ...element,
        styles: {
          ...element.styles,
          zIndex: prev.length + 1, // Ensure that the new element gets the highest z-index
        },
        visible: true,
        locked: false,
      };
      // ✅ Add corresponding layer
      setLayers((prevLayers) => [
        ...prevLayers,
        {
          id: `layer-${uuidv4()}`,
          type: element.type,
          elementId: element.id,
          visible: true,
          locked: false,
        },
      ]);
      const newElements = [...prev, newElement];
      pushToHistory({
        ...historyRef.current.present,
        elements: newElements,
      });
      return newElements;
    });
  }, [pushToHistory]);

  const updateElement = useCallback((id, newProps) => {
    setElements((prev) => {
      const newElements = prev.map((el) => (el.id === id ? { ...el, ...newProps } : el));
      pushToHistory({
        ...historyRef.current.present,
        elements: newElements,
      });
      return newElements;
    });
  }, [pushToHistory]);

  const removeElement = useCallback((id) => {
    setElements((prev) => {
      const newElements = prev.filter((el) => el.id !== id);
      setLayers((prevLayers) =>
        prevLayers.filter((layer) => layer.elementId !== id)
      );
      pushToHistory({
        ...historyRef.current.present,
        elements: newElements,
      });
      return newElements;
    });
  }, [pushToHistory]);

  const addFile = useCallback((file) => {
    setAllFiles((prev) => [...prev, file]);
  }, []);

  const removeFileByName = useCallback((fileName) => {
    setAllFiles((prev) => prev.filter((file) => file.name !== fileName));
  }, []);

  const updateFile = useCallback((fileName, updatedFile) => {
    setAllFiles((prev) => {
      // Find the index of the file to be updated
      const fileIndex = prev.findIndex((file) => file.name === fileName);

      if (fileIndex === -1) {
        // If file doesn't exist, return the current state
        console.log("File not found for update:", fileName);
        return prev;
      }

      // Update the file by replacing it with the new one
      const updatedFiles = [...prev];
      updatedFiles[fileIndex] = updatedFile;

      return updatedFiles;
    });
  }, []);

  const updateLayer = useCallback((id, newProps) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id
          ? {
              ...layer,
              ...newProps,
            }
          : layer
      )
    );
  }, []);

  // Handle Lock functionality for both elements and layers
  const handleLock = useCallback(
    (selectedElementId) => {
      const selectedElement = elements.find(
        (el) => el.id === selectedElementId
      );

      if (selectedElement) {
        const newLockedState = !selectedElement.locked;

        updateElement(selectedElement.id, {
          styles: { ...selectedElement.styles },
          locked: newLockedState,
        });

        const correspondingLayer = layers.find(
          (layer) => layer.elementId === selectedElementId
        );

        if (correspondingLayer) {
          updateLayer(correspondingLayer.id, {
            locked: newLockedState,
          });
        }
      }
    },
    [elements, layers, updateElement, updateLayer]
  );

  // Handle Visible functionality for both elements and layers
  const handleVisible = useCallback(
    (selectedElementId) => {
      const selectedElement = elements.find(
        (el) => el.id === selectedElementId
      );

      if (selectedElement) {
        const newVisibleState = !selectedElement.visible;

        updateElement(selectedElement.id, {
          styles: { ...selectedElement.styles },
          visible: newVisibleState,
        });

        const correspondingLayer = layers.find(
          (layer) => layer.elementId === selectedElementId
        );

        if (correspondingLayer) {
          updateLayer(correspondingLayer.id, {
            visible: newVisibleState,
          });
        }
      }
    },
    [elements, layers, updateElement, updateLayer]
  );

  const clearEditor = useCallback(() => {
    setCanvas({
      width: 1080,
      height: 1080,
      ratio: "1.91:1",
      styles: {
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        // You can extend with other canvas-level styles here
      },
    });
    setBackgrounds(null);
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
    isCanvasLoading,
    setCanvasLoading,
    postOtherValues,
    setPostOtherValues,
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
    updateFile,
    updateLayer,
    handleLock,
    handleVisible,
    clearEditor,
    // Undo/Redo
    undo,
    redo,
  };

  return (
    <EditorContext.Provider value={store}>{children}</EditorContext.Provider>
  );
};

// ✅ Hook for usage
export const useEditor = () => useContext(EditorContext);
