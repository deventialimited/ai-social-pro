// rotation hook

export const  rotateElement=(element, degrees)=> {
    if (!element || typeof element.rotation !== 'number') {
      console.warn('Invalid element passed to rotateElement');
      return element;
    }
  
    const updatedRotation = (element.rotation + degrees) % 360;
  
    return {
      ...element,
      rotation: updatedRotation < 0 ? 360 + updatedRotation : updatedRotation,
    };
  }

// copy element hook

export const copyElement=(element)=> {
    return {
        ...element,
        id: uuidv4(),
    };
}

// delete element hook

export const deleteElement=(element)=> {
    return {
        ...element,
        id: uuidv4(),
    };
}


// opacity hook

export function updateElementOpacity(element, line) {
    const clampedLine = Math.max(0, Math.min(line, 30));
    const normalizedOpacity = parseFloat((clampedLine / 30).toFixed(2));
  
    return {
      ...element,
      opacity: normalizedOpacity
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

  
  export const setPosition = (element, action) => {
    const updatedStyles = { ...element.styles };
  
    if (action === "up" || action === "down" || action === "toFront" || action === "toBack") {
      updatedStyles.zIndex = (parseInt(updatedStyles.zIndex || 0) || 0) + (action === "up" ? 1 : action === "down" ? -1 : action === "toFront" ? 999 : -999);
      return updatedStyles;
    }
  
    updatedStyles.position = "absolute";
  
    switch (action) {
      case "left":
        updatedStyles.left = 0;
        break;
      case "right":
        updatedStyles.right = 0;
        break;
      case "top":
        updatedStyles.top = 0;
        break;
      case "bottom":
        updatedStyles.bottom = 0;
        break;
      case "center":
        updatedStyles.left = "50%";
        updatedStyles.transform = "translateX(-50%)";
        break;
      case "middle":
        updatedStyles.top = "50%";
        updatedStyles.transform = "translateY(-50%)";
        break;
    }
  
    return updatedStyles;
  };
  


