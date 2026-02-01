'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Search, SlidersHorizontal, Filter } from 'lucide-react';
import { sakeListSchema } from '../../src/lib/zod/schemas';

// --- 型定義：Zodから自動生成 ---
import { z } from "zod";
import { sakeSchema } from '../../src/lib/zod/schemas';
type Sake = z.infer<typeof sakeSchema>;

const PREF_ORDER = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

function ListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialKeyword = searchParams.get('q') || '';
  const initialTaste = searchParams.get('taste') || '';

  const [sakes, setSakes] = useState<Sake[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [sortOrder, setSortOrder] = useState('newest');

  const getCurrentFilter = useCallback(() => {
    if (initialTaste === '甘口') return 'sweet';
    if (initialTaste === '辛口') return 'dry';
    if (initialKeyword === '初心者') return 'beginner';
    if (initialKeyword === 'ギフト') return 'gift';
    if (initialKeyword === '晩酌') return 'daily';
    return 'all';
  }, [initialTaste, initialKeyword]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'all') router.push('/list');
    else if (val === 'sweet') router.push('/list?taste=甘口');
    else if (val === 'dry') router.push('/list?taste=辛口');
    else if (val === 'beginner') router.push('/list?q=初心者');
    else if (val === 'gift') router.push('/list?q=ギフト');
    else if (val === 'daily') router.push('/list?q=晩酌');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/list?q=${encodeURIComponent(keyword)}`);
    }
  };

  const fetchSakes = useCallback(async (ignore: boolean) => {
    setLoading(true);
    
    const q = searchParams.get('q');
    const taste = searchParams.get('taste');

    let query = supabase.from('sakes').select('*');
    if (taste) {
      query = query.eq('taste', taste);
    } else if (q) {
      query = query.or(`name.ilike.%${q}%,brewery.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (sortOrder === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sortOrder === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else if (sortOrder !== 'prefecture') {
      query = query.order('id', { ascending: false });
    }

    const { data, error } = await query;

    if (ignore) return;

    if (error) {
      console.error('検索エラー:', error);
      setSakes([]);
    } else if (data) {
      const zodResult = sakeListSchema.safeParse(data);
      if (zodResult.success) {
        const result = [...zodResult.data];
        if (sortOrder === 'prefecture') {
          result.sort((a, b) => {
            const indexA = PREF_ORDER.indexOf(a.prefecture || "");
            const indexB = PREF_ORDER.indexOf(b.prefecture || "");
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
          });
        }
        setSakes(result);
      } else {
        console.error('データ形式エラー:', zodResult.error.format());
      }
    }
    setLoading(false);
  }, [searchParams, sortOrder]);

  useEffect(() => {
    let ignore = false;

    // setKeyword と fetchSakes を非同期の setTimeout にまとめる
    // これで画像 image_98715e.png の cascading renders エラーを解消します
    const timer = setTimeout(() => {
      if (!ignore) {
        const q = searchParams.get('q');
        setKeyword(q || ''); // ← ここを非同期にしました
        void fetchSakes(ignore);
      }
    }, 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [fetchSakes, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-10 py-6 flex items-center gap-6">
          <Link href="/" className="p-3 -ml-3 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-8 h-8 text-gray-600" />
          </Link>
          <form onSubmit={handleSearch} className="flex-1 flex items-center bg-gray-100 rounded-full px-6 py-3">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="銘柄・酒造名で検索" 
              className="bg-transparent border-none outline-none text-base w-full text-gray-700 placeholder-gray-400"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </form>
        </div>
      </header>

      <div className="w-full max-w-6xl mx-auto px-6 md:px-10 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="font-bold text-2xl text-gray-800 mb-2">
              {initialTaste ? `「${initialTaste}」のお酒` : (initialKeyword ? `「${initialKeyword}」の検索結果` : 'すべてのお酒')}
            </h2>
            <span className="text-sm text-gray-500 font-bold">{sakes.length}件が見つかりました</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select 
                value={getCurrentFilter()}
                onChange={handleFilterChange}
                className="bg-white border border-gray-200 text-gray-700 text-sm font-sans rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 pr-8"
              >
                <option value="all">すべての条件</option>
                <option value="beginner">初心者おすすめ</option>
                <option value="sweet">甘口</option>
                <option value="dry">辛口</option>
                <option value="gift">ギフト用</option>
                <option value="daily">自分用</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-5 h-5 text-gray-400" />
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-white border border-gray-200 text-gray-700 text-sm font-sans rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 pr-8"
              >
                <option value="newest">おすすめ順</option>
                <option value="price_asc">価格が安い順</option>
                <option value="price_desc">価格が高い順</option>
                <option value="prefecture">地域順 (北から)</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-20 text-gray-400 text-base">読み込み中...</p>
        ) : sakes.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-gray-400 mb-6 text-base">条件に合う日本酒が見つかりませんでした。</p>
            <Link href="/list" className="text-indigo-600 underline text-base font-bold">条件をクリアして全件表示</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            {sakes.map((sake) => (
              <Link href={`/list/${sake.id}`} key={sake.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition group border border-gray-100 flex flex-col">
                <div className="aspect-[4/5] bg-gray-100 relative flex items-center justify-center overflow-hidden">
                  {sake.image_url ? (
                    <img src={sake.image_url} alt={sake.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition duration-500" />
                  ) : (
                    <span className="text-gray-300 font-bold text-lg">No Image</span>
                  )}
                  {/* Zodに taste を追加したので、画像 image_986c82.png のエラーが消えます */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    {sake.taste && (
                      <span className="bg-white/95 backdrop-blur text-xs px-3 py-1 rounded-lg shadow-sm text-gray-700 font-bold">{sake.taste}</span>
                    )}
                    <span className="bg-indigo-900/95 backdrop-blur text-sm px-3 py-1.5 rounded-lg shadow-sm text-white font-bold">¥{sake.price?.toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-end">
                  <p className={`text-xs mb-2 font-bold leading-tight ${sortOrder === 'prefecture' ? 'text-indigo-600' : 'text-gray-600'}`}>
                    {sake.brewery} / {sake.prefecture}
                  </p>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-indigo-700 transition">{sake.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-base">Loading...</div>}>
      <ListContent />
    </Suspense>
  );
}

