/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          900: '#0b0f14',
          800: '#121824',
          700: '#1a2332',
        },
      },
    },
  },
  plugins: [],
}

