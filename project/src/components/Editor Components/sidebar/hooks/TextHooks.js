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
    defaultStyles.width = 400;
    defaultStyles.height = 60;
  } else if (category === "sub-header") {
    defaultStyles.fontSize = "28px";
    defaultStyles.fontWeight = "600";
    defaultStyles.width = 300;
    defaultStyles.height = 50;
  } else if (category === "body") {
    defaultStyles.fontSize = "20px";
    defaultStyles.fontWeight = "normal";
    defaultStyles.width = 250;
    defaultStyles.height = 40;
  }

  return {
    id: `text-${uuidv4()}`,
    type: "text",
    category,
    position: { x: 100, y: 100 },
    styles: defaultStyles,
    props: {
      text:
        category === "header"
          ? "Header Text"
          : category === "sub-header"
          ? "Sub Header Text"
          : "Body Text",
    },
  };
};
