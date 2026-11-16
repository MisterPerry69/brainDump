import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";

import base from "./base";

export default {
  content: base.content,
  presets: [base],
  theme: {
    extend: {
      colors: {
        bd: {
          line: "hsl(var(--bd-line))",
          ink: "hsl(var(--bd-ink))",
          f1: "hsl(var(--bd-f1))",
          f2: "hsl(var(--bd-f2))",
          f3: "hsl(var(--bd-f3))",
          f4: "hsl(var(--bd-f4))",
          f5: "hsl(var(--bd-f5))",
        },
      },
      fontFamily: {
        sans: ["var(--font-archivo)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-border": {
          "0%, 100%": {
            "box-shadow": "0 0 0 0 gray",
          },
          "50%": {
            "box-shadow": "0 0 0 2px gray",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-border": "pulse-border 1s ease-in-out infinite",
      },
    },
  },
  plugins: [animate, typography],
} satisfies Config;
