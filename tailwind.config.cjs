/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        works: ['Source Code Pro'],
        body: ['Source Sans Pro'],
        display: ['Work Sans']
      },

      colors: {
        foreground:
          'rgba(var(--vc-colors-text-foreground), var(--tw-text-opacity))',
        muted: 'rgba(var(--vc-colors-text-muted), var(--tw-text-opacity))',
        background: 'rgba(var(--vc-colors-bg-base), var(--tw-bg-opacity))',
        fill: 'rgba(var(--vc-colors-bg-fill), var(--tw-bg-opacity))'
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@vechaiui/core')]
};
