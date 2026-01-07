// tailwind.config.mjs

import tailwindcssAnimate from "tailwindcss-animate";
import scrollbarHide from "tailwind-scrollbar-hide"; 

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // Tailwind 4에서는 배열 아님
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro",
          "Roboto",
          "sans-serif"
        ],
        serif: ["Georgia", "serif"],
        mono: ["Menlo", "monospace"],
      },

      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        primary: "var(--color-primary)",
        "primary-foreground": "var(--color-primary-foreground)",
        secondary: "var(--color-secondary)",
        "secondary-foreground": "var(--color-secondary-foreground)",
        accent: "var(--color-accent)",
        "accent-foreground": "var(--color-accent-foreground)",
        muted: "var(--color-muted)",
        "muted-foreground": "var(--color-muted-foreground)",
      },
      keyframes: {
        emojiFloat: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-60px)", opacity: "0" },
        },
        chatIn: {
          "0%": { opacity: "0", transform: "translateY(3px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "emoji-float": "emojiFloat 1.3s ease-out forwards",
        chat: "chatIn 0.15s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

