import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Prompt', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Comico', 'Mitr', 'Prompt', 'Space Grotesk', 'sans-serif'],
        comico: ['Comico', 'Mitr', 'cursive', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "#FFFFFF",
        slate: {
          950: "#0F1012",
          900: "#17181A",
          800: "#27282D",
          700: "#374151",
          600: "#4B5563",
          500: "#6B7280",
          400: "#9CA3AF",
          300: "#D1D5DB",
          200: "#E8E9EC",
          100: "#F1F2F5",
          50: "#F7F8FA",
        },
        primary: {
          DEFAULT: "#17181A",
          hover: "#27282D",
          light: "#F1F2F5",
        },
        luxury: {
          gold: "#C9A96E",
          "gold-hover": "#B89658",
          "gold-light": "#FAF6EE",
          "gold-border": "#EADEC6",
          ai: "#8B7CF6",
          "ai-light": "#F5F3FF",
          "ai-border": "#DDD6FE",
          success: "#3FA77A",
          "success-light": "#ECFDF5",
          "success-border": "#A7F3D0",
        },
        border: "#E8E9EC",
      },
      borderRadius: {
        'luxury': '16px',
        'luxury-sm': '14px',
        'luxury-lg': '18px',
        'luxury-xl': '22px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.25s ease-out both',
        'slide-in-left': 'slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      boxShadow: {
        'luxury-sm': '0 1px 2px rgba(0, 0, 0, 0.03)',
        'luxury-card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'luxury-hover': '0 6px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'luxury-lg': '0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
};
export default config;
