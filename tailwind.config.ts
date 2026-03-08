import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1e1b4b',
          accent: '#6366f1',
          highlight: '#4f46e5',
        },
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
