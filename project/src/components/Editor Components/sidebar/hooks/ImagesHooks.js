import { v4 as uuidv4 } from "uuid";

export const createImageElement = (src, category) => {
  return {
    id: `image-${uuidv4()}`,
    type: "image",
    category,
    position: { x: 100, y: 100 },
    styles: {
      width: 200,
      height: 200,
    },
    effects: {
      blur: { enabled: false, value: 10 },
      brightness: { enabled: false, value: 100 },
      sepia: { enabled: false, value: 0 },
      grayscale: { enabled: false, value: 0 },
      border: { enabled: false, value: 2, color: "#000000" },
      cornerRadius: { enabled: false, value: 150 },
      shadow: {
        enabled: false,
        blur: 5,
        offsetX: 0,
        offsetY: 0,
        opacity: 100,
        color: "#000000",
      },
    },
    props: {
      src,
      previewUrl: src,
    },
  };
};
