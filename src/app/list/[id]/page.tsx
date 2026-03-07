'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ArrowLeft, Heart, BookOpen, Snowflake, Thermometer, Flame, 
  Fish, Pizza, Utensils, Star, User, Quote 
} from 'lucide-react';

// アーキテクチャ刷新に基づいたパスエイリアス (@/) でのインポート
import { supabase } from '@/infrastructure/supabase/supabaseClient';
import { sakeRepository } from '@/infrastructure/repositories/sakeRepository';
import { favoriteRepository } from '@/infrastructure/repositories/favoriteRepository';
import { reviewSchema, type ReviewInput } from '@/domain/schemas/schemas';
import { Sake } from '@/domain/models/sake';

// --- 内部型定義 ---
type RecommendationLevel = 'double_circle' | 'circle' | 'triangle';

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  tags: {
    taste: string;
    region: string;
    priceRange: string;
  };
  storyContent: string;
  recommendations: {
    cold: RecommendationLevel;
    room: RecommendationLevel;
    hot: RecommendationLevel;
  };
  pairings: {
    name: string;
    type: 'fish' | 'cheese' | 'meat' | 'other';
  }[];
  officialUrl: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  user_name?: string;
}

// --- サブコンポーネント ---

const LevelIcon = ({ level }: { level: RecommendationLevel }) => {
  switch (level) {
    case 'double_circle': return <span className="text-3xl font-black text-indigo-900 block mt-2">◎</span>;
    case 'circle': return <span className="text-2xl font-bold text-gray-400 block mt-2">○</span>;
    case 'triangle': return <span className="text-xl text-gray-300 block mt-2">△</span>;
    default: return null;
  }
};

const StorySection = ({ markdown }: { markdown: string }) => (
  <section className="relative bg-white border-4 border-indigo-900 rounded-[2rem] p-8 md:p-12 shadow-xl overflow-hidden isolate">
    <div className="absolute -right-10 -bottom-10 text-indigo-50 opacity-60 -z-10 transform rotate-12">
      <BookOpen size={240} />
    </div>
    <div className="flex flex-col gap-5 mb-8 relative z-10">
      <div className="self-start bg-indigo-900 text-white text-base font-bold px-5 py-2 rounded-full tracking-widest flex items-center gap-2 shadow-md">
        <BookOpen className="w-5 h-5" />
        SAKE STORY
      </div>
      <h3 className="font-serif font-bold text-2xl md:text-3xl text-gray-900 border-b-4 border-indigo-100 pb-5 leading-tight">
        物語 - この一本が生まれるまで
      </h3>
    </div>
    <div className="prose prose-lg prose-slate max-w-none font-serif">
      <ReactMarkdown
        components={{
          p: ({ ...props }) => <p className="mb-8 leading-9 tracking-wide text-lg font-medium text-gray-900" {...props} />
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
    <div className="flex justify-end mt-2">
      <Quote className="w-10 h-10 text-indigo-200 transform rotate-180" />
    </div>
  </section>
);

const DrinkStyleItem = ({ icon, label, level }: { icon: React.ReactNode, label: string, level: RecommendationLevel }) => {
  const isBest = level === 'double_circle';
  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl ${isBest ? 'bg-indigo-50 border-2 border-indigo-100' : ''}`}>
      {icon}
      <span className={`text-base font-bold mt-2 ${isBest ? 'text-indigo-900' : 'text-gray-600'}`}>{label}</span>
      <LevelIcon level={level} />
    </div>
  );
};

// --- レビューセクション ---
const ReviewSection = ({ sakeId }: { sakeId: number }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  const currentRating = watch("rating");

  const fetchReviews = useCallback(async (isMounted: boolean) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('sake_id', sakeId)
      .order('created_at', { ascending: false });

    if (isMounted) {
      if (error) console.error('レビュー取得失敗:', error);
      else setReviews(data || []);
    }
  }, [sakeId]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted) {
        setUser(user);
        void fetchReviews(isMounted);
      }
    };
    init();
    return () => { isMounted = false; };
  }, [sakeId, fetchReviews]);

  const onSubmit = async (data: ReviewInput) => {
    if (!user) return alert('ログインしてください');
    const userName = user.email ? user.email.split('@')[0] : '名無し';
    
    const { error } = await supabase.from('reviews').insert({
      sake_id: sakeId,
      user_id: user.id,
      user_name: userName,
      rating: data.rating,
      comment: data.comment
    });

    if (!error) {
      alert('レビューを投稿しました！');
      reset();
      void fetchReviews(true);
    }
  };

  return (
    <section className="flex flex-col items-center w-full pt-12 border-t border-gray-200 mt-10">
      <h3 className="font-bold text-2xl mb-8">みんなのレビュー</h3>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {reviews.length === 0 ? (
          <div className="md:col-span-2 text-center text-gray-400 py-12 bg-gray-50 rounded-[2rem]">
            まだレビューはありません。
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-gray-50 p-6 rounded-[2rem] shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">{review.user_name || '日本酒好きさん'}</p>
                  <div className="flex text-yellow-500 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-900 leading-relaxed font-medium">{review.comment}</p>
            </div>
          ))
        )}
      </div>
      {user && (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-3xl bg-white p-8 rounded-[2rem] border border-gray-200 shadow-md">
          <p className="font-bold text-lg mb-4">レビューを書く</p>
          <div className="flex gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((num) => (
              <button key={num} type="button" onClick={() => setValue("rating", num)} className="hover:scale-110 transition">
                <Star className={`w-10 h-10 ${num <= currentRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
          <textarea {...register("comment")} className="w-full border border-gray-300 p-5 rounded-2xl mb-6 min-h-[120px]" placeholder="感想を教えてください..." />
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-indigo-900 text-white rounded-2xl font-bold text-lg hover:bg-indigo-800 transition disabled:opacity-50">
            投稿する
          </button>
        </form>
      )}
    </section>
  );
};

// --- メインページ ---
export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  const fetchSake = useCallback(async (isMounted: boolean) => {
    const sakeId = Number(id); // 数値にキャスト
    if (isNaN(sakeId)) {
      if (isMounted) setLoading(false);
      return;
    }

    try {
      // 修正：リポジトリの findById を呼び出し
      const data = await sakeRepository.findById(sakeId);
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user;

      if (!isMounted) return;
      setUser(currentUser);

      if (currentUser && data) {
        // 修正：お気に入り確認
        const fav = await favoriteRepository.isFavorite(currentUser.id, sakeId);
        setIsFavorite(fav);
      }

      if (data) {
        // UI用の型へ変換。Sakeモデルにフィールドを追加したのでエラーが消えます
        const mapped: Product = {
          id: data.id,
          name: data.name,
          imageUrl: data.image_url || 'https://placehold.co/800x800?text=No+Image',
          storyContent: data.description || '説明文がありません。',
          tags: {
            taste: data.taste || 'ー',
            region: data.prefecture || 'ー',
            priceRange: data.price ? `¥${data.price.toLocaleString()}` : 'ー',
          },
          recommendations: {
            cold: (data.rec_cold as RecommendationLevel) || 'circle',
            room: (data.rec_room as RecommendationLevel) || 'circle',
            hot: (data.rec_hot as RecommendationLevel) || 'circle',
          },
          pairings: [{ 
            name: data.pairing_name || 'おすすめ料理', 
            // anyを排除
            type: (data.pairing_type as 'fish' | 'cheese' | 'meat' | 'other') || 'other' 
          }],
          officialUrl: data.official_url || `https://www.google.com/search?q=${encodeURIComponent(data.name)}`
        };
        setProduct(mapped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    void fetchSake(isMounted);
    return () => { isMounted = false; };
  }, [fetchSake]);

  const toggleFavorite = async () => {
    if (!user) return alert('ログインが必要です');
    const sakeId = Number(id);
    if (isFavorite) {
      await favoriteRepository.remove(user.id, sakeId);
      setIsFavorite(false);
    } else {
      await favoriteRepository.add(user.id, sakeId);
      setIsFavorite(true);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">見つかりませんでした</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full max-w-6xl mx-auto bg-white min-h-screen md:my-8 md:rounded-[2rem] md:shadow-2xl pb-32 relative">
        <header className="flex justify-between items-center p-6 sticky top-0 bg-white/95 backdrop-blur-md z-20 border-b border-gray-100">
          <Link href="/list" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-7 h-7" />
          </Link>
          <h1 className="font-bold text-xl">SAKE STORY</h1>
          <button onClick={toggleFavorite} className="p-2 hover:bg-gray-100 rounded-full transition">
            <Heart className={`w-7 h-7 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-800'}`} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 p-6 lg:p-12">
          <div className="lg:col-span-5">
            <div className="aspect-square bg-gray-50 rounded-[2rem] overflow-hidden relative border border-gray-100 shadow-inner">
              <Image 
                src={product.imageUrl} 
                alt={product.name} 
                fill 
                className="object-cover mix-blend-multiply hover:scale-105 transition duration-700" 
              />
            </div>
          </div>
          <div className="lg:col-span-7 space-y-12">
            <section className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900">{product.name}</h2>
              <div className="flex flex-wrap gap-3 text-sm font-bold text-gray-600">
                <span className="bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">{product.tags.taste}</span>
                <span className="bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">{product.tags.region}</span>
                <span className="bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">{product.tags.priceRange}</span>
              </div>
            </section>
            
            <StorySection markdown={product.storyContent} />

            <section className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-5 text-center border-b pb-3">おすすめの温度帯</h4>
                  <div className="flex gap-3 justify-between">
                    <DrinkStyleItem icon={<Snowflake className="w-8 h-8 text-blue-400" />} label="冷酒" level={product.recommendations.cold} />
                    <DrinkStyleItem icon={<Thermometer className="w-8 h-8 text-green-600" />} label="常温" level={product.recommendations.room} />
                    <DrinkStyleItem icon={<Flame className="w-8 h-8 text-red-500" />} label="熱燗" level={product.recommendations.hot} />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                  <h4 className="font-bold text-gray-800 mb-5 text-center border-b pb-3 w-full">おすすめペアリング</h4>
                  <Utensils className="w-12 h-12 mb-3 text-indigo-500" />
                  <span className="text-xl font-bold text-gray-800 mt-1">{product.pairings[0].name}</span>
                </div>
              </div>
            </section>

            <ReviewSection sakeId={product.id} />

            <div className="hidden lg:flex justify-center pt-6">
              <a 
                href={product.officialUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full max-w-md bg-black text-white py-4 rounded-2xl font-bold text-center shadow-xl hover:bg-gray-800 transition transform active:scale-[0.98]"
              >
                公式サイトへ移動
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
