/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};