import { v4 as uuidv4 } from "uuid";

export const hardCodedShapes = [
  // {
  //   id: "rounded-rectangle",
  //   name: "Rounded Rectangle",
  //   svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  //     <rect x="10" y="20" width="80" height="60" rx="15" ry="15" fill="currentColor" stroke="currentColor" stroke-width="4" fill="none" />
  //   </svg>`,
  // },
  // Basic shapes from first image

  {
    id: "open-quotes",
    name: "Open Quotes",
    svg: `<svg viewBox="0 0 349.078 349.078" xmlns="http://www.w3.org/2000/svg">
      <path d="M150.299,26.634v58.25c0,7.9-6.404,14.301-14.304,14.301c-28.186,0-43.518,28.909-45.643,85.966h45.643 
      c7.9,0,14.304,6.407,14.304,14.304v122.992c0,7.896-6.404,14.298-14.304,14.298H14.301C6.398,336.745,0,330.338,0,322.447V199.455 
      c0-27.352,2.754-52.452,8.183-74.611c5.568-22.721,14.115-42.587,25.396-59.048c11.608-16.917,26.128-30.192,43.16-39.44 
      C93.886,17.052,113.826,12.333,136,12.333C143.895,12.333,150.299,18.734,150.299,26.634z M334.773,99.186 
      c7.896,0,14.305-6.407,14.305-14.301v-58.25c0-7.9-6.408-14.301-14.305-14.301c-22.165,0-42.108,4.72-59.249,14.023 
      c-17.035,9.248-31.563,22.523-43.173,39.44c-11.277,16.461-19.824,36.328-25.393,59.054c-5.426,22.166-8.18,47.266-8.18,74.605 
      v122.992c0,7.896,6.406,14.298,14.304,14.298h121.69c7.896,0,14.299-6.407,14.299-14.298V199.455 
      c0-7.896-6.402-14.304-14.299-14.304h-44.992C291.873,128.095,306.981,99.186,334.773,99.186z" fill="currentColor"/>
    </svg>`,
  },

  {
    id: "close-quotes",
    name: "Close Quotes",
    svg: `<svg viewBox="0 0 349.078 349.078" xmlns="http://www.w3.org/2000/svg">
      <path d="M198.779,322.444v-58.25c0-7.9,6.404-14.301,14.304-14.301c28.186,0,43.518-28.909,45.643-85.966h-45.643 
      c-7.9,0-14.304-6.407-14.304-14.304V26.631c0-7.896,6.404-14.298,14.304-14.298h121.694c7.903,0,14.301,6.407,14.301,14.298 
      v122.992c0,27.352-2.754,52.452-8.183,74.611c-5.568,22.721-14.115,42.587-25.396,59.048c-11.608,16.917-26.128,30.192-43.16,39.44 
      c-17.121,9.248-37.061,13.967-59.234,13.967C205.183,336.745,198.779,330.344,198.779,322.444z M14.305,249.892 
      c-7.896,0-14.305,6.407-14.305,14.301v58.25c0,7.9,6.408,14.301,14.305,14.301c22.165,0,42.108-4.72,59.249-14.023 
      c17.035-9.248,31.563-22.523,43.173-39.44c11.277-16.461,19.824-36.328,25.393-59.054c5.426-22.166,8.18-47.266,8.18-74.605 
      V26.631c0-7.896-6.406-14.298-14.304-14.298H14.305C6.408,12.333,0,18.74,0,26.631v122.992c0,7.896,6.402,14.304,14.305,14.304 
      h44.992C57.205,220.983,42.097,249.892,14.305,249.892z" fill="currentColor"/>
    </svg>`,
  },
  
  
  {
    id: "square",
    name: "Square",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="98" height="100" fill="currentColor" />
      </svg>`,
  },
  {
    id: "circle",
    name: "Circle",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="currentColor" />
      </svg>`,
  },
  {
    id: "star",
    name: "Star",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 15L62 40L90 42L68 61L74 88L50 75L26 88L32 61L10 42L38 40L50 15Z" fill="currentColor"/>
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
    id: "right-triangle",
    name: "Right Triangle",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="5,5 5,95 95,95" fill="currentColor" />
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
    id: "pentagon",
    name: "Pentagon",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,10 90,40 75,85 25,85 10,40" fill="currentColor"/>
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
    id: "speech-bubble",
    name: "Speech Bubble",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10H90V70H55L50 90L45 70H10V10Z" fill="currentColor"/>
      </svg>`,
  },
  // {
  //   id: "cross",
  //   name: "Cross",
  //   svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  //       <rect x="40" y="10" width="20" height="80" fill="currentColor"/>
  //       <rect x="10" y="40" width="80" height="20" fill="currentColor"/>
  //     </svg>`,
  // },
  // {
  //   id: "pill",
  //   name: "Pill",
  //   svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  //       <rect x="20" y="30" width="60" height="40" rx="20" ry="20" fill="currentColor"/>
  //     </svg>`,
  // },
  {
    id: "cloud",
    name: "Cloud",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 60C15 60 10 50 15 40C20 30 35 30 40 35C40 25 50 20 60 25C70 30 75 40 70 50C80 50 85 60 80 70C75 80 60 80 50 75C40 80 25 80 20 70C15 65 20 60 25 60Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "right-arrow",
    name: "Right Arrow",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 40H60L60 20L90 50L60 80L60 60H10V40Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "left-arrow",
    name: "Left Arrow",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M90 40H40L40 20L10 50L40 80L40 60H90V40Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "down-arrow",
    name: "Down Arrow",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 10V60H20L50 90L80 60H60V10H40Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "up-arrow",
    name: "Up Arrow",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 90V40H20L50 10L80 40H60V90H40Z" fill="currentColor"/>
      </svg>`,
  },

  // Shapes from second image
  // {
  //   id: "flower",
  //   name: "Flower",
  //   svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  //       <path d="M50 30C55 20 65 20 70 30C75 40 65 50 50 50C35 50 25 40 30 30C35 20 45 20 50 30Z" fill="currentColor"/>
  //       <path d="M70 50C80 45 90 50 90 60C90 70 80 75 70 70C60 65 60 55 70 50Z" fill="currentColor"/>
  //       <path d="M50 70C45 80 35 80 30 70C25 60 35 50 50 50C65 50 75 60 70 70C65 80 55 80 50 70Z" fill="currentColor"/>
  //       <path d="M30 50C20 55 10 50 10 40C10 30 20 25 30 30C40 35 40 45 30 50Z" fill="currentColor"/>
  //     </svg>`,
  // },
  // {
  //   id: "asterisk",
  //   name: "Asterisk",
  //   svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  //       <path d="M50 20V80M30 30L70 70M20 50H80M30 70L70 30" stroke="currentColor" stroke-width="15" stroke-linecap="round"/>
  //     </svg>`,
  // },
  {
    id: "chevron",
    name: "Chevron",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 30L50 60L80 30L90 40L50 80L10 40L20 30Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "half-circle",
    name: "Half Circle",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 50C10 25 30 10 50 10C70 10 90 25 90 50" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "cylinder",
    name: "Cylinder",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 30C30 20 40 15 50 15C60 15 70 20 70 30V70C70 80 60 85 50 85C40 85 30 80 30 70V30Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "diamond-alt",
    name: "Diamond Alt",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,10 85,50 50,90 15,50" fill="currentColor"/>
      </svg>`,
  },

  // Shapes from third image
  {
    id: "shield-1",
    name: "Shield 1",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 20H80V60C80 80 50 90 50 90C50 90 20 80 20 60V20Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "shield-2",
    name: "Shield 2",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 20H75V60C75 75 50 85 50 85C50 85 25 75 25 60V20Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "parallelogram",
    name: "Parallelogram",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="30,20 80,20 70,80 20,80" fill="currentColor"/>
      </svg>`,
  },
  // {
  //   id: "quatrefoil",
  //   name: "Quatrefoil",
  //   svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  //       <path d="M50 20C55 10 65 10 70 20C75 30 65 40 50 40C35 40 25 30 30 20C35 10 45 10 50 20Z" fill="currentColor"/>
  //       <path d="M80 50C90 45 90 35 80 30C70 25 60 35 60 50C60 65 70 75 80 70C90 65 90 55 80 50Z" fill="currentColor"/>
  //       <path d="M50 80C45 90 35 90 30 80C25 70 35 60 50 60C65 60 75 70 70 80C65 90 55 90 50 80Z" fill="currentColor"/>
  //       <path d="M20 50C10 55 10 65 20 70C30 75 40 65 40 50C40 35 30 25 20 30C10 35 10 45 20 50Z" fill="currentColor"/>
  //     </svg>`,
  // },
  {
    id: "sparkle",
    name: "Sparkle",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10L55 40L85 45L55 50L50 80L45 50L15 45L45 40L50 10Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "step-1",
    name: "Step 1",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 20H40V40H60V60H80V80H20V20Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "step-2",
    name: "Step 2",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 20V80H80V60H60V40H40V20H20Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "t-shape",
    name: "T Shape",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 20H80V40H60V80H40V40H20V20Z" fill="currentColor"/>
      </svg>`,
  },

  // Blob shapes from fourth image
  {
    id: "blob-1",
    name: "Blob 1",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 30C40 20 60 20 70 30C80 40 80 60 70 70C60 80 40 80 30 70C20 60 20 40 30 30Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "blob-2",
    name: "Blob 2",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 40C30 25 45 20 60 25C75 30 80 45 75 60C70 75 55 80 40 75C25 70 20 55 25 40Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "blob-3",
    name: "Blob 3",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 35C35 20 55 15 70 25C85 35 85 55 75 70C65 85 45 85 30 75C15 65 25 50 30 35Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "blob-4",
    name: "Blob 4",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 30C35 15 55 20 65 30C75 40 80 60 70 75C60 90 40 85 30 75C20 65 15 45 25 30Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "blob-5",
    name: "Blob 5",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 25C40 15 60 20 70 30C80 40 75 60 65 70C55 80 35 75 25 65C15 55 20 35 30 25Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "blob-6",
    name: "Blob 6",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 35C35 20 55 25 65 35C75 45 70 65 60 75C50 85 30 80 20 70C10 60 15 50 25 35Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "blob-7",
    name: "Blob 7",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 30C40 15 65 20 75 35C85 50 75 70 60 80C45 90 25 80 15 65C5 50 20 45 30 30Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "blob-8",
    name: "Blob 8",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 20C55 15 65 25 70 40C75 55 65 65 50 70C35 75 25 65 20 50C15 35 25 25 40 20Z" fill="currentColor"/>
      </svg>`,
  },

  // Shapes from fifth image
  {
    id: "star-alt",
    name: "Star Alt",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 15L60 40L85 40L65 55L75 80L50 65L25 80L35 55L15 40L40 40L50 15Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "circle-alt",
    name: "Circle Alt",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="35" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "blob-9",
    name: "Blob 9",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 30C45 20 60 25 70 35C80 45 75 60 65 70C55 80 40 75 30 65C20 55 25 40 35 30Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "blob-10",
    name: "Blob 10",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 35C40 25 55 30 65 40C75 50 70 65 60 75C50 85 35 80 25 70C15 60 20 45 30 35Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "blob-11",
    name: "Blob 11",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 35C45 25 60 30 70 40C80 50 75 65 65 75C55 85 40 80 30 70C20 60 25 45 35 35Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "blob-12",
    name: "Blob 12",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 30C50 20 65 25 75 35C85 45 80 60 70 70C60 80 45 75 35 65C25 55 30 40 40 30Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "blob-13",
    name: "Blob 13",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 30C45 20 60 25 70 35C80 45 75 60 65 70C55 80 40 75 30 65C20 55 25 40 35 30Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "blob-14",
    name: "Blob 14",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 35C40 25 55 30 65 40C75 50 70 65 60 75C50 85 35 80 25 70C15 60 20 45 30 35Z" fill="currentColor"/>
      </svg>`,
  },

  // Additional shapes from the last image
  {
    id: "hourglass",
    name: "Hourglass",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 20H70V35C70 45 50 50 50 50C50 50 30 55 30 65V80H70V65C70 55 50 50 50 50C50 50 30 45 30 35V20Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "house",
    name: "House",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 50V85H80V50L50 25L20 50Z" fill="currentColor"/>
        <rect x="45" y="60" width="10" height="25" fill="white"/>
      </svg>`,
  },
  // {
  //   id: "mushroom",
  //   name: "Mushroom",
  //   svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  //       <path d="M30 50C30 30 70 30 70 50H30Z" fill="currentColor"/>
  //       <rect x="45" y="50" width="10" height="30" fill="currentColor"/>
  //     </svg>`,
  // },
  {
    id: "heart-alt",
    name: "Heart Alt",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 30C55 20 65 20 70 30C75 40 70 50 50 70C30 50 25 40 30 30C35 20 45 20 50 30Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "leaf",
    name: "Leaf",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 80C20 40 60 20 80 20C80 40 60 80 20 80Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "lightning",
    name: "Lightning",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M55 20L30 50H50L45 80L70 50H50L55 20Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "lightning-alt",
    name: "Lightning Alt",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 20L25 55H45L40 80L75 45H55L60 20Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "magnet",
    name: "Magnet",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 20H45V50C45 55 55 55 55 50V20H70V50C70 65 30 65 30 50V20Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "apple",
    name: "Apple",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 20C55 15 60 20 60 25C70 20 80 30 75 45C70 60 60 75 50 80C40 75 30 60 25 45C20 30 30 20 40 25C40 20 45 15 50 20Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "l-shape",
    name: "L Shape",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 30V70H70V55H45V30H30Z" fill="currentColor"/>
      </svg>`,
  },
  // {
  //   id: "sunburst",
  //   name: "Sunburst",
  //   svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  //       <path d="M50 30V10M70 35L85 20M80 50H95M70 65L85 80M50 70V90M30 65L15 80M20 50H5M30 35L15 20" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
  //       <circle cx="50" cy="50" r="15" fill="currentColor"/>
  //     </svg>`,
  // },
  {
    id: "wave",
    name: "Wave",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 40C20 20 30 60 40 40C50 20 60 60 70 40C80 20 90 60 100 40V80H0V40C0 40 0 60 10 40Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "hexagon-alt",
    name: "Hexagon Alt",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="25,20 75,20 90,50 75,80 25,80 10,50" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "arch",
    name: "Arch",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 80V40C20 20 80 20 80 40V80H65V40C65 35 35 35 35 40V80H20Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "plus",
    name: "Plus",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 20H65V35H80V65H65V80H35V65H20V35H35V20Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "dome",
    name: "Dome",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 60C20 40 35 20 50 20C65 20 80 40 80 60V80H20V60Z" fill="currentColor"/>
      </svg>`,
  },
  {
    id: "heart",
    name: "Heart",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 85L42.5 77.5C20 57.5 5 45 5 30C5 17.5 15 7.5 27.5 7.5C35 7.5 42.5 11.25 47.5 17.5C52.5 11.25 60 7.5 67.5 7.5C80 7.5 90 17.5 90 30C90 45 75 57.5 52.5 77.5L50 85Z" fill="currentColor"/>
      </svg>`,
  },
];

// Define line shapes
export const lineShapes = [
  
  {
    id: "solid-line",
    name: "Solid Line",
    type: "line",
    svg: `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="20" x2="190" y2="20" stroke="currentColor" stroke-width="8" />
    </svg>`,
  },
  {
    id: "dashed-line",
    name: "Dashed Line",
    type: "line",
    svg: `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="20" x2="190" y2="20" stroke="currentColor" stroke-width="8" stroke-dasharray="20,12" />
    </svg>`,
  },
  {
    id: "dotted-line",
    name: "Dotted Line",
    type: "line",
    svg: `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="20" x2="190" y2="20" stroke="currentColor" stroke-width="8" stroke-dasharray="6,10" />
    </svg>`,
  },
  {
    id: "arrow-line",
    name: "Arrow Line",
    type: "line",
    svg: `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="20" x2="165" y2="20" stroke="currentColor" stroke-width="8" />
      <polygon points="165,6 195,20 165,34" fill="currentColor" />
    </svg>`,
  },
  {
    id: "circle-arrow-line",
    name: "Circle Arrow Line",
    type: "line",
    svg: `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="12" fill="currentColor" />
      <line x1="32" y1="20" x2="165" y2="20" stroke="currentColor" stroke-width="8" />
      <polygon points="165,6 195,20 165,34" fill="currentColor" />
    </svg>`,
  },
  {
    id: "square-dashed-line",
    name: "Square Dashed Line",
    type: "line",
    svg: `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="24" height="24" fill="currentColor" />
      <line x1="32" y1="20" x2="190" y2="20" stroke="currentColor" stroke-width="8" stroke-dasharray="20,12" />
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
      height: svgString.type === "line" ? 30 : 200,
      color: "#D3D3D3",
      fill: "#D3D3D3",
    },
    props: {
      svg: svgString,
    },
  };
};
