import { v4 as uuidv4 } from "uuid";

export const createImageElement = (src) => {
  return {
    id: `image-${uuidv4()}`,
    type: "image",
    position: { x: 100, y: 100 },
    styles: {
      width: 200,
      height: 200,
    },
    props: {
      src,
      previewUrl: src,
    },
  };
};
