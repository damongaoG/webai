/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
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
      sans: [
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        '"Noto Sans"',
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
      serif: [
        "ui-serif",
        "Georgia",
        "Cambria",
        '"Times New Roman"',
        "Times",
        "serif",
      ],
      mono: [
        "ui-monospace",
        "SFMono-Regular",
        '"SF Mono"',
        "Consolas",
        '"Liberation Mono"',
        "Menlo",
        "Monaco",
        "Courier",
        "monospace",
      ],
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
