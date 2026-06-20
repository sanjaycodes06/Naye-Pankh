/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // NayePankh brand palette
        brand: {
          50:  "#eef7f0",
          100: "#d5edda",
          200: "#aedbb8",
          300: "#7dc290",
          400: "#4ea56a",
          500: "#2d8a4e",   // Primary green — trust, growth, service
          600: "#226e3d",
          700: "#1a5530",
          800: "#133d22",
          900: "#0c2716",
        },
        earth: {
          50:  "#fdf8f2",
          100: "#f7ead8",
          200: "#edd4ae",
          300: "#e0b87d",
          400: "#d09a50",
          500: "#b87d32",   // Warm amber — warmth, community
          600: "#9a6425",
          700: "#7a4d1c",
          800: "#5c3814",
          900: "#3d240d",
        },
        ink: {
          50:  "#f6f7f8",
          100: "#eaecee",
          200: "#d0d5db",
          300: "#adb5be",
          400: "#828f9c",
          500: "#5f6e7c",
          600: "#465563",
          700: "#334050",
          800: "#1f2d3d",   // Deep navy for body text
          900: "#111c28",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body:    ["'DM Sans'", "system-ui", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        "card":  "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
        "card-md": "0 4px 12px -2px rgb(0 0 0 / 0.10), 0 2px 6px -2px rgb(0 0 0 / 0.06)",
        "card-lg": "0 12px 32px -4px rgb(0 0 0 / 0.12), 0 4px 12px -4px rgb(0 0 0 / 0.08)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-in":   "fadeIn 0.3s ease-out",
        "slide-up":  "slideUp 0.35s ease-out",
        "slide-in":  "slideIn 0.3s ease-out",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" },                  to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideIn: { from: { opacity: "0", transform: "translateX(-12px)" }, to: { opacity: "1", transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
};
