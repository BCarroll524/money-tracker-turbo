/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    fontFamily: {
      asap: ["Asap", "sans-serif"],
      inter: ["Inter", "sans-serif"],
    },
    boxShadow: {
      sm: "var(--shadow-elevation-low)",
      md: "var(--shadow-elevation-medium)",
    },
    extend: {
      colors: {
        black: {
          100: "hsl(0, 0%, 13%)",
          200: "hsl(0, 0%, 9%)",
          300: "hsl(0, 0%, 7%)",
        },
        white: "hsl(0, 0%, 100%)",
        gray: {
          100: "hsl(0, 0%, 67%)",
          200: "hsl(0, 0%, 42%)",
        },
        red: "hsl(1, 96%, 65%)",
        yellow: "hsl(37, 96%, 61%)",
        green: "hsl(129, 60%, 47%)",
        purple: "hsl(250, 38%, 46%)",
        transparent: "transparent",
      },
      gridTemplateColumns: {
        "auto-1fr": "auto 1fr",
      },
      boxShadow: {
        btn: "var(--layered-shadow)",
      },
    },
  },
  plugins: [],
};
