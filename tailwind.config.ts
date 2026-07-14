import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Semantic palette driven by CSS variables in globals.css.
        // Same class names work in light + dark — only the CSS var values change.
        app: "hsl(var(--app) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "surface-strong": "hsl(var(--surface-strong) / <alpha-value>)",
        line: "hsl(var(--line) / <alpha-value>)",
        "line-strong": "hsl(var(--line-strong) / <alpha-value>)",
        fg: "hsl(var(--fg) / <alpha-value>)",
        "fg-muted": "hsl(var(--fg-muted) / <alpha-value>)",
        "fg-subtle": "hsl(var(--fg-subtle) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        "accent-strong": "hsl(var(--accent-strong) / <alpha-value>)",
        "accent-fg": "hsl(var(--accent-fg) / <alpha-value>)",
        danger: "hsl(var(--danger) / <alpha-value>)",
        "danger-fg": "hsl(var(--danger-fg) / <alpha-value>)",
      },
      minHeight: {
        dvh: "100dvh",
      },
    },
  },
  plugins: [],
};

export default config;
