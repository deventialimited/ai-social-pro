import { v4 as uuidv4 } from "uuid";

export const createTextElement = (category = "body") => {
  const defaultStyles = {
    color: "#000000",
    fontSize: "24px",
    fontWeight: "normal",
  };

  // Custom styles per category
  if (category === "header") {
    defaultStyles.fontSize = "36px";
    defaultStyles.fontWeight = "bold";
    defaultStyles.width = 210;
    defaultStyles.height = 60;
  } else if (category === "sub-header") {
    defaultStyles.fontSize = "28px";
    defaultStyles.fontWeight = "600";
    defaultStyles.width = 160;
    defaultStyles.height = 50;
  } else if (category === "body") {
    defaultStyles.fontSize = "20px";
    defaultStyles.fontWeight = "normal";
    defaultStyles.width = 95;
    defaultStyles.height = 40;
  } else if (category === "slogan") {
    defaultStyles.fontSize = "20px";
    defaultStyles.fontWeight = "normal";
    defaultStyles.width = 200;
    defaultStyles.height = 40;
  } else if (category === "brandName") {
    defaultStyles.fontSize = "20px";
    defaultStyles.fontWeight = "normal";
    defaultStyles.width = 200;
    defaultStyles.height = 40;
  }

  return {
    id: `text-${uuidv4()}`,
    type: "text",
    category,
    position: { x: 100, y: 100 },
    styles: defaultStyles,
    effects: {
      blur: { enabled: false, value: 3 },
      textStroke: { enabled: false, value: 2, color: "#808080" },
      background: {
        enabled: false,
        cornerRadius: 0,
        padding: 0,
        opacity: 100,
        color: "#FFFFFF",
      },
      shadow: {
        enabled: false,
        blur: 0,
        offsetX: 0,
        offsetY: 0,
        opacity: 100,
        color: "#000000",
      },
    },
    props: {
      text:
        category === "header"
          ? "Header Text"
          : category === "sub-header"
          ? "Sub Header Text"
          : category === "slogan"
          ? "Your Slogan Here"
          : category === "brandName"
          ? "Your Business Name Here"
          : "Body Text",
    },
  };
};

export function parseTextShadow(textShadow) {
  if (!textShadow) return null;
  const regex =
    /(-?\d+\.?\d*)px\s+(-?\d+\.?\d*)px\s+(-?\d+\.?\d*)px\s+rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d+)\s*\)/;

  const match = textShadow?.match(regex);

  if (!match) {
    // Return default values if parsing fails
    return {
      offsetX: 0,
      offsetY: 0,
      blur: 0,
      color: "#000000",
      opacity: 100,
    };
  }

  const [, offsetX, offsetY, blur, r, g, b, opacity] = match;

  // Helper to convert RGB to hex
  const rgbToHex = (r, g, b) =>
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("");

  return {
    offsetX: parseFloat(offsetX),
    offsetY: parseFloat(offsetY),
    blur: parseFloat(blur),
    color: rgbToHex(r, g, b),
    opacity: Math.round(parseFloat(opacity) * 100),
  };
}
