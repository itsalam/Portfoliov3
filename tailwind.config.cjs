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
        'theme-green': '#739E89',
        'theme-highlight': '#82E1B3',
        'theme-mute': '#CCE1C7',
        'theme-tan': '#E2DCC8'
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@vechaiui/core')]
};
