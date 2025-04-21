
function fitImageToPage(image, page) {
    const aspectRatio = image.width / image.height;
    const pageRatio = page.width / page.height;
  
    let newWidth = page.width;
    let newHeight = page.height;
  
    if (aspectRatio > pageRatio) {
      newWidth = page.width;
      newHeight = page.width / aspectRatio;
    } else {
      newHeight = page.height;
      newWidth = page.height * aspectRatio;
    }
  
    const newX = (page.width - newWidth) / 2;
    const newY = (page.height - newHeight) / 2;
  
    return {
      ...image,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    };
  }
  
  export default fitImageToPage;
  