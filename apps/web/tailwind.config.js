/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#0F3D2E",
        leaf: "#2E7D5B",
        lime: "#A3D977",
        amber: "#F5A623",
        cream: "#F8F6F0",
        slate: "#1F2933",
      },
      fontFamily: {
        heading: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
