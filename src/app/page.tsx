'use client';

import React from 'react';
import Link from 'next/link';
import { Search, User, ArrowRight } from 'lucide-react';
import { useHome } from '@/hooks/useHome';
import { Button } from '@/components/atoms/Button';
import { SakeCard } from '@/components/organisms/SakeCard';

const FILTERS = [
  { id: 1, label: "初心者おすすめ" },
  { id: 2, label: "甘口" },
  { id: 3, label: "辛口" },
  { id: 4, label: "ギフト用" },
  { id: 5, label: "自分用" },
];

export default function Home() {
  const { 
    sakes = [], 
    loading,
    keyword, 
    setKeyword, 
    showAgeModal, 
    handleSearch, 
    handleFilterClick, 
    handleAgeVerify 
  } = useHome();

  return (
    <main className="page-container">
      {/* 年齢確認モーダル */}
      {showAgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative bg-surface-dark w-full max-w-sm p-8 rounded-sake shadow-2xl text-center border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-2 font-serif">SAKE STORY</h2>
            <p className="text-lg font-bold text-white mb-8 leading-relaxed">20歳以上ですか？</p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleAgeVerify}>はい（入店する）</Button>
              <Button variant="ghost" onClick={() => alert("20歳未満は閲覧できません")}>いいえ</Button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-surface-card sticky top-0 z-10 shadow-sm p-5">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-serif font-bold text-brand-primary tracking-wide">SAKE STORY</h1>
          <Link href="/mypage"><User size={28} className="text-gray-600 hover:text-brand-primary transition" /></Link>
        </div>
      </header>

      <div className="section-container">
        {/* ヒーローセクション */}
        <section className="rounded-sake bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-12 md:p-20 text-center shadow-xl">
          <h2 className="text-3xl md:text-5xl font-serif mb-10 font-bold tracking-wider">物語で選ぶ、運命の一本</h2>
          <form onSubmit={handleSearch} className="w-full max-w-3xl bg-white rounded-full flex items-center px-6 py-4 mx-auto focus-within:scale-105 transition shadow-2xl">
            <Search className="text-gray-400 mr-4" size={24} />
            <input 
              type="text" placeholder="銘柄・酒造名で検索" value={keyword} 
              onChange={(e) => setKeyword(e.target.value)} 
              className="flex-grow text-gray-700 outline-none text-base"
            />
          </form>
        </section>

        {/* テーマで探す */}
        <section className="mt-16">
          <h3 className="section-title">テーマで探す</h3>
          <div className="flex flex-wrap gap-4">
            {FILTERS.map((item) => (
              <Button key={item.id} variant="outline" className="w-auto" onClick={() => handleFilterClick(item.label)}>
                {item.label}
              </Button>
            ))}
          </div>
        </section>

        {/* おすすめグリッド */}
        <section className="mt-16">
          <h3 className="section-title">今月のおすすめ</h3>
          {loading ? (
            <div className="text-center py-20 text-gray-400 font-bold">物語を読み込み中...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {sakes.map((sake) => <SakeCard key={sake.id} sake={sake} />)}
            </div>
          )}
        </section>

        <section className="mt-20">
          <Link href="/list" className="group block w-full bg-white border-4 border-dashed border-indigo-100 rounded-sake p-12 text-center hover:border-brand-accent hover:bg-indigo-50 transition">
            <h3 className="text-2xl font-bold text-brand-primary mb-6">あなただけの一本を見つける</h3>
            <span className="inline-flex items-center gap-3 bg-brand-primary text-white px-10 py-4 rounded-full font-bold shadow-lg group-hover:bg-brand-highlight transition">
              すべての日本酒を見る <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}