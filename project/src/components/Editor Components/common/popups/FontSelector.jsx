import { useState, useRef, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import WebFont from "webfontloader";
import axios from "axios";

function FontSelector({ font = "Poppins", onChange, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [fonts, setFonts] = useState([]);
  const [selectedFont, setSelectedFont] = useState(null);

  const selectorRef = useRef(null);
  const API_KEY = "AIzaSyC26vJC8yUlX5URokX7mZPvJW7Sg-wom-g"; // Replace with your real API key

  // Fetch fonts once
  useEffect(() => {
    axios
      .get(`https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`)
      .then((res) => {
        const fontList = res.data.items;
        setFonts(fontList);

        // Determine initial font selection
        let initialFont =
          fontList.find((f) => f.family === font) ||
          fontList.find((f) => f.family === "Poppins") ||
          fontList[0];

        setSelectedFont(initialFont);

        // Load initial font
        WebFont.load({
          google: { families: [initialFont.family] },
        });
      })
      .catch((err) => console.error("Error fetching fonts:", err));
  }, [font]);

  // Filter fonts client-side
  const filteredFonts = searchQuery
    ? fonts.filter((f) =>
        f.family.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : fonts;
  useEffect(() => {
    const familiesToLoad = filteredFonts.slice(0, 30).map((f) => f.family); // Limit to top 30 visible fonts
    if (familiesToLoad.length > 0) {
      WebFont.load({
        google: { families: familiesToLoad },
      });
    }
  }, [filteredFonts]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleFontSelect = useCallback(
    (fontObj) => {
      setSelectedFont(fontObj);
      onClose?.();
      onChange?.(fontObj.family);

      WebFont.load({
        google: { families: [fontObj.family] },
      });
    },
    [onChange, onClose]
  );

  return (
    <div className="relative" ref={selectorRef}>
      <div className="absolute z-50 mt-1 md:w-64 w-44 bg-white rounded-md shadow-lg border">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search fonts..."
              className="w-full pl-8 pr-3 py-2 border rounded-md text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredFonts.map((font) => (
            <button
              key={font.family}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                selectedFont?.family === font.family ? "bg-purple-50" : ""
              }`}
              onClick={() => handleFontSelect(font)}
              style={{ fontFamily: font.family }}
            >
              {font.family}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FontSelector;
