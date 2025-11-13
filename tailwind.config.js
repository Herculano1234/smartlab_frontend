/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moyo: {
          primary: "#6366F1",
          secondary: "#F472B6",
        },
      },
    },
  },
  plugins: [],
}
