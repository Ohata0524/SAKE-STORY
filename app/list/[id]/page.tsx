'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../../lib/supabaseClient';
import { 
  ArrowLeft, Heart, BookOpen, Snowflake, Thermometer, Flame, 
  Fish, Pizza, Utensils, Star, User, ExternalLink, Quote 
} from 'lucide-react';

// 型定義
type RecommendationLevel = 'double_circle' | 'circle' | 'triangle';

interface SakeDatabaseRow {
  id: number;
  name: string;
  image_url: string | null;
  description: string | null;
  taste: string | null;
  polishing: string | null;
  prefecture: string | null;
  price: number | null;
  brewery: string | null;
  official_url?: string | null;
  rec_cold?: string | null;
  rec_room?: string | null;
  rec_hot?: string | null;
  pairing_name?: string | null;
  pairing_type?: string | null;
}

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  tags: {
    taste: string;
    polishing: string;
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

// 物語セクション
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
          p: ({node, ...props}) => <p className="mb-8 leading-9 tracking-wide text-lg font-medium text-gray-900" {...props} />
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

const LevelIcon = ({ level }: { level: RecommendationLevel }) => {
  switch (level) {
    case 'double_circle': return <span className="text-3xl font-black text-indigo-900 block mt-2">◎</span>;
    case 'circle': return <span className="text-2xl font-bold text-gray-400 block mt-2">○</span>;
    case 'triangle': return <span className="text-xl text-gray-300 block mt-2">△</span>;
    default: return null;
  }
};

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

const DrinkStyle = ({ recommendations }: { recommendations: Product['recommendations'] }) => (
  <div className="w-full bg-white p-6 rounded-[2rem] border border-gray-200 h-full flex flex-col justify-center shadow-sm">
    <h4 className="font-bold text-gray-800 mb-5 text-center border-b-2 border-gray-100 pb-3 text-lg">おすすめの温度帯</h4>
    <div className="flex gap-3 justify-between">
      <DrinkStyleItem icon={<Snowflake className="w-8 h-8 text-blue-400" />} label="冷酒" level={recommendations.cold} />
      <DrinkStyleItem icon={<Thermometer className="w-8 h-8 text-green-600" />} label="常温" level={recommendations.room} />
      <DrinkStyleItem icon={<Flame className="w-8 h-8 text-red-500" />} label="熱燗" level={recommendations.hot} />
    </div>
  </div>
);

const Pairing = ({ pairings }: { pairings: Product['pairings'] }) => {
  const getIcon = (type: string) => {
    const className = "w-12 h-12 mb-3";
    switch (type) {
      case 'fish': return <Fish className={`${className} text-blue-500`} />;
      case 'cheese': return <Pizza className={`${className} text-yellow-500`} />;
      case 'meat': return <Utensils className={`${className} text-red-500`} />;
      default: return <Utensils className={`${className} text-gray-500`} />;
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-[2rem] border border-gray-200 h-full flex flex-col justify-center shadow-sm">
      <h4 className="font-bold text-gray-800 mb-5 text-center border-b-2 border-gray-100 pb-3 text-lg">おすすめペアリング</h4>
      <div className="flex-1 flex items-center justify-center">
        {pairings.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            {getIcon(item.type)}
            <span className="text-xl font-bold text-gray-800 mt-1">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// レビュー機能 
const ReviewSection = ({ sakeId }: { sakeId: number }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    if (!sakeId) return;

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('sake_id', sakeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('読み込みエラー:', error);
    } else {
      setReviews(data || []);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      fetchReviews();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sakeId]);

  const handleSubmit = async () => {
    if (!comment) return alert('コメントを入力してください');
    if (!user) return alert('ログインしてください');

    setIsSubmitting(true);

    //ユーザー名（メールの@前）を自動取得
    const userName = user.email ? user.email.split('@')[0] : '名無し';

    const { error } = await supabase.from('reviews').insert({
      sake_id: sakeId,
      user_id: user.id,
      user_name: userName, //自動取得した名前を保存
      rating: rating,
      comment: comment
    });

    if (error) {
      console.error('投稿エラー:', error);
      alert('投稿に失敗しました: ' + error.message);
    } else {
      alert('レビューを投稿しました！');
      setComment('');
      fetchReviews();
    }
    setIsSubmitting(false);
  };

  return (
    <section className="flex flex-col items-center w-full pt-12 border-t border-gray-200 mt-10">
      <div className="text-center mb-8">
        <h3 className="font-bold text-2xl">みんなのレビュー</h3>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="flex items-center text-black font-bold text-3xl">
             <Star className="w-8 h-8 fill-black mr-2" />
             {reviews.length > 0 
               ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) 
               : '-'}
          </div>
          <span className="text-gray-500 text-sm">({reviews.length}件)</span>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {reviews.length === 0 ? (
          <div className="md:col-span-2 text-center text-gray-400 py-12 bg-gray-50 rounded-[2rem] text-base">
            まだレビューはありません。<br/>最初の感想を書いてみませんか？
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-gray-50 p-6 rounded-[2rem] text-left shadow-sm h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  
                  <p className="text-sm font-bold text-gray-700">
                    {review.user_name || '日本酒好きさん'}
                  </p>
                  <div className="flex text-yellow-500 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-900 leading-relaxed text-base font-medium">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      <div className="w-full max-w-3xl">
        {user ? (
          <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-md">
            <p className="font-bold text-lg mb-4">レビューを書く</p>
            

            <div className="flex gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((num) => (
                <button key={num} onClick={() => setRating(num)} type="button" className="hover:scale-110 transition-transform">
                  <Star className={`w-10 h-10 ${num <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <textarea 
              className="w-full border border-gray-300 p-5 rounded-2xl text-base mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
              placeholder="このお酒の味や香りの感想を教えてください..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-indigo-900 text-white rounded-2xl font-bold text-lg hover:bg-indigo-800 transition disabled:opacity-50 shadow-lg"
            >
              {isSubmitting ? '送信中...' : '投稿する'}
            </button>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-[2rem] text-base text-gray-500 border border-gray-100">
            レビューを投稿するには
            <Link href="/login" className="underline cursor-pointer text-indigo-700 font-bold mx-2">ログイン</Link>
            が必要です
          </div>
        )}
      </div>
    </section>
  );
};

// メインページ
export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  const fetchSake = async () => {
    const sakeId = Number(id);
    if (!sakeId || isNaN(sakeId)) {
      setLoading(false);
      return;
    }

    const { data, error: sakeError } = await supabase
      .from('sakes')
      .select('*')
      .eq('id', sakeId)
      .single();

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    if (currentUser && data) {
      const { data: favData } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('sake_id', sakeId)
        .maybeSingle();
      
      if (favData) setIsFavorite(true);
    }

    if (sakeError) {
      console.error('データ取得エラー:', sakeError);
    } else if (data) {
      const sakeData = data as SakeDatabaseRow;
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent((sakeData.brewery || '') + ' ' + sakeData.name + ' 公式')}`;
      
      const mappedProduct: Product = {
        id: sakeData.id,
        name: sakeData.name,
        imageUrl: sakeData.image_url || 'https://placehold.co/800x800/e2e8f0/94a3b8?text=No+Image',
        storyContent: sakeData.description || '説明文が登録されていません。',
        tags: {
          taste: sakeData.taste || 'ー',
          polishing: 'ー',
          region: sakeData.prefecture || 'ー',
          priceRange: sakeData.price ? `¥${sakeData.price.toLocaleString()}` : 'ー',
        },
        recommendations: {
          cold: (sakeData.rec_cold as RecommendationLevel) || 'circle',
          room: (sakeData.rec_room as RecommendationLevel) || 'circle',
          hot: (sakeData.rec_hot as RecommendationLevel) || 'circle',
        },
        pairings: [
          { 
            name: sakeData.pairing_name || 'このお酒に合う料理', 
            type: (sakeData.pairing_type as 'fish' | 'cheese' | 'meat' | 'other') || 'other' 
          }
        ],
        officialUrl: sakeData.official_url || googleSearchUrl
      };
      setProduct(mappedProduct);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSake();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleFavorite = async () => {
    if (!user) {
      alert('お気に入り機能を使うにはログインが必要です');
      return;
    }

    const sakeId = Number(id);

    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('sake_id', sakeId);
      
      if (!error) setIsFavorite(false);
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, sake_id: sakeId });
      
      if (!error) setIsFavorite(true);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">読み込み中...</p></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">データが見つかりませんでした。</p><Link href="/list" className="ml-4 text-blue-600 underline">一覧へ戻る</Link></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full max-w-6xl mx-auto bg-white min-h-screen md:min-h-fit md:my-8 md:rounded-[2rem] md:shadow-2xl md:overflow-hidden pb-32 md:pb-16 relative">
        
        {/* ヘッダー */}
        <header className="flex justify-between items-center p-6 sticky top-0 bg-white/95 backdrop-blur-md z-20 border-b border-gray-100">
          <Link href="/list" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-7 h-7 text-gray-800" />
          </Link>
          <h1 className="font-bold text-xl tracking-wider font-sans">SAKE STORY</h1>
          
          <button 
            onClick={toggleFavorite}
            className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition"
          >
            <Heart 
              className={`w-7 h-7 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-800'}`} 
            />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 p-6 lg:p-12">
          {/* 左カラム: 画像 */}
          <div className="lg:col-span-5 relative">
             <div className="lg:sticky lg:top-32">
                <div className="aspect-[4/3] lg:aspect-square bg-gray-50 rounded-[2rem] overflow-hidden relative shadow-inner mb-6 lg:mb-0 border border-gray-100">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover mix-blend-multiply hover:scale-105 transition duration-700" />
                </div>
             </div>
          </div>

          {/* 右カラム: 情報 */}
          <div className="lg:col-span-7 space-y-12">
            <section className="text-center lg:text-left space-y-6">
              <div>
                <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight text-gray-900 leading-tight">{product.name}</h2>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-sm text-gray-600 font-bold">
                  <span className="bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">{product.tags.taste}</span>
                  <span className="bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">{product.tags.region}</span>
                  <span className="bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">{product.tags.priceRange}</span>
                </div>
              </div>
            </section>
            
            <StorySection markdown={product.storyContent} />
            
            <section className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch">
                <DrinkStyle recommendations={product.recommendations} />
                <Pairing pairings={product.pairings} />
              </div>
            </section>

            <ReviewSection sakeId={product.id} />
            
            <div className="hidden lg:flex justify-center pt-6 w-full">
              <a href={product.officialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full max-w-md bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-gray-800 transition transform active:scale-[0.98]">
                公式サイトへ移動 <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        {/* モバイル用固定ボタン */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-30 pb-8 safe-area-bottom">
          <a href={product.officialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full max-w-md mx-auto bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-gray-800 transition transform active:scale-[0.98]">
            公式サイトへ <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </main>
    </div>
  );
}

