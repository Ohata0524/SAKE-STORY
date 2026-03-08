'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, SlidersHorizontal, Filter as FilterIcon } from 'lucide-react';
import { useSakeList } from '@/hooks/useSakeList';
import { Select } from '@/components/atoms/Select';
import { SakeListCard } from '@/components/organisms/SakeListCard';

function ListContent() {
  const router = useRouter();
  const {
    sakes, loading, keyword, setKeyword, sortOrder, setSortOrder,
    initialTaste, initialKeyword, getCurrentFilter
  } = useSakeList();

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const paths: Record<string, string> = {
      all: '/list',
      sweet: '/list?taste=甘口',
      dry: '/list?taste=辛口',
      beginner: '/list?q=初心者',
      gift: '/list?q=ギフト',
      daily: '/list?q=晩酌'
    };
    router.push(paths[val] || '/list');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(keyword.trim() ? `/list?q=${encodeURIComponent(keyword)}` : '/list');
  };

  return (
    <div className="page-container">
      {/* ヘッダー：bg-surface-card を適用 */}
      <header className="bg-surface-card sticky top-0 z-10 border-b border-gray-100 p-6">
        <div className="w-full max-w-6xl mx-auto flex items-center gap-6">
          <Link href="/" className="p-3 -ml-3 hover:bg-surface-base rounded-full transition group">
            <ArrowLeft className="w-8 h-8 text-gray-600 group-hover:text-brand-accent transition" />
          </Link>
          {/* 検索バー：bg-surface-base を適用 */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center bg-surface-base rounded-full px-6 py-3 border border-transparent focus-within:border-brand-accent transition-all">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input 
              type="text" placeholder="銘柄・酒造名で検索" 
              className="bg-transparent border-none outline-none text-base w-full text-gray-700 placeholder-gray-400"
              value={keyword} onChange={(e) => setKeyword(e.target.value)}
            />
          </form>
        </div>
      </header>

      <main className="section-container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="font-bold text-2xl text-gray-800 mb-2 font-serif">
              {initialTaste ? `「${initialTaste}」のお酒` : (initialKeyword ? `「${initialKeyword}」の検索結果` : 'すべてのお酒')}
            </h2>
            <span className="text-sm text-gray-500 font-bold">{sakes.length}件が見つかりました</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Select 
              icon={<FilterIcon className="w-5 h-5 text-gray-400" />} 
              value={getCurrentFilter()} onChange={handleFilterChange}
            >
              <option value="all">すべての条件</option>
              <option value="beginner">初心者おすすめ</option>
              <option value="sweet">甘口</option>
              <option value="dry">辛口</option>
              <option value="gift">ギフト用</option>
              <option value="daily">自分用</option>
            </Select>

            <Select 
              icon={<SlidersHorizontal className="w-5 h-5 text-gray-400" />} 
              value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">おすすめ順</option>
              <option value="price_asc">価格が安い順</option>
              <option value="price_desc">価格が高い順</option>
              <option value="prefecture">地域順 (北から)</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-20 text-gray-400 font-medium">物語を読み込み中...</p>
        ) : sakes.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-gray-400 mb-6 font-medium">条件に合う日本酒が見つかりませんでした。</p>
            <Link href="/list" className="text-brand-accent hover:text-brand-highlight underline font-bold transition">条件をクリアして全件表示</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
            {sakes.map((sake) => (
              <SakeListCard key={sake.id} sake={sake} sortOrder={sortOrder} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ListPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-400 font-medium">Loading...</div>}>
      <ListContent />
    </Suspense>
  );
}
