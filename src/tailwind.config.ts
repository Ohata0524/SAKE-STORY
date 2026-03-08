import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // 全ファイルを対象にする
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1e1b4b',
          accent: '#6366f1',
          highlight: '#4f46e5',
        },
        // この定義が漏れているためビルドエラーになっています
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
