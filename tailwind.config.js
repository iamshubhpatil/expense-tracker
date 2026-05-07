/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#f5f2ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#9370db',
          600: '#8058d4',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#3f0f5c',
        },
      },
    },
  },
  plugins: [],
}
