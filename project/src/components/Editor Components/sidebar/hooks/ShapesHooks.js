import { v4 as uuidv4 } from "uuid";

export const hardCodedShapes = [
  {
    id: "star",
    name: "Star",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l2.39 7.26H22l-6.18 4.5L17.82 22 12 17.77 6.18 22l1.36-8.24L2 9.26h7.61L12 2z"/>
      </svg>`,
  },
  {
    id: "triangle",
    name: "Triangle",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,15 90,85 10,85" fill="currentColor" />
      </svg>`,
  },
  {
    id: "circle",
    name: "Circle",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="currentColor" />
      </svg>`,
  },
  {
    id: "square",
    name: "Square",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="80" height="80" fill="currentColor" />
      </svg>`,
  },
  {
    id: "diamond",
    name: "Diamond",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,10 90,50 50,90 10,50" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "hexagon",
    name: "Hexagon",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "arrow",
    name: "Arrow",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 50h60l-20 -20v15h-40v10h40v15z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "cross",
    name: "Cross",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="40" y="10" width="20" height="80" fill="currentColor"/>
        <rect x="10" y="40" width="80" height="20" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "heart",
    name: "Heart",
    svg: `<svg viewBox="0 0 32 29.6" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.6,0c-2.9,0-5.4,1.5-6.6,3.7C15.8,1.5,13.3,0,10.4,0C4.7,0,0,4.7,0,10.4c0,5.7,5.2,10.5,13.1,17.4l2.1,1.8l2.1-1.8
        C26.8,20.9,32,16.1,32,10.4C32,4.7,27.3,0,21.6,0H23.6z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "cloud",
    name: "Cloud",
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M48,24a16,16,0,0,0-31.73-2A12,12,0,0,0,16,48H48a12,12,0,0,0,0-24Z" fill="currentColor"/>
      </svg>`,
  },
];

export const createShapeElement = (svgString) => {
  return {
    id: `shape-${uuidv4()}`,
    type: "shape",
    position: { x: 100, y: 100 },
    styles: {
      width: 200,
      height: 200,
      color: '#000000',
      fill: '#000000'
    },
    props: {
      svg: svgString,
    },
  };
};
