/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // Custom accent used throughout the SecureLens UI, sitting between
        // Tailwind's default cyan-400 and cyan-500.
        cyan: {
          450: '#22c9e8',
        },
        slate: {
          850: '#151e2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
