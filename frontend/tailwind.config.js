/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0A5C36',
        'secondary': '#448213',
        'accent': '#66bb33',
      },
    },
  },
  plugins: [],
}