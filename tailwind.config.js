/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
  content: ["./src/**/*.{html,scss,ts}", "node_modules/preline/dist/*.js"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "10rem",
      },
    },

    fontFamily: {
      jost: ["Jost", "sans-serif"],
    },

    extend: {
      colors: {
        primary: colors.violet["600"],
        "primary-hover": colors.violet["700"],

        default: colors.slate,
      },
    },
  },
  plugins: [require("preline/plugin"), require("@tailwindcss/forms")],
};
