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
  } else if (category === "sub-header") {
    defaultStyles.fontSize = "28px";
    defaultStyles.fontWeight = "600";
  } else if (category === "body") {
    defaultStyles.fontSize = "20px";
    defaultStyles.fontWeight = "normal";
  }

  return {
    id: `text-${uuidv4()}`,
    type: "text",
    category,
    position: { x: 100, y: 100 },
    size: { width: 300, height: 100 },
    styles: defaultStyles,
    props: {
      text: category === "header" ? "Header Text" : category === "sub-header" ? "Sub Header Text" : "Body Text"
    }
  };
};
