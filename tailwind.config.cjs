/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');
module.exports = {
  corePlugins: {
    preflight: false
  },
  darkMode: 'class',
  content: ['./src/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        code: ['Source Code Pro'],
        body: ['Source Sans Pro'],
        display: ['Work Sans']
      },
      screens: {
        tall: { raw: '(min-height: 800px)' }
      },
      colors: {
        'primary-color': 'var(--mantine-color-primaryColor-5)',
        background: 'rgba(var(--mantine-bg), 1)'
      }
    }
  },
  plugins: []
};
