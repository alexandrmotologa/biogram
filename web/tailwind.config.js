/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        squircle: "24px",
      },
      colors: {
        // Obsidian theme
        obsidian: {
          bg: "#0a0a0f",
          card: "rgba(20, 20, 30, 0.8)",
          border: "rgba(255, 255, 255, 0.08)",
          accent: "#7c3aed",
          "accent-soft": "rgba(124, 58, 237, 0.15)",
          text: "#e4e4e7",
          "text-muted": "#71717a",
        },
        // Cyberpunk theme
        cyber: {
          bg: "#0d0015",
          card: "rgba(25, 0, 50, 0.75)",
          border: "rgba(236, 72, 153, 0.3)",
          accent: "#ec4899",
          "accent-alt": "#06b6d4",
          text: "#f0f0ff",
          "text-muted": "#a78bfa",
        },
        // Glassmorphic theme
        glass: {
          bg: "#0f172a",
          card: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.1)",
          accent: "#14b8a6",
          text: "#f1f5f9",
          "text-muted": "#94a3b8",
        },
        // Minimal Paper theme
        paper: {
          bg: "#fafaf9",
          card: "#ffffff",
          border: "#e7e5e4",
          accent: "#292524",
          text: "#1c1917",
          "text-muted": "#78716c",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
