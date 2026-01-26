/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
