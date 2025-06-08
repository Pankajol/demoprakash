import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",       // ← enable manual `.dark` class switching
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
        container: {
      center: true,         // always center
      padding: "1rem",      // default side padding
      screens: {
        sm: "100%",         // full width on small
        md: "768px",        // fixed 768px on md+
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      serif: ["Merriweather", "serif"],
      mono: ["Menlo", "monospace"],
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};

export default config;

