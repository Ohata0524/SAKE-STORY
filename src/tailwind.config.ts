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
        // 意味に基づいた色の定義
        brand: {
          primary: '#1e1b4b',   // 元の indigo-900
          secondary: '#312e81', // 明るめの紺
          accent: '#4f46e5',    // アクセントの紫
        },
        surface: {
          base: '#f9fafb',      // 背景色 gray-50
          card: '#ffffff',      // カード等の白
          dark: '#0f172a',      // モーダル背景等の濃い色
        }
      },
      borderRadius: {
        // あなたが多用している 2rem を「sake」という名前で共通化
        'sake': '2rem',
      },
      fontFamily: {
        // セリフ体（明朝体系）を「brand」として定義
        brand: ['var(--font-serif)', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
