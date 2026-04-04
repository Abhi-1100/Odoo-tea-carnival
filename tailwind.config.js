/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#1a1a2e",
          card: "#2a2a3e",
          border: "#3a3a5e",
          primary: "#e84393",
          teal: "#00c9a7",
          success: "#22c55e",
          warning: "#f97316",
          danger: "#ef4444",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
