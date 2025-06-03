// Convert camelCase to kebab-case CSS property names
function camelToKebab(str) {
  return str.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

// Convert possibly nested MongoDB-style values like {$numberInt: "200"} or normal strings/numbers
function parseValue(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") {
    if ("$numberInt" in val) return val.$numberInt;
    if ("$numberDouble" in val) return val.$numberDouble;
    if ("$numberLong" in val) return val.$numberLong;
    if ("$date" in val) return val.$date;
    return ""; // fallback for unknown objects
  }
  return val;
}

// Convert styles object to CSS string
function convertStylesToString(styles) {
  if (!styles) return "";
  return Object.entries(styles)
    .map(([key, value]) => {
      // Handle nested number objects, and convert key to kebab-case
      const cssValue = parseValue(value);
      // Handle special cases
      if (key === "boxShadow" && cssValue && typeof cssValue === "string") {
        // boxShadow is usually a string already
        return `box-shadow: ${cssValue}`;
      }
      if (key === "cornerRadius") {
        // map to border-radius
        return `border-radius: ${cssValue}px`;
      }
      if (key === "fontSize" && cssValue && !isNaN(cssValue)) {
        return `font-size: ${cssValue}px`;
      }
      if (key === "zIndex") {
        return `z-index: ${cssValue}`;
      }
      // For position static/relative etc, just output as is
      if (typeof cssValue === "string" || typeof cssValue === "number") {
        return `${camelToKebab(key)}: ${cssValue}`;
      }
      return "";
    })
    .filter(Boolean)
    .join("; ");
}

exports.generateHTMLFromTemplateData = (templateData) => {
  const { canvas, elements } = templateData;

  const backgroundColor = canvas?.styles?.backgroundColor || "transparent";
  const width = `${Math.max(Math.min(canvas.width / 3, 600))}px`;
  const height = `${Math.max(Math.min(canvas.height / 3, 600))}px`;
  return `
      <html>
      <body style="margin:0; padding:0; background:${backgroundColor}; width:${width}px; height:${height}px; position:relative;">
        ${elements
          .map((el) => {
            if (el.type === "text") {
              const styleString = convertStylesToString(el.styles || {});

              const top = parseInt(el.position?.y) || 0;
              const left = parseInt(el.position?.x) || 0;

              return `<div style="
                position:absolute;
                top:${top}px;
                left:${left}px;
                ${styleString}
              ">${el.props?.text || ""}</div>`;
            }

            if (el.type === "image") {
              const styleString = `
                position: absolute;
                top: ${parseInt(el.position?.y) || 0}px;
                left: ${parseInt(el.position?.x) || 0}px;
                ${convertStylesToString(el.styles)}
              `
                .trim()
                .replace(/\s+/g, " ");

              return `<img src="${
                el.props?.src || ""
              }" style="${styleString}" />`;
            }

            return "";
          })
          .join("\n")}
      </body>
      </html>
    `;
};
