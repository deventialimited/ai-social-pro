import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";

function BackgroundTab() {
  const [colors, setColors] = useState([]);
  const [gradients, setGradients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingColors, setIsLoadingColors] = useState(true);
  const [isLoadingGradients, setIsLoadingGradients] = useState(true);
  const [error, setError] = useState(null);
  const { postOtherValues } = useEditor();

  const { updateCanvasStyles, updateBackground } = useEditor();

  const [gradientsToShow, setGradientsToShow] = useState(12); // Show 12 gradients initially
  const bottomRef = useRef(null);

  // Helper to normalize color response
  const normalizeColors = (data) =>
    data.colors.map((color, index) => ({
      id: index,
      hex: color.hex?.value || "#000000",
      name: color.name?.value || "Unknown",
      rgb: {
        r: color.rgb?.r ?? 0,
        g: color.rgb?.g ?? 0,
        b: color.rgb?.b ?? 0,
      },
    }));

  // Fetch default color palette
  useEffect(() => {
    const fetchColors = async () => {
      setIsLoadingColors(true);
      try {
        const response = await fetch(
          "https://www.thecolorapi.com/scheme?hex=ff6347&mode=analogic&count=20"
        );
        if (!response.ok) throw new Error("Failed to fetch colors");

        const data = await response.json();
        setColors(normalizeColors(data));
      } catch (err) {
        console.error("Color API error:", err);
        setError("Failed to load colors. Using fallback colors.");
        setColors([
          { id: 1, hex: "#87CEEB", name: "Sky Blue" },
          { id: 2, hex: "#FFFFFF", name: "White" },
          { id: 3, hex: "#4169E1", name: "Royal Blue" },
          { id: 4, hex: "#FFA500", name: "Orange" },
          { id: 5, hex: "#90EE90", name: "Light Green" },
          { id: 6, hex: "#FFD700", name: "Gold" },
          { id: 7, hex: "#DA70D6", name: "Orchid" },
          { id: 8, hex: "#DCDCDC", name: "Gainsboro" },
          { id: 9, hex: "#FF6347", name: "Tomato" },
          { id: 10, hex: "#7B68EE", name: "Medium Slate Blue" },
        ]);
      } finally {
        setIsLoadingColors(false);
      }
    };

    fetchColors();
  }, []);

  // Fetch gradients
  useEffect(() => {
    const fetchGradients = async () => {
      setIsLoadingGradients(true);
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/ghosh/uiGradients/master/gradients.json"
        );
        if (!response.ok) throw new Error("Failed to fetch gradients");

        const data = await response.json();
        const gradientList = data.map((gradient) => ({
          id: gradient.name.toLowerCase().replace(/\s+/g, "-"),
          name: gradient.name,
          colors: gradient.colors,
          css: `linear-gradient(to bottom right, ${gradient.colors.join(
            ", "
          )})`,
        }));
        const brandGradient = {
          id: "brand-colors",
          name: "Use Brand Background Color",
          colors: postOtherValues.siteColors,
          css: `linear-gradient(to bottom right, ${postOtherValues.siteColors.join(
            ", "
          )})`,
        };
        gradientList.unshift(brandGradient);

        setGradients(gradientList);
      } catch (err) {
        console.error("Gradient fetch error:", err);
        setError("Failed to load gradients. Using fallback gradients.");
        setGradients([
          {
            id: "purple-pink-blue",
            name: "Purple Pink Blue",
            css: "linear-gradient(to bottom right, #ec4899, #8b5cf6, #3b82f6)",
          },
          {
            id: "teal-green-yellow",
            name: "Teal Green Yellow",
            css: "linear-gradient(to bottom right, #5eead4, #86efac, #fde68a)",
          },
        ]);
      } finally {
        setIsLoadingGradients(false);
      }
    };

    fetchGradients();
  }, []);

  // Optional: Search-triggered API fetch for colors (improve later with debounce)
  useEffect(() => {
    const fetchSearchedColors = async () => {
      if (!searchQuery) return;

      setIsLoadingColors(true);
      try {
        const response = await fetch(
          `https://www.thecolorapi.com/scheme?hex=ff6347&mode=analogic&count=20`
        );
        const data = await response.json();
        setColors(normalizeColors(data));
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsLoadingColors(false);
      }
    };

    fetchSearchedColors();
  }, [searchQuery]);

  // Filter logic
  const filteredColors = searchQuery
    ? colors.filter(
        (color) =>
          color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          color.hex.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : colors;

  const filteredGradients = searchQuery
    ? gradients.filter((g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : gradients;

  // Click handlers
  const handleColorClick = (color) => {
    updateCanvasStyles({ backgroundColor: color.hex, backgroundImage: "" });
    updateBackground("color", color.hex);
  };

  const handleGradientClick = (gradient) => {
    updateCanvasStyles({
      backgroundType: gradient.id,
      backgroundImage: gradient.css,
      backgroundColor: "",
    });
    updateBackground("gradient", gradient.css);
  };

  // Infinite scroll for gradients
  useEffect(() => {
    if (isLoadingGradients) return;
    if (searchQuery) return; // Disable infinite scroll when searching
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setGradientsToShow((prev) => {
            // Show 12 more, but not more than available
            if (prev >= filteredGradients.length) return prev;
            return Math.min(prev + 12, filteredGradients.length);
          });
        }
      },
      { threshold: 1 }
    );
    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }
    return () => {
      if (bottomRef.current) observer.unobserve(bottomRef.current);
    };
  }, [isLoadingGradients, filteredGradients.length, searchQuery]);

  // Reset gradientsToShow when gradients or search changes
  useEffect(() => {
    setGradientsToShow(12);
  }, [filteredGradients, searchQuery]);

  return (
    <div className="p-4 h-full overflow-y-auto">
      {/* Search Field */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search colors and gradients..."
          className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-500 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Solid Colors */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Solid Colors</h3>
        {isLoadingColors ? (
          <div className="flex justify-center items-center h-20">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-2 mb-4">
            {filteredColors.slice(0, 32).map((color) => (
              <button
                key={color.id}
                className="w-8 h-8 rounded-md border border-gray-200 hover:opacity-80 transition-opacity"
                style={{ backgroundColor: color.hex || "#ccc" }}
                onClick={() => handleColorClick(color)}
                title={`${color.name} (${color.hex})`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Gradient Backgrounds */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Gradients</h3>
        {isLoadingGradients ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 pb-10 gap-2">
            {filteredGradients.slice(0, gradientsToShow).map((gradient, index) => (
              <div
                key={gradient.id}
                className="relative aspect-video rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundImage: gradient.css }}
                onClick={() => handleGradientClick(gradient)}
                title={gradient.name}
              >
                {gradient.id === "brand-colors" && (
                  <div className="absolute inset-0 right-5 left-5 flex items-center justify-center">
                    <div className="bg-white/70 px-4 py-2 rounded-md text-center text-sm font-semibold text-gray-800">
                      Use Brand Background Color
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Sentinel div for intersection observer */}
            {gradientsToShow < filteredGradients.length && !searchQuery && (
              <div ref={bottomRef} style={{ height: 1 }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BackgroundTab;
