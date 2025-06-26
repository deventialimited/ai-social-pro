import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";

const EditorContext = createContext(null);

export const EditorProvider = ({ children }) => {
  // ===================== 🌟 Design Data States =====================
  const [isCanvasLoading, setCanvasLoading] = useState(false);
  const [postOtherValues, setPostOtherValues] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [canvas, setCanvas] = useState({
    width: 1080,
    height: 1080,
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
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
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
  const getEditorSnapshot = useCallback(
    () => ({
      canvas,
      backgrounds,
      elements,
      layers,
      allFiles,
    }),
    [canvas, backgrounds, elements, layers, allFiles]
  );

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

    isPerformingUndoRedo.current = true;

    setCanvas(previous.canvas);
    setBackgrounds(previous.backgrounds);
    setElements(previous.elements);
    setLayers(previous.layers);
    setAllFiles(previous.allFiles);
    lastSnapshot.current = previous;

    setTimeout(() => {
      isPerformingUndoRedo.current = false;
    }, 0);

    setCanUndo(newPast.length > 0);
    setCanRedo(true);
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

    isPerformingUndoRedo.current = true;

    setCanvas(next.canvas);
    setBackgrounds(next.backgrounds);
    setElements(next.elements);
    setLayers(next.layers);
    setAllFiles(next.allFiles);
    lastSnapshot.current = next;

    setTimeout(() => {
      isPerformingUndoRedo.current = false;
    }, 0);

    setCanUndo(true);
    setCanRedo(newFuture.length > 0);
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
      return newState;
    });
  }, []);

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
      return newState;
    });
  }, []);

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
  }, []);

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
      return newElements;
    });
  }, []);

  const updateElement = useCallback((id, newProps) => {
    setElements((prevElements) => {
      return prevElements.map((el) => {
        if (el.id !== id) return el;

        const mergedElement = { ...el }; // Shallow clone

        for (const key in newProps) {
          const newVal = newProps[key];
          const oldVal = el[key];

          // If value is an object (deep merge), not primitive
          if (
            typeof newVal === "object" &&
            newVal !== null &&
            !Array.isArray(newVal)
          ) {
            mergedElement[key] = {
              ...(oldVal || {}),
              ...newVal,
            };
          } else {
            // Direct replace for primitives
            mergedElement[key] = newVal;
          }
        }

        return mergedElement;
      });
    });
  }, []);

  const removeElement = useCallback((id) => {
    setElements((prev) => {
      const newElements = prev.filter((el) => el.id !== id);
      setLayers((prevLayers) =>
        prevLayers.filter((layer) => layer.elementId !== id)
      );
      return newElements;
    });
  }, []);

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
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.id !== id) return layer;

        const mergedLayer = { ...layer };

        for (const key in newProps) {
          const newVal = newProps[key];
          const oldVal = layer[key];

          if (
            typeof newVal === "object" &&
            newVal !== null &&
            !Array.isArray(newVal)
          ) {
            mergedLayer[key] = {
              ...(oldVal || {}),
              ...newVal,
            };
          } else {
            mergedLayer[key] = newVal;
          }
        }

        return mergedLayer;
      })
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

  const lastSnapshot = useRef(null);
  const isPerformingUndoRedo = useRef(false);

  useEffect(() => {
    if (isPerformingUndoRedo.current) return;

    const currentSnapshot = getEditorSnapshot();
    const hasChanged =
      JSON.stringify(currentSnapshot) !== JSON.stringify(lastSnapshot.current);

    if (hasChanged) {
      historyRef.current = {
        past: [...historyRef.current.past, historyRef.current.present],
        present: currentSnapshot,
        future: [],
      };
      lastSnapshot.current = currentSnapshot;
      setCanUndo(true);
      setCanRedo(false);
    }
  }, [canvas, backgrounds, elements, layers, allFiles, getEditorSnapshot]);

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
    setSelectedTemplateId,
    selectedTemplateId,
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
    canUndo,
    canRedo,
    historyRef,
  };

  return (
    <EditorContext.Provider value={store}>{children}</EditorContext.Provider>
  );
};

// ✅ Hook for usage
export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    console.trace("EditorContext is null!");
    throw new Error("❌ useEditor must be used within <EditorProvider>");
  }
  return context;
};
