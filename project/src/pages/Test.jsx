// components/Canvas.js
import React from 'react';
import fitImageToPage from '../components/Editor Components/sidebar/hooks/fitImageToPage';

const image = {
  x: 1,
  y: 0,
  width: 1200,
  height: 800,
  zIndex: 8,
  src: 'https://media.istockphoto.com/id/2197592776/photo/smiling-elderly-woman-carrying-basket-of-hay-across-bridge-in-himalayas.jpg?s=1024x1024&w=is&k=20&c=X1QndfLSR-3lNYoxdWmy7pnNbbgbxWuvPwATsrsEdHU=',
};

const page = {
  width:1700,
  height: 200,
};

const Test = () => {
  const fittedImage = fitImageToPage(image, page);

  const imageStyle = {
    position: 'absolute',
    top: fittedImage.y,
    left: fittedImage.x,
    width: fittedImage.width,
    height: fittedImage.height,
    zIndex: fittedImage.zIndex,
  };

  const pageStyle = {
    position: 'relative',
    width: page.width,
    height: page.height,
    border: '1px solid #ccc',
    overflow: 'hidden',
  };

  return (
    <div style={pageStyle}>
      <img src={fittedImage.src} alt="Fitted" style={imageStyle} />
    </div>
  );
};

export default Test;
