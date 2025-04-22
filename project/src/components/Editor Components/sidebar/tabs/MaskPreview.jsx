import React from 'react';

const MaskPreview = ({ maskId, size = 40 }) => {
  // Calculate center and dimensions
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 2; // Leave some padding

  // Render different SVG paths based on mask type
  const renderMaskShape = () => {
    switch (maskId) {
      case "circle":
        return (
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={radius} 
            fill="currentColor" 
          />
        );
      
      case "square":
        return (
          <rect 
            x={2} 
            y={2} 
            width={size - 4} 
            height={size - 4} 
            fill="currentColor" 
          />
        );
      
      case "star":
        const starPoints = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? radius : radius / 2;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          starPoints.push(`${x},${y}`);
        }
        return (
          <polygon 
            points={starPoints.join(' ')} 
            fill="currentColor" 
          />
        );
      
      case "triangle":
        return (
          <polygon 
            points={`${centerX},${2} ${size - 2},${size - 2} ${2},${size - 2}`} 
            fill="currentColor" 
          />
        );
      
      case "triangle-bottom-left":
        return (
          <polygon 
            points={`${2},${2} ${size - 2},${2} ${2},${size - 2}`} 
            fill="currentColor" 
          />
        );
      
      case "diamond":
        return (
          <polygon 
            points={`${centerX},${2} ${size - 2},${centerY} ${centerX},${size - 2} ${2},${centerY}`} 
            fill="currentColor" 
          />
        );
      
      case "pentagon":
        const pentagonPoints = [];
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          pentagonPoints.push(`${x},${y}`);
        }
        return (
          <polygon 
            points={pentagonPoints.join(' ')} 
            fill="currentColor" 
          />
        );
      
      case "hexagon":
        const hexagonPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * 2 * Math.PI) / 6;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          hexagonPoints.push(`${x},${y}`);
        }
        return (
          <polygon 
            points={hexagonPoints.join(' ')} 
            fill="currentColor" 
          />
        );
      
      case "speech-bubble":
        return (
          <path 
            d={`M${2},${2} h${size - 4} v${size - 12} h${-size/4} l${-size/4},${size/4} v${size/4} h${-size/4} z`} 
            fill="currentColor" 
          />
        );
      
      case "cross":
        return (
          <path 
            d={`M${2},${centerY - size/6} h${size - 4} v${size/3} h${-size + 4} z M${centerX - size/6},${2} v${size - 4} h${size/3} v${-size + 4} z`} 
            fill="currentColor" 
          />
        );
      
      case "oval":
        return (
          <ellipse 
            cx={centerX} 
            cy={centerY} 
            rx={radius} 
            ry={radius * 0.6} 
            fill="currentColor" 
          />
        );
      
      case "cloud":
        return (
          <path 
            d={`M${centerX - radius/2},${centerY} a${radius/2},${radius/2} 0 1,0 ${radius},0 a${radius/2},${radius/2} 0 1,0 ${radius},0 a${radius/2},${radius/2} 0 1,0 ${radius},0 a${radius/2},${radius/2} 0 1,0 ${radius},0 a${radius/2},${radius/2} 0 1,0 ${-radius*4},0`} 
            fill="currentColor" 
          />
        );
      
      case "arrow-left":
        return (
          <path 
            d={`M${size - 2},${centerY} l${-size/2},${-size/3} v${size/1.5} l${size/2},${-size/3} z`} 
            fill="currentColor" 
          />
        );
      
      case "arrow-right":
        return (
          <path 
            d={`M${2},${centerY} l${size/2},${-size/3} v${size/1.5} l${-size/2},${-size/3} z`} 
            fill="currentColor" 
          />
        );
      
      case "arrow-down":
        return (
          <path 
            d={`M${centerX},${2} l${size/3},${size/2} h${-size/1.5} l${size/3},${-size/2} z`} 
            fill="currentColor" 
          />
        );
      
      case "arrow-up":
        return (
          <path 
            d={`M${centerX},${size - 2} l${size/3},${-size/2} h${-size/1.5} l${size/3},${size/2} z`} 
            fill="currentColor" 
          />
        );
      
      case "flower":
        const petalCount = 8;
        const petalPoints = [];
        for (let i = 0; i < petalCount; i++) {
          const angle = (i * 2 * Math.PI) / petalCount;
          const x = centerX + radius * 0.8 * Math.cos(angle);
          const y = centerY + radius * 0.8 * Math.sin(angle);
          petalPoints.push(`${x},${y}`);
        }
        return (
          <>
            <circle cx={centerX} cy={centerY} r={radius * 0.3} fill="currentColor" />
            <polygon points={petalPoints.join(' ')} fill="currentColor" />
          </>
        );
      
      case "asterisk":
        return (
          <path 
            d={`M${centerX},${2} l${0},${size - 4} M${2},${centerY} l${size - 4},${0} M${centerX - radius/1.4},${centerY - radius/1.4} l${radius/0.7},${radius/0.7} M${centerX - radius/1.4},${centerY + radius/1.4} l${radius/0.7},${-radius/0.7}`} 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none" 
          />
        );
      
      case "flag":
        return (
          <path 
            d={`M${2},${2} v${size - 4} M${2},${2} h${size/2} l${size/4},${-size/4} l${-size/4},${-size/4} h${-size/2}`} 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none" 
          />
        );
      
      case "half-circle":
        return (
          <path 
            d={`M${2},${centerY} a${radius},${radius} 0 1,1 ${size - 4},0`} 
            fill="currentColor" 
          />
        );
      
      case "cylinder":
        return (
          <path 
            d={`M${2},${centerY - radius/2} a${radius},${radius/2} 0 1,0 ${size - 4},0 v${size - 4} a${radius},${radius/2} 0 1,0 ${-size + 4},0 z`} 
            fill="currentColor" 
          />
        );
      
      case "diamond-alt":
        return (
          <polygon 
            points={`${centerX},${2} ${size - 2},${centerY} ${centerX},${size - 2} ${2},${centerY}`} 
            fill="currentColor" 
          />
        );
      
      case "rounded-rectangle":
        return (
          <rect 
            x={2} 
            y={2} 
            width={size - 4} 
            height={size - 4} 
            rx={radius/2} 
            fill="currentColor" 
          />
        );
      
      case "teardrop":
        return (
          <path 
            d={`M${centerX},${2} a${radius},${radius} 0 0,1 ${radius},${radius} a${radius},${radius} 0 0,1 ${-radius},${radius} a${radius},${radius} 0 0,1 ${-radius},${-radius} a${radius},${radius} 0 0,1 ${radius},${-radius} z`} 
            fill="currentColor" 
          />
        );
      
      case "droplet":
        return (
          <path 
            d={`M${centerX},${2} a${radius},${radius} 0 0,1 ${radius},${radius} a${radius},${radius} 0 0,1 ${-radius},${radius} a${radius},${radius} 0 0,1 ${-radius},${-radius} a${radius},${radius} 0 0,1 ${radius},${-radius} z`} 
            fill="currentColor" 
          />
        );
      
      case "burst":
        const burstPoints = [];
        for (let i = 0; i < 12; i++) {
          const angle = (i * 2 * Math.PI) / 12;
          const r = i % 2 === 0 ? radius : radius / 2;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          burstPoints.push(`${x},${y}`);
        }
        return (
          <polygon 
            points={burstPoints.join(' ')} 
            fill="currentColor" 
          />
        );
      
      case "wave":
        const wavePoints = [];
        for (let x = 2; x < size - 2; x += 2) {
          const y = centerY + Math.sin((x - 2) / (size - 4) * Math.PI * 2) * (radius / 2);
          wavePoints.push(`${x},${y}`);
        }
        wavePoints.push(`${size - 2},${centerY}`);
        wavePoints.push(`${size - 2},${size - 2}`);
        wavePoints.push(`${2},${size - 2}`);
        return (
          <polygon 
            points={wavePoints.join(' ')} 
            fill="currentColor" 
          />
        );
      
      case "flower-alt":
        const flowerAltPoints = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * 2 * Math.PI) / 10;
          const r = i % 2 === 0 ? radius : radius / 2;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          flowerAltPoints.push(`${x},${y}`);
        }
        return (
          <polygon 
            points={flowerAltPoints.join(' ')} 
            fill="currentColor" 
          />
        );
      
      default:
        return (
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={radius} 
            fill="currentColor" 
          />
        );
    }
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`}
      className="text-gray-600"
    >
      {renderMaskShape()}
    </svg>
  );
};

export default MaskPreview; 