/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",  // Ensure this is in the content array
    "./src/**/*.{js,jsx}" // Your source files for JSX/JSX
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
