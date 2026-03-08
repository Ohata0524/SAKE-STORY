import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1e1b4b',
          accent: '#6366f1',
          highlight: '#4f46e5',
        },
        // ここを確実に定義することで bg-surface-base が使えるようになります
        surface: {
          base: '#f9fafb',
          card: '#ffffff',
          dark: '#0f172a',
        }
      },
      borderRadius: {
        'sake': '2rem',
      },
      fontFamily: {
        brand: ['var(--font-serif)', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
