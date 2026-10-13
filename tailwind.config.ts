import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border-default))",
        input: "hsl(var(--border-default))",
        ring: "hsl(var(--border-hover))",
        background: "hsl(var(--bg-canvas))",
        foreground: "hsl(var(--foreground))",
        surface: {
          base: "hsl(var(--bg-canvas))",
          layout: "hsl(var(--surface-layout))",
          card: "hsl(var(--surface-card))",
          hover: "hsl(var(--surface-hover))",
          elevated: "hsl(var(--surface-overlay))",
        },
        primary: {
          DEFAULT: "hsl(var(--foreground))",
          foreground: "hsl(var(--bg-canvas))",
        },
        secondary: {
          DEFAULT: "hsl(var(--surface-hover))",
          foreground: "hsl(var(--foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--semantic-rose))",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "hsl(var(--surface-layout))",
          foreground: "hsl(var(--foreground-muted))",
        },
        accent: {
          DEFAULT: "hsl(var(--surface-hover))",
          foreground: "hsl(var(--foreground))",
        },
        semantic: {
          blue: "hsl(var(--semantic-blue))",
          emerald: "hsl(var(--semantic-emerald))",
          rose: "hsl(var(--semantic-rose))",
          amber: "hsl(var(--semantic-amber))",
        },
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
