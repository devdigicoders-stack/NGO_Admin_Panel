/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        riho: {
          primary: "#03735F",
          secondary: "#FFC108",
          accent: "#03735F",
          dark: {
            bg: "#08362E",
            card: "#0c473e",
            border: "#052a24",
            text: "#c4e0db",
            title: "#ffffff",
          },
          light: {
            bg: "#f8fafc",
            card: "#ffffff",
            border: "#e2e8f0",
            text: "#334155",
            title: "#08362E",
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
