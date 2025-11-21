/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
   extend: {
  colors: {
    primary: '#e06c7f', // hồng pastel (nút, accent)
    secondary: '#f9f5f1', // nền be nhạt
    dark: '#2c2c2c', // chữ đen sang trọng
  },
  fontFamily: {
    serif: ['Playfair Display', 'serif'],
    sans: ['Lato', 'sans-serif'],
  },
}

  },
  plugins: [],
}
