/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0F2042",
        "primary-soft": "#F1F5F9",
        secondary: "#4B5E89",
        surface: "#F7F9FB",
        "surface-low": "#F2F4F6",
        "surface-container": "#ECEFF0",
        "surface-high": "#E6E8EA",
        "surface-lowest": "#FFFFFF",
        "on-surface": "#191C1E",
        "on-surface-variant": "#45464E",
        error: "#BA1A1A",
        outline: "#75777F",
        background: "#F7F9FB",
        foreground: "#191C1E",
        muted: "#45464E",
        border: "#E0E3E5",
        success: "#006A61",
      }
    },
  },
  plugins: [],
};