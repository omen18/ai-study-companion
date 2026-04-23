/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef5ff",
          100: "#d9e7ff",
          200: "#b7d1ff",
          300: "#8ab1ff",
          400: "#5b8cff",
          500: "#3a6bf0",
          600: "#2850cc",
          700: "#1f3fa3",
          800: "#1c367f",
          900: "#1b2f64",
        },
      },
    },
  },
  plugins: [],
}
