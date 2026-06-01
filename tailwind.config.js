/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1A1A1A",
          gold: "#C9A961",
          red: "#B33A3A",
          white: "#FFFFFF",
          soft: "#F5F5F5",
        },
      },
    },
  },
  plugins: [],
};
