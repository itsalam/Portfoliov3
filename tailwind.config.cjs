/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "theme-green": "#739E89",
        "theme-highlight":  "#82E1B3",
        "theme-mute": "#CCE1C7",
        "theme-tan": "#E2DCC8"
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@vechaiui/core"),
  ],
}
