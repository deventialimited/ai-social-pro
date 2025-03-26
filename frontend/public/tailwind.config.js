/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable dark mode
  theme: {
    extend: {
      colors: {
        background: "var(--bg-color)",
        text: "var(--text-color)",
        primary: "var(--primary-color)",
      },
    },
  },
  
  plugins: [],
};
