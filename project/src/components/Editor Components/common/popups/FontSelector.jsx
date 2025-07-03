import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import WebFont from "webfontloader";
import axios from "axios";
function FontSelector({ font = "Poppins", onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fonts, setFonts] = useState([]);
  const [selectedFont, setSelectedFont] = useState("");

  const selectorRef = useRef(null);
  const API_KEY = "AIzaSyC26vJC8yUlX5URokX7mZPvJW7Sg-wom-g";

  useEffect(() => {
    // const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    const googleFontsApiUrl = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`;

    axios
      .get(googleFontsApiUrl)
      .then((response) => {
        const fontList = response.data.items.map((item) => item.family);
        console.log(fontList);
        setFonts(fontList);

        const defaultFont = fontList.includes("Roboto")
          ? "Roboto"
          : fontList[0];
        setSelectedFont(defaultFont);

        // Dynamically load the selected font through a proxied @import
        const link = document.createElement("link");
        link.rel = "stylesheet";
        // Use Google Fonts CSS through the proxy:
        link.href = `https://fonts.googleapis.com/css2?family=${defaultFont.replace(
          / /g,
          "+"
        )}&display=swap`;
        document.head.appendChild(link);
      })
      .catch((error) => {
        console.error("Error fetching fonts:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedFont) {
      WebFont.load({
        google: {
          families: [selectedFont],
        },
      });
    }
  }, [selectedFont]);

  const filteredFonts = searchQuery
    ? fonts.filter((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
    : fonts;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFontSelect = (font) => {
    setSelectedFont(font);
    setIsOpen(false);
    if (onChange) {
      onChange(font);
    }
  };

  return (
    <div className=" relative " ref={selectorRef}>
      {/* <button
        className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border min-w-[150px] justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="w-max">{selectedFont}</span>
        <ChevronDown className="h-4 w-4" />
      </button> */}

      {/* {isOpen && ( */}
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
              key={font}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                selectedFont === font ? "bg-purple-50" : ""
              }`}
              onClick={() => handleFontSelect(font)}
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>
      {/* )} */}
    </div>
  );
}

export default FontSelector;
