'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { User, Star, LogOut, Heart, Trash2, Edit, X, ArrowLeft } from 'lucide-react';
import { myReviewListSchema, myFavoriteListSchema } from '../../src/lib/zod/schemas';

// 型定義：Zodから推論
import { z } from "zod";
import { myReviewSchema, myFavoriteSchema } from '../../src/lib/zod/schemas';
type ReviewWithSake = z.infer<typeof myReviewSchema>;
type FavoriteWithSake = z.infer<typeof myFavoriteSchema>;

export default function MyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'reviews' | 'favorites'>('reviews');
  const [userEmail, setUserEmail] = useState('');
  
  const [reviews, setReviews] = useState<ReviewWithSake[]>([]);
  const [favorites, setFavorites] = useState<FavoriteWithSake[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingReview, setEditingReview] = useState<ReviewWithSake | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  // データ取得関数を useCallback で安定化
  const fetchData = useCallback(async (userId: string, ignore: boolean) => {
    // レビュー取得
    const { data: reviewData, error: reviewError } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, sakes (id, name, image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!ignore) {
      if (reviewError) {
        console.error('レビュー取得エラー:', reviewError);
      } else if (reviewData) {
        const result = myReviewListSchema.safeParse(reviewData);
        if (result.success) setReviews(result.data);
      }
    }

    // お気に入り取得
    const { data: favData, error: favError } = await supabase
      .from('favorites')
      .select('id, created_at, sakes (id, name, image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!ignore) {
      if (favError) {
        console.error('お気に入り取得エラー:', favError);
      } else if (favData) {
        const result = myFavoriteListSchema.safeParse(favData);
        if (result.success) setFavorites(result.data);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (ignore) return;

      if (!user) {
        router.push('/login');
        return;
      }

      // setState を非同期の枠組みで実行して Cascading Renders を回避
      setUserEmail(user.email || 'ゲスト');
      void fetchData(user.id, ignore);
    };

    const timer = setTimeout(() => {
      void init();
    }, 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [router, fetchData]);

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await supabase.auth.signOut();
      router.push('/login');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('このレビューを削除してもよろしいですか？')) return;

    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

    if (error) {
      alert('削除に失敗しました: ' + error.message);
    } else {
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      alert('レビューを削除しました');
    }
  };

  const openEditModal = (review: ReviewWithSake) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    const { error } = await supabase
      .from('reviews')
      .update({ rating: editRating, comment: editComment })
      .eq('id', editingReview.id);

    if (error) {
      alert('更新に失敗しました: ' + error.message);
    } else {
      alert('レビューを更新しました');
      setEditingReview(null);
      // 再取得
      const { data: { user } } = await supabase.auth.getUser();
      if (user) void fetchData(user.id, false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-gray-50 md:py-6">
      <main className="w-full max-w-5xl bg-white min-h-screen md:min-h-fit md:h-auto shadow-lg relative flex flex-col md:rounded-2xl overflow-hidden mx-auto">
        
        <header className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition group">
            <ArrowLeft className="w-5 h-5 text-gray-800 group-hover:text-indigo-600 transition" />
          </Link>
          <h1 className="font-bold text-xl md:text-2xl text-gray-900 tracking-wide font-serif">マイページ</h1>
          <button onClick={handleLogout} className="p-2 -mr-2 hover:bg-red-50 rounded-full transition text-gray-600 hover:text-red-500" title="ログアウト">
            <LogOut className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </header>

        <section className="p-6 md:p-10 flex flex-col md:flex-row items-center gap-5 md:gap-8 border-b border-gray-100 bg-white">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-50 rounded-full flex items-center justify-center border-2 border-indigo-100 shadow-sm flex-shrink-0">
            <User className="w-10 h-10 md:w-12 md:h-12 text-indigo-300" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 break-all">{userEmail.split('@')[0]} 様</h2>
            <p className="text-sm md:text-base text-gray-500 font-medium">Email: {userEmail}</p>
          </div>
        </section>

        <div className="flex border-b border-gray-200 bg-white sticky top-[72px] z-10 shadow-sm">
          <button onClick={() => setActiveTab('reviews')} className={`flex-1 py-3 text-base md:text-lg font-bold text-center transition-colors relative ${activeTab === 'reviews' ? 'text-indigo-900' : 'text-gray-400 hover:text-gray-600'}`}>
            レビュー履歴
            {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-900 rounded-t-full mx-8 md:mx-16" />}
          </button>
          <button onClick={() => setActiveTab('favorites')} className={`flex-1 py-3 text-base md:text-lg font-bold text-center transition-colors relative ${activeTab === 'favorites' ? 'text-indigo-900' : 'text-gray-400 hover:text-gray-600'}`}>
            お気に入り
            {activeTab === 'favorites' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-900 rounded-t-full mx-8 md:mx-16" />}
          </button>
        </div>

        <div className="flex-1 bg-gray-50 p-5 md:p-10 min-h-[400px]">
          {activeTab === 'reviews' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <div className="bg-gray-200 p-5 rounded-full mb-3"><Star className="w-8 h-8 text-gray-400" /></div>
                  <p className="text-base">まだレビュー履歴はありません</p>
                  <Link href="/list" className="mt-5 text-indigo-600 underline text-sm font-bold">お酒を探しに行く</Link>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="block bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 relative group hover:shadow-md">
                    <div className="absolute top-5 right-5 flex gap-2">
                      <button onClick={() => openEditModal(review)} className="p-1.5 bg-gray-100 hover:bg-indigo-100 text-gray-500 hover:text-indigo-600 rounded-full transition" title="編集">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteReview(review.id)} className="p-1.5 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 rounded-full transition" title="削除">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Link href={`/list/${review.sakes?.id}`} className="flex flex-col md:flex-row items-start gap-5 md:gap-6 pr-0 md:pr-20">
                      <div className="w-full md:w-24 md:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center aspect-square md:aspect-auto">
                        {review.sakes?.image_url ? <img src={review.sakes.image_url} alt={review.sakes.name} className="w-full h-full object-cover mix-blend-multiply" /> : <span className="text-gray-400 text-xs">No Image</span>}
                      </div>
                      <div className="flex-1 min-w-0 py-0.5 w-full">
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 line-clamp-1 mb-2">{review.sakes?.name || '不明な銘柄'}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex text-yellow-400 gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 md:w-5 md:h-5 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />)}</div>
                          <span className="text-base md:text-lg font-bold ml-1 text-gray-700">{review.rating}</span>
                        </div>
                        <p className="text-sm md:text-base text-gray-700 line-clamp-3 leading-relaxed">{review.comment}</p>
                        <p className="text-right text-xs text-gray-400 mt-3 font-medium">{formatDate(review.created_at)}</p>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-6">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <div className="bg-gray-200 p-5 rounded-full mb-3"><Heart className="w-8 h-8 text-gray-400" /></div>
                  <p className="text-base">お気に入りはまだありません</p>
                  <Link href="/list" className="mt-6 px-6 py-3 bg-white border-2 border-indigo-900 text-indigo-900 rounded-full font-bold text-sm hover:bg-indigo-50 transition shadow-sm">お酒を探しに行く</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {favorites.map((fav) => (
                    <Link href={`/list/${fav.sakes?.id}`} key={fav.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                      <div className="aspect-square bg-gray-50 flex items-center justify-center relative p-3">
                        {fav.sakes?.image_url ? <img src={fav.sakes.image_url} alt={fav.sakes.name} className="w-full h-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105" /> : <span className="text-gray-400 text-xs">No Image</span>}
                        <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm"><Heart className="w-4 h-4 fill-red-500 text-red-500" /></div>
                      </div>
                      <div className="p-3 md:p-4">
                        <h3 className="font-bold text-sm md:text-base text-gray-900 line-clamp-1 mb-1 group-hover:text-indigo-700 transition">{fav.sakes?.name}</h3>
                        <p className="text-xs text-gray-400 text-right">{formatDate(fav.created_at)} 追加</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {editingReview && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
              <button onClick={() => setEditingReview(null)} className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
              <h2 className="text-xl font-bold mb-6 text-gray-900">レビューを編集</h2>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">評価</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button key={num} onClick={() => setEditRating(num)} className="focus:outline-none transition-transform hover:scale-110">
                      <Star className={`w-8 h-8 ${num <= editRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">コメント</label>
                <textarea 
                  value={editComment} 
                  onChange={(e) => setEditComment(e.target.value)} 
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none h-28 resize-none"
                  placeholder="感想を入力..."
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditingReview(null)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition">キャンセル</button>
                <button onClick={handleUpdateReview} className="flex-1 py-3 bg-indigo-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-800 shadow-lg transition">更新する</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

