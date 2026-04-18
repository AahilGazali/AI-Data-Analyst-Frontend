/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "sans-serif"],
      },
      colors: {
        surface: {
          DEFAULT: "#0f1419",
          raised: "#161b22",
          border: "#2d333b",
        },
        accent: {
          DEFAULT: "#10a37f",
          muted: "#0d8f6e",
        },
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(255,255,255,0.06), 0 8px 40px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
