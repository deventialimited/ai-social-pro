/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          bg: 'var(--bg-light)',
          text: 'var(--text-light)',
          sidebar: 'var(--sidebar-light)',
          border: 'var(--border-light)',
          hover: 'var(--hover-light)',
        },
        dark: {
          bg: 'var(--bg-dark)',
          text: 'var(--text-dark)',
          sidebar: 'var(--sidebar-dark)',
          border: 'var(--border-dark)',
          hover: 'var(--hover-dark)',
        },
      },
    },
  },
  plugins: [],
};