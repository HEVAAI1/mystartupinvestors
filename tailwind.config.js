/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
    "./node_modules/@shadcn/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D4ED8",
        secondary: "#9333EA",
        accent: "#F59E0B",
        neutral: "#3F3F46",
        gray: "#9CA3AF",
        zinc: "#71717A",
        stone: "#78716C",
        slate: "#64748B",
      },
      fontFamily: {
        sans: ["SUSE", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
