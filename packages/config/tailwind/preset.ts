import type { Config } from 'tailwindcss';

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5f2',
          100: '#d9e8de',
          200: '#b3d1be',
          300: '#7aae91',
          400: '#4a8c6a',
          500: '#1C5535',
          600: '#174a2e',
          700: '#133A24',
          800: '#0f2e1c',
          900: '#0b2215',
          950: '#07160d',
        },
        gold: {
          50: '#fdf9eb',
          100: '#faf0c7',
          200: '#f5e08f',
          300: '#efd058',
          400: '#D5AF00',
          500: '#b89700',
          600: '#957a00',
          700: '#725d00',
          800: '#504100',
          900: '#2d2500',
        },
        sand: {
          50: '#faf7f3',
          100: '#f2ece3',
          200: '#e8ddd0',
          300: '#D3BA9C',
          400: '#c4a680',
          500: '#b59264',
          600: '#9a7a50',
          700: '#7d623f',
          800: '#604b30',
          900: '#433421',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};

export default preset;
