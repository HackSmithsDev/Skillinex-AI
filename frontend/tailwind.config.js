/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",   // Skillinex Blue
        secondary: "#10b981", // Success Green (for Course Ready)
        dark: "#111827",      // Deep Navy for text
      },
    },
  },
  plugins: [],
}