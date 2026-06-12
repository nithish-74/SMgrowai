import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#05050a",
        bg2: "#0c0c14",
        bg3: "#12121e",
        surface: "#16161f",
        surface2: "#1e1e2e",
        lime: "#b8ff57",
        "lime-dim": "#96d943",
        violet: "#8b5cf6",
        "violet-light": "#a78bfa",
        pink: "#f472b6",
        cyan: "#22d3ee",
        text: "#f0eeff",
        text2: "#a09ab8",
        text3: "#5c5878",
        background: "#05050a",
        foreground: "#f0eeff",
        card: {
          DEFAULT: "#16161f",
          foreground: "#f0eeff",
        },
        popover: {
          DEFAULT: "#16161f",
          foreground: "#f0eeff",
        },
        primary: {
          DEFAULT: "#b8ff57",
          foreground: "#05050a",
        },
        secondary: {
          DEFAULT: "#1e1e2e",
          foreground: "#f0eeff",
        },
        muted: {
          DEFAULT: "#12121e",
          foreground: "#a09ab8",
        },
        accent: {
          DEFAULT: "#8b5cf6",
          foreground: "#05050a",
        },
        destructive: {
          DEFAULT: "#f472b6",
          foreground: "#05050a",
        },
        border: "rgba(255,255,255,.12)",
        input: "#12121e",
        ring: "#b8ff57",
        chart: {
          "1": "#b8ff57",
          "2": "#8b5cf6",
          "3": "#f472b6",
          "4": "#22d3ee",
          "5": "#a78bfa",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
