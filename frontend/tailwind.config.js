/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1976d2', // Angular Material Blue
        accent: '#ff4081',
        warn: '#f44336',
      },
    },
  },
  plugins: [],
}
