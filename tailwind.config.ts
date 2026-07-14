import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Amber-500 primary and rose-600 accent already come from Tailwind's defaults.
      },
      minHeight: {
        dvh: "100dvh",
      },
    },
  },
  plugins: [],
};

export default config;
