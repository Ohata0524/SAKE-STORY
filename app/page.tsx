'use client'; 

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from './lib/supabaseClient';
import { sakeListSchema } from '../src/lib/zod/schemas'; 

import { z } from "zod";
import { sakeSchema } from '../src/lib/zod/schemas';
type Sake = z.infer<typeof sakeSchema>;

const FILTERS = [
  { id: 1, label: "初心者おすすめ" },
  { id: 2, label: "甘口" },
  { id: 3, label: "辛口" },
  { id: 4, label: "ギフト用" },
  { id: 5, label: "自分用" },
];

export default function Home() {
  const router = useRouter();
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [sakes, setSakes] = useState<Sake[]>([]);
  const [keyword, setKeyword] = useState('');

  const fetchRecommendations = useCallback(async (ignore: boolean) => {
    const { data, error } = await supabase.from('sakes').select('*').limit(8);
    
    if (error || ignore) return;

    if (data) {
      const result = sakeListSchema.safeParse(data);
      if (result.success && !ignore) {
        setSakes(result.data);
      }
    }
  }, []);

  useEffect(() => {
    // 競合を防ぐためのフラグ（Defense in Depth の考え方）
    let ignore = false;

    const initialize = async () => {
      // 1. 年齢確認のチェック
      const isVerified = localStorage.getItem('ageVerified');
      
      // 非同期のコンテキストで実行することで Cascading Renders を回避
      if (!isVerified && !ignore) {
        setShowAgeModal(true);
      }

      // 2. おすすめの取得
      await fetchRecommendations(ignore);
    };

    // 実行を微小に遅らせて、最初のレンダリングサイクルから切り離す
    const timer = setTimeout(() => {
      void initialize();
    }, 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [fetchRecommendations]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (keyword.trim()) {
      router.push(`/list?q=${encodeURIComponent(keyword)}`);
    }
  };

  const handleFilterClick = (label: string) => {
    if (label === '甘口' || label === '辛口') {
      router.push(`/list?taste=${encodeURIComponent(label)}`);
    } else {
      let searchWord = label;
      if (label === '初心者おすすめ') searchWord = '初心者';
      if (label === 'ギフト用') searchWord = 'ギフト';
      if (label === '自分用') searchWord = '晩酌';
      router.push(`/list?q=${encodeURIComponent(searchWord)}`);
    }
  };

  const handleEnter = () => {
    localStorage.setItem('ageVerified', 'true');
    setShowAgeModal(false);
  };

  const handleLeave = () => {
    alert("申し訳ございませんが、20歳未満の方はご利用いただけません。");
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {showAgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative bg-slate-900 w-full max-w-sm p-8 rounded-2xl shadow-2xl text-center border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-2 tracking-wide font-serif">SAKE STORY</h2>
            <div className="w-full h-px bg-slate-700 my-4"></div>
            <p className="text-lg font-bold text-white mb-4">20歳以上ですか？</p>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              本サイトはお酒に関する情報を扱っています。<br />
              20歳未満の方の閲覧は固くお断りいたします。
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleEnter} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-900/50">はい（入店する）</button>
              <button onClick={handleLeave} className="w-full bg-transparent border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 font-medium py-3 rounded-lg transition-colors">いいえ</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-12 flex justify-between items-center py-5">
          <h1 className="text-3xl font-serif font-bold text-blue-900 tracking-wide">SAKE STORY</h1>
          <div className="flex gap-4 text-gray-600">
            <Link href="/mypage">
              <User size={28} className="cursor-pointer hover:text-blue-900 transition" />
            </Link>
          </div>
        </div>
      </header>

      <div className="w-full max-w-6xl mx-auto px-6 md:px-12 mt-8">
        <section className="rounded-[2rem] overflow-hidden relative bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col justify-center items-center text-white p-12 md:p-20 shadow-xl">
          <h2 className="text-3xl md:text-5xl font-serif text-center mb-10 leading-tight font-bold tracking-wider">
            物語で選ぶ、<br className="md:hidden" />運命の一本
          </h2>
          <form onSubmit={handleSearch} className="w-full max-w-3xl bg-white rounded-full flex items-center px-6 py-4 shadow-2xl transition-transform focus-within:scale-105">
            <Search className="text-gray-400 mr-4" size={24} />
            <input type="text" placeholder="銘柄・酒造名で検索" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="flex-grow text-base text-gray-700 outline-none placeholder-gray-400"/>
          </form>
        </section>

        <section className="mt-16">
          <div className="mb-6"><h3 className="text-2xl font-bold text-gray-800 border-l-8 border-indigo-500 pl-4">テーマで探す</h3></div>
          <div className="flex flex-wrap gap-4">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleFilterClick(item.label)} 
                className="px-6 py-3 rounded-full text-sm font-bold transition-colors border-2 bg-white text-gray-600 border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 shadow-sm"
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 border-l-8 border-indigo-500 pl-4">今月のおすすめ</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
            {sakes.length === 0 ? (
              <p className="text-gray-400 col-span-full text-center py-10 text-base">読み込み中...</p>
            ) : (
              sakes.map((sake) => (
                <Link href={`/list/${sake.id}`} key={sake.id} className="group cursor-pointer block">
                  <div className="relative w-full aspect-[4/5] bg-gray-200 rounded-2xl mb-4 overflow-hidden shadow-md flex items-center justify-center group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                    {sake.image_url ? (
                      <img src={sake.image_url} alt={sake.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 font-bold opacity-50 text-xl">No Image</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-indigo-700 transition">{sake.name}</h4>
                    <p className="text-sm text-gray-600 font-bold">{sake.brewery}{sake.prefecture && ` / ${sake.prefecture}`}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="mt-20 mb-12">
          <Link href="/list" className="group block w-full bg-white border-4 border-dashed border-indigo-100 rounded-[2rem] p-12 text-center hover:border-indigo-400 hover:bg-indigo-50 transition duration-300">
            <h3 className="text-2xl font-bold text-indigo-900 mb-6 group-hover:text-indigo-700">あなただけの一本を見つける</h3>
            <span className="inline-flex items-center justify-center gap-3 bg-indigo-900 text-white px-10 py-4 rounded-full font-bold text-base shadow-lg group-hover:bg-indigo-700 group-hover:shadow-2xl transition transform group-hover:scale-105">
              すべての日本酒を見る ({sakes.length > 0 ? sakes.length : '-'}種)
              <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}

