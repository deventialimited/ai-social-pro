const { hardCodedShapes } = require("../helpers/ShapesHardCoded.js");

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
  return `
      <html
      style="${convertStylesToString({
        width: `${Math.max(Math.min(canvas.width / 3, 600))}px`,
        height: `${Math.max(Math.min(canvas.height / 3, 600))}px`,
        overflow: "hidden",
      })}" 
      >
       <head>
    <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
  </head>
    <body style="${convertStylesToString({
      ...(canvas?.styles || {}),
      width: `${Math.max(Math.min(canvas.width / 3, 600))}px`,
      height: `${Math.max(Math.min(canvas.height / 3, 600))}px`,
      position: "relative",
      overflow: "hidden",
      margin: "0 ",
    })}">
        ${elements
          .map((el) => {
            if (el.type === "text") {
              const allStyles = el.styles || {};

              const fontStylesKeys = [
                "color",
                "fontSize",
                "fontWeight",
                "fontFamily",
                "lineHeight",
                "letterSpacing",
                "textTransform",
                "textAlign",
                "whiteSpace",
                "wordBreak",
                "textDecoration",
                "fontStyle",
                "textShadow",
              ];

              const fontStyles = {};
              const layoutStyles = {};

              for (const key in allStyles) {
                if (fontStylesKeys.includes(key)) {
                  fontStyles[key] = allStyles[key];
                } else {
                  if (key === "height") {
                    // Set height to auto and move the original height value to minHeight
                    layoutStyles["height"] = "auto";
                    layoutStyles["minHeight"] = `${allStyles[key]}`.includes(
                      "px"
                    )
                      ? allStyles[key]
                      : `${allStyles[key]}px`;
                  } else if (
                    key === "width" &&
                    !`${allStyles[key]}`.includes("px")
                  ) {
                    layoutStyles[key] = `${allStyles[key]}px`;
                  } else {
                    layoutStyles[key] = allStyles[key];
                  }
                }
              }
              if (!fontStyles.fontFamily) {
                fontStyles.fontFamily = "Poppins";
              }
              const fontStyleString = convertStylesToString(fontStyles);
              const layoutStyleString = convertStylesToString(layoutStyles);

              const top = parseInt(el.position?.y) || 0;
              const left = parseInt(el.position?.x) || 0;

              return `<div style="
                ${layoutStyleString};
                position: absolute;
                top: ${top}px;
                left: ${left}px;
                display: flex;
                align-items: ${
                  allStyles.verticalAlign === "middle"
                    ? "center"
                    : allStyles.verticalAlign === "bottom"
                    ? "flex-end"
                    : "flex-start"
                };
                justify-content: flex-start;
                overflow: hidden;
              
              ">
                <div class="adjustable-text" style="position: static; width:100%; ${fontStyleString}">
                  ${el.props?.text || ""}
                </div>
              </div>`;
            }
            if (el.type === "image") {
              const top = parseInt(el.position?.y) || 0;
              const left = parseInt(el.position?.x) || 0;
              const adjustedStyles = { ...el.styles };

              // Make sure width/height are in px
              ["width", "height"].forEach((dim) => {
                if (
                  adjustedStyles[dim] &&
                  !`${adjustedStyles[dim]}`.includes("px")
                ) {
                  adjustedStyles[dim] = `${adjustedStyles[dim]}px`;
                }
              });

              const styleString = `
                ${convertStylesToString(adjustedStyles)};
                position: absolute;
                object-fit: cover;
                top: ${top}px;
                left: ${left}px;
              `
                .trim()
                .replace(/\s+/g, " ");

              const id = el.id;
              const maskId = el.props?.mask;

              // Compute mapped blur string
              const blurFilterString = (() => {
                if (
                  adjustedStyles.filter &&
                  adjustedStyles.filter.startsWith("blur(")
                ) {
                  const match =
                    adjustedStyles.filter.match(/blur\(([\d.]+)px\)/);
                  if (match) {
                    const rawValue = parseFloat(match[1]);
                    const mapped = (rawValue / 50) * 2.0;
                    return `backdrop-filter: blur(${mapped}px);`;
                  }
                }
                return "backdrop-filter: none;";
              })();

              if (maskId) {
                const shape = hardCodedShapes?.find((s) => s.id === maskId);
                if (shape) {
                  const innerSVG = shape.svg
                    .replace(/<svg[^>]*>/i, "") // Remove opening <svg> tag
                    .replace(/<\/svg>/i, "") // Remove closing </svg> tag
                    .trim();

                  const pathMatch = innerSVG.match(
                    /<path[^>]*d="([^"]+)"[^>]*>/
                  );
                  const polygonMatch = innerSVG.match(
                    /<polygon[^>]*points="([^"]+)"[^>]*>/
                  );
                  const rectMatch = innerSVG.match(
                    /<rect[^>]*?(?:x="([^"]*)")?[^>]*?(?:y="([^"]*)")?[^>]*?width="([^"]+)"[^>]*?height="([^"]+)"[^>]*>/
                  );
                  const rxMatch = innerSVG.match(/rx="([^"]+)"/);
                  const ryMatch = innerSVG.match(/ry="([^"]+)"/);
                  const circleMatch = innerSVG.match(
                    /<circle[^>]*cx="([^"]+)"[^>]*cy="([^"]+)"[^>]*r="([^"]+)"[^>]*>/
                  );
                  const ellipseMatch = innerSVG.match(
                    /<ellipse[^>]*cx="([^"]+)"[^>]*cy="([^"]+)"[^>]*rx="([^"]+)"[^>]*ry="([^"]+)"[^>]*>/
                  );
                  const lineMatch = innerSVG.match(
                    /<line[^>]*x1="([^"]+)"[^>]*y1="([^"]+)"[^>]*x2="([^"]+)"[^>]*y2="([^"]+)"[^>]*>/
                  );

                  let clipElement = "";
                  if (pathMatch) {
                    clipElement = `<path d="${pathMatch[1]}" />`;
                  } else if (polygonMatch) {
                    clipElement = `<polygon points="${polygonMatch[1]}" />`;
                  } else if (rectMatch) {
                    clipElement = `<rect x="${rectMatch[1] || "0"}" y="${
                      rectMatch[2] || "0"
                    }" width="${rectMatch[3]}" height="${rectMatch[4]}"${
                      rxMatch ? ` rx="${rxMatch[1]}"` : ""
                    }${ryMatch ? ` ry="${ryMatch[1]}"` : ""} />`;
                  } else if (circleMatch) {
                    clipElement = `<circle cx="${circleMatch[1]}" cy="${circleMatch[2]}" r="${circleMatch[3]}" />`;
                  } else if (ellipseMatch) {
                    clipElement = `<ellipse cx="${ellipseMatch[1]}" cy="${ellipseMatch[2]}" rx="${ellipseMatch[3]}" ry="${ellipseMatch[4]}" />`;
                  } else if (lineMatch) {
                    clipElement = `<line x1="${lineMatch[1]}" y1="${lineMatch[2]}" x2="${lineMatch[3]}" y2="${lineMatch[4]}" />`;
                  }

                  return `
                    <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                      <svg style="${styleString}; filter:none" width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <clipPath id="clip-${id}">
                            ${clipElement}
                          </clipPath>
                        </defs>
                        <image href="${
                          el.props?.src || ""
                        }" width="100" height="100" clip-path="url(#clip-${id})" preserveAspectRatio="none" />
                      </svg>
                      <div style="
                        position: absolute;
                        inset: 0;
                        width: ${adjustedStyles.width || "100%"};
                        height: ${adjustedStyles.height || "100%"};
                        z-index: ${(adjustedStyles.zIndex || 0) + 1};
                        ${blurFilterString}
                      "></div>
                    </div>
                  `;
                }
              }

              // Non-masked image case
              return `
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                  <img src="${
                    el.props?.src || ""
                  }" style="${styleString}; filter:none" />
                  <div style="
                    position: absolute;
                    inset: 0;
                    width: ${adjustedStyles.width || "100%"};
                    height: ${adjustedStyles.height || "100%"};
                    z-index: ${(adjustedStyles.zIndex || 0) + 1};
                    ${blurFilterString}
                  "></div>
                </div>
              `;
            }

            if (el.type === "shape") {
              const styles = el.styles || {};
              const top = parseInt(el.position?.y) || 0;
              const left = parseInt(el.position?.x) || 0;

              const color = styles.fill || styles.color || "#D3D3D3";

              const outerStyle = convertStylesToString({
                ...{
                  ...styles,
                  width:
                    styles.width && !`${styles.width}`.includes("px")
                      ? `${styles.width}px`
                      : styles.width,
                  height:
                    styles.height && !`${styles.height}`.includes("px")
                      ? `${styles.height}px`
                      : styles.height,
                },
                position: "absolute",
                top: `${top}px`,
                left: `${left}px`,
                overflow: "hidden",
                color,
                padding: 0,
                margin: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              });

              const svgRaw = el.props?.svg?.svg || "";
              const updatedSvg = svgRaw.replace(
                /<svg([^>]*)>/,
                `<svg$1 width="100%" height="100%" preserveAspectRatio="none" style="display:block;">`
              );

              return `<div style="${outerStyle}">
                <div style="width: 100%; height: 100%; display: flex;">
                  ${updatedSvg}
                </div>
              </div>`;
            }

            return "";
          })
          .join("\n")}
     <script>
document.addEventListener("DOMContentLoaded", function () {
  const textElements = document.querySelectorAll('.adjustable-text');
  const fontsToLoad = new Set();

  textElements.forEach(textarea => {
    const computed = window.getComputedStyle(textarea);
    const fontFamily = computed.fontFamily
      .split(",")[0]  // Only the first family in case there's fallback
      .replace(/['"]/g, '') // Remove quotes
      .trim();
    if (fontFamily) fontsToLoad.add(fontFamily);

    const container = textarea.parentElement;
    if (!container) return;

    const minHeight = parseFloat(window.getComputedStyle(container).minHeight);
    const containerWidth = container.clientWidth;

    let size = parseFloat(computed.fontSize);
    const minFontSize = 0.1;

    while (
      (textarea.scrollHeight > minHeight ||
      textarea.scrollWidth > containerWidth) &&
      size > minFontSize
    ) {
      size--;
      textarea.style.fontSize = size + 'px';
    }
  });

  console.log("Fonts to load:", Array.from(fontsToLoad));

  if (fontsToLoad.size > 0 && window.WebFont) {
    WebFont.load({
      google: {
        families: Array.from(fontsToLoad)
      }
    });
  }
});
</script>

      </body>

      </html>
    `;
};
