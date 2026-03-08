import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // src配下の全ファイルをスキャン対象にする
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1e1b4b',   // 日本酒らしい濃紺
          accent: '#6366f1',    // 差し色の紫
          highlight: '#4f46e5', // ホバー時の色
        },
        // ここを確実に定義することで bg-surface-base が使えるようになる
        surface: {
          base: '#f9fafb',      // 背景の薄いグレー
          card: '#ffffff',      // カードの白
          dark: '#0f172a',      // モーダル等の濃い背景
        }
      },
      borderRadius: {
        'sake': '2rem',         // 特徴的な大きな角丸
      },
      fontFamily: {
        brand: ['var(--font-serif)', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
