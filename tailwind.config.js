/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#16335C",
        accent: "#B98A2E",
        good: "#3F7D58",
        bad: "#A5432F",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Public Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
