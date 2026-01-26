/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@relume_io/relume-ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("@relume_io/relume-tailwind")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6b8e23",
          light: "#8fb347",
          dark: "#4a5f16",
        },
        cream: {
          DEFAULT: "#f5f5dc",
          light: "#fafafa",
        },
      },
    },
  },
  plugins: [],
};
