// rotation hook

export const rotateElement = (element, degrees) => {
  if (!element || typeof element.rotation !== "number") {
    console.warn("Invalid element passed to rotateElement");
    return element;
  }

  const updatedRotation = (element.rotation + degrees) % 360;

  return {
    ...element,
    rotation: updatedRotation < 0 ? 360 + updatedRotation : updatedRotation,
  };
};

// copy element hook

export const copyElement = (element) => {
  return {
    ...element,
    id: uuidv4(),
  };
};

// delete element hook

export const deleteElement = (element) => {
  return {
    ...element,
    id: uuidv4(),
  };
};

// opacity hook

export function updateElementOpacity(element, line) {
  const clampedLine = Math.max(0, Math.min(line, 30));
  const normalizedOpacity = parseFloat((clampedLine / 30).toFixed(2));

  return {
    ...element,
    opacity: normalizedOpacity,
  };
}

// layer hooks
// move layer up
export function moveLayerUp(element, maxZIndex) {
  element.zIndex = Math.min(element.zIndex + 1, maxZIndex);
  return element;
}

// move layer down
export function moveLayerDown(element) {
  element.zIndex = Math.max(element.zIndex - 1, 0);
  return element;
}

// move layer to top
export function moveLayerToTop(element, maxZIndex) {
  element.zIndex = maxZIndex;
  return element;
}

// move layer to bottom
export function moveLayerToBottom(element) {
  element.zIndex = 0;
  return element;
}

// align to left
export function alignLeft(element) {
  element.position.x = 0;
  return element;
}

// align to right
export function alignRight(element, canvasWidth) {
  element.position.x = canvasWidth - element.size.width;
  return element;
}

// align to center (horizontally)
export function alignCenter(element, canvasWidth) {
  element.position.x = (canvasWidth - element.size.width) / 2;
  return element;
}

// align to top
export function alignTop(element) {
  element.position.y = 0;
  return element;
}

// align to bottom
export function alignBottom(element, canvasHeight) {
  element.position.y = canvasHeight - element.size.height;
  return element;
}

// align to middle (vertically)
export function alignMiddle(element, canvasHeight) {
  element.position.y = (canvasHeight - element.size.height) / 2;
  return element;
}

// lock the element
export function lockElement(element) {
  element.locked = true;
  return element;
}

// unlock the element
export function unlockElement(element) {
  element.locked = false;
  return element;
}

// toggle lock status
export function toggleLock(element) {
  element.locked = !element.locked;
  return element;
}

// set transparency from a percentage (0 to 100)
export function setTransparency(element, percentage) {
  element.opacity = Math.max(0, Math.min(percentage, 100)) / 100;
  return element;
}

export const setElementPosition = (element, action, canvas) => {
  const elementWidth = element.styles.width || 100;
  const elementHeight = element.styles.height || 30;

  const canvasWidth = Math.max(Math.min(canvas.width / 3, 600));
  const canvasHeight = Math.max(Math.min(canvas.height / 3, 600));

  let newX = element.position.x || 0;
  let newY = element.position.y || 0;
  let prevPaddingLeftRight = 0;
  let prevPaddingTopBottom = 0;
  if (element?.effects?.background?.padding) {
    const padding = parseFloat(element.effects.background.padding) || 0;
    prevPaddingTopBottom = Math.round(padding * 0.15);
    prevPaddingLeftRight = Math.round(padding * 0.05);
  }
  switch (action) {
    case "left":
      newX = 0;
      break;
    case "right":
      newX = canvasWidth - (elementWidth + prevPaddingLeftRight);
      break;
    case "center":
      newX = (canvasWidth - (elementWidth + prevPaddingLeftRight)) / 2;
      break;
    case "top":
      newY = 0;
      break;
    case "bottom":
      newY = canvasHeight - (elementHeight + prevPaddingTopBottom);
      break;
    case "middle":
      newY = (canvasHeight - (elementHeight + prevPaddingTopBottom)) / 2;
      break;
    default:
      break;
  }
  newX = Math.max(0, newX);
  newY = Math.max(0, newY);
  console.log("New position:", { newX, newY });
  return { x: newX, y: newY };
};
