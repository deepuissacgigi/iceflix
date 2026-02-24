/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#e50914",
        "bg-deep": "#0f0f0f", // Matching your SCSS variable
      }
    },
  },
  plugins: [],
}
