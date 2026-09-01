/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ayush: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        herb: {
          DEFAULT: '#1b4332',
          light: '#2d6a4f',
          dark: '#081c15',
          gold: '#d4a373',
          amber: '#e76f51',
          sand: '#fefae0',
          sage: '#ccd5ae',
          slate: '#2b2d42'
        },
        vata: {
          bg: '#f0f9ff',
          text: '#0369a1',
          border: '#bae6fd',
          accent: '#0284c7',
        },
        pitta: {
          bg: '#fff7ed',
          text: '#c2410c',
          border: '#ffedd5',
          accent: '#ea580c',
        },
        kapha: {
          bg: '#f0fdf4',
          text: '#15803d',
          border: '#bbf7d0',
          accent: '#16a34a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
